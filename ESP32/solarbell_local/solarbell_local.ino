// SolarBell — campana autónoma, sin internet ni servidor.
//
// El ESP32 crea su propia red Wi-Fi (RED_NOMBRE). La app se une a ella y habla por HTTP con
// 192.168.4.1. El horario queda en la flash y la campana lo toca sola con su reloj, aunque el
// teléfono no vuelva a conectarse.
//
// LED:
//   parpadeo lento ......... sin hora: no toca el horario hasta que la app la ponga en hora
//   2 destellos cortos ..... se unió un teléfono o se guardó el horario
//   encendido fijo ......... toque en curso (uno por cada duración, con pausa apagado)
//
// Librerías (Arduino Library Manager):
//   - "ArduinoJson" de Benoit Blanchon (v7)
//   - "RTClib" de Adafruit, solo con USAR_DS3231
//
// `setup()`, `loop()`, las rutas y las claves JSON quedan en inglés: los exige Arduino y los
// comparte la app (`frontend/src/lib/device.ts`).

#if __has_include("configuracion.h")
#include "configuracion.h"
#else
#error "Falta configuracion.h: copia configuracion.ejemplo.h como configuracion.h y completa la red."
#endif

#include <ArduinoJson.h>
#include <ESPmDNS.h>
#include <LittleFS.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <esp_wifi.h>
#include <algorithm>
#include <sys/time.h>
#include <time.h>
#include <vector>

#ifdef USAR_DS3231
#include <RTClib.h>
#endif

#define VERSION_FIRMWARE "0.6.0"

static_assert(sizeof(RED_CLAVE) > 8, "RED_CLAVE necesita al menos 8 caracteres (WPA2)");

#if defined(WIFI_CASA_NOMBRE) && !defined(WIFI_CASA_CLAVE)
#error "Con WIFI_CASA_NOMBRE define también WIFI_CASA_CLAVE en configuracion.h"
#endif

// Nombre en la red local: la app encuentra la campana en http://solarbell.local sin saber su IP.
#define NOMBRE_MDNS "solarbell"

// Mismos límites que `frontend/src/features/schedule/bell.ts`. Toques y pausas en ms.
static const uint8_t MAX_TOQUES = 10;
static const int MS_MIN = 100;
static const int MS_MAX = 30000;
// Pausa fija de los horarios guardados por la versión 0.2, que no la configuraba.
static const uint16_t PAUSA_ANTERIOR_MS = 1000;

static const size_t MAX_HORARIO_BYTES = 24 * 1024;
// Wi-Fi de casa: tiempo máximo para unirse antes de dar la red por fallida, y redes que muestra el escaneo.
static const uint32_t UNIRSE_MAX_MS = 30000;
static const uint32_t ESCANEO_VIGENTE_MS = 30000;
static const size_t MAX_REDES_ESCANEO = 24;
// El reloj arranca en 1970: antes de esta fecha nadie lo ha puesto en hora.
static const time_t HORA_MINIMA_VALIDA = 1704067200;  // 2024-01-01
static const char *RUTA_HORARIO = "/horario.json";
static const char *RUTA_HORARIO_TEMPORAL = "/horario.tmp";

static const uint32_t DESTELLO_ENCENDIDO_MS = 80;
static const uint32_t DESTELLO_APAGADO_MS = 120;
static const uint8_t CANTIDAD_DESTELLOS = 2;
static const uint32_t SIN_HORA_ENCENDIDO_MS = 150;
static const uint32_t SIN_HORA_PERIODO_MS = 1500;
static const uint32_t REVISION_HORARIO_MS = 500;

WebServer servidor(80);
Preferences preferencias;
JsonDocument horario;
// Sube en cada PUT /api/schedule (semanal o fechas especiales). Vive en RAM: un reinicio
// vuelve a 0 y la app pide el horario al reconectar.
uint32_t revisionHorario = 0;
int32_t zonaMinutos = ZONA_MINUTOS;
volatile bool telefonoUnido = false;

#ifdef USAR_DS3231
RTC_DS3231 relojExterno;
bool hayRelojExterno = false;
#endif

// ---------- Relé simulado ----------

bool releEncendido = false;

void fijarRele(bool encender) {
  if (encender == releEncendido) return;
  releEncendido = encender;
#ifdef PIN_RELE
#if RELE_ACTIVO_EN_BAJO
  // Módulos de nivel bajo (transistor PNP a 5 V): con 3,3 V en IN no se apagan del todo.
  // Para apagar se suelta el pin y la resistencia del módulo lo sube a 5 V.
  if (encender) {
    digitalWrite(PIN_RELE, LOW);
    pinMode(PIN_RELE, OUTPUT);
  } else {
    pinMode(PIN_RELE, INPUT);
  }
#else
  digitalWrite(PIN_RELE, encender ? HIGH : LOW);
#endif
#endif
  Serial.printf("[rele] %s\n", encender ? "ON  (campana sonando)" : "OFF");
}

// ---------- Inversor (relé R1) ----------

// El relé R1 conecta los 12 V de la batería al inversor solo mientras dura un timbrado: el
// inversor encendido en vacío gasta más de lo que el panel repone.
#ifdef PIN_INVERSOR
#ifndef ARRANQUE_INVERSOR_MS
#define ARRANQUE_INVERSOR_MS 2000
#endif
static const uint32_t ARRANQUE_MS = ARRANQUE_INVERSOR_MS;
#else
static const uint32_t ARRANQUE_MS = 0;
#endif

bool inversorEncendido = false;

void fijarInversor(bool encender) {
#ifdef PIN_INVERSOR
  if (encender == inversorEncendido) return;
  inversorEncendido = encender;
#if INVERSOR_ACTIVO_EN_BAJO
  // Canal de nivel bajo con optoacoplador: se suelta el pin para apagar (con 3,3 V en alto
  // el optoacoplador puede quedar a medio encender) y se baja a 0 V para encender.
  if (encender) {
    digitalWrite(PIN_INVERSOR, LOW);
    pinMode(PIN_INVERSOR, OUTPUT);
  } else {
    pinMode(PIN_INVERSOR, INPUT);
  }
#else
  digitalWrite(PIN_INVERSOR, encender ? HIGH : LOW);
#endif
  Serial.printf("[inversor] %s\n", encender ? "ON" : "OFF");
#endif
}

// ---------- Destellos de aviso ----------

uint8_t pasosDestelloRestantes = 0;  // cada destello = 2 pasos (encendido, apagado)
uint32_t finPasoDestello = 0;

void iniciarDestellos() {
  pasosDestelloRestantes = CANTIDAD_DESTELLOS * 2;
  finPasoDestello = millis() + DESTELLO_ENCENDIDO_MS;
}

bool destellando() { return pasosDestelloRestantes > 0; }

bool ledDestelloEncendido() { return pasosDestelloRestantes % 2 == 0; }

void actualizarDestellos(uint32_t ahora) {
  if (!destellando() || (int32_t)(ahora - finPasoDestello) < 0) return;
  pasosDestelloRestantes--;
  finPasoDestello = ahora + (ledDestelloEncendido() ? DESTELLO_ENCENDIDO_MS : DESTELLO_APAGADO_MS);
}

// ---------- Secuencia de toques ----------

struct SecuenciaToque {
  bool activa = false;
  uint32_t id = 0;
  bool programado = false;
  char etiqueta[121] = "";
  uint8_t cantidad = 0;
  uint16_t duraciones[MAX_TOQUES];
  uint16_t pausas[MAX_TOQUES - 1];
  uint8_t indice = 0;
  bool faseEncendida = false;
  // Esperando a que el inversor arranque antes del primer toque.
  bool arrancando = false;
  // Momento del primer toque (tras el arranque del inversor).
  uint32_t inicio = 0;
  uint32_t finFase = 0;
} toque;

uint32_t ultimoIdToque = 0;

void iniciarFase(bool encendida, uint32_t ahora) {
  toque.faseEncendida = encendida;
  fijarRele(encendida);
  if (encendida) {
    Serial.printf("[toque] %u de %u: %u ms\n", toque.indice + 1, toque.cantidad,
                  toque.duraciones[toque.indice]);
    toque.finFase = ahora + toque.duraciones[toque.indice];
  } else {
    toque.finFase = ahora + toque.pausas[toque.indice];
  }
}

void terminarToque(const char *motivo) {
  fijarRele(false);
  fijarInversor(false);
  toque.activa = false;
  toque.arrancando = false;
  Serial.printf("[toque] #%lu %s\n", (unsigned long)toque.id, motivo);
}

void actualizarToque(uint32_t ahora) {
  if (!toque.activa || (int32_t)(ahora - toque.finFase) < 0) return;
  if (toque.arrancando) {
    toque.arrancando = false;
    iniciarFase(true, ahora);
    return;
  }
  if (toque.faseEncendida) {
    if (toque.indice + 1 >= toque.cantidad) {
      terminarToque("terminado");
      return;
    }
    iniciarFase(false, ahora);
    return;
  }
  toque.indice++;
  iniciarFase(true, ahora);
}

bool msValido(JsonVariantConst valor) {
  if (!valor.is<int>()) return false;
  int ms = valor.as<int>();
  return ms >= MS_MIN && ms <= MS_MAX;
}

bool listaMsValida(JsonVariantConst valor, size_t largo) {
  if (!valor.is<JsonArrayConst>()) return false;
  JsonArrayConst lista = valor.as<JsonArrayConst>();
  if (lista.size() != largo) return false;
  for (JsonVariantConst ms : lista) {
    if (!msValido(ms)) return false;
  }
  return true;
}

// `rings`, `ringMs`, `pauseMs`, `customDurations` y `customPauses`: lo que comparten un timbrado y
// un toque manual. Las listas propias van juntas: una por toque y una por pausa.
bool configToqueValida(JsonVariantConst config) {
  int toques = config["rings"] | 0;
  if (toques < 1 || toques > MAX_TOQUES) return false;
  if (!msValido(config["ringMs"]) || !msValido(config["pauseMs"])) return false;
  JsonVariantConst duraciones = config["customDurations"];
  JsonVariantConst pausas = config["customPauses"];
  if (duraciones.isNull() && pausas.isNull()) return true;
  return listaMsValida(duraciones, toques) && listaMsValida(pausas, toques - 1);
}

uint8_t leerToque(JsonVariantConst config, uint16_t *duraciones, uint16_t *pausas) {
  uint8_t cantidad = constrain(config["rings"] | 0, 0, (int)MAX_TOQUES);
  int duracion = constrain(config["ringMs"] | 1000, MS_MIN, MS_MAX);
  int pausa = constrain(config["pauseMs"] | 1000, MS_MIN, MS_MAX);
  JsonArrayConst propias = config["customDurations"].as<JsonArrayConst>();
  JsonArrayConst pausasPropias = config["customPauses"].as<JsonArrayConst>();
  for (uint8_t i = 0; i < cantidad; i++) {
    int ms = propias.isNull() ? duracion : (propias[i] | duracion);
    duraciones[i] = constrain(ms, MS_MIN, MS_MAX);
    if (i + 1 >= cantidad) break;
    ms = pausasPropias.isNull() ? pausa : (pausasPropias[i] | pausa);
    pausas[i] = constrain(ms, MS_MIN, MS_MAX);
  }
  return cantidad;
}

bool iniciarToque(JsonVariantConst config, bool programado) {
  uint16_t duraciones[MAX_TOQUES];
  uint16_t pausas[MAX_TOQUES - 1];
  uint8_t cantidad = leerToque(config, duraciones, pausas);
  if (cantidad == 0) return false;
  if (toque.activa) terminarToque("reemplazado");

  toque.id = ++ultimoIdToque;
  toque.programado = programado;
  strlcpy(toque.etiqueta, config["label"] | "", sizeof toque.etiqueta);
  toque.cantidad = cantidad;
  memcpy(toque.duraciones, duraciones, sizeof duraciones);
  memcpy(toque.pausas, pausas, sizeof pausas);
  toque.indice = 0;
  toque.activa = true;
  uint32_t ahora = millis();
  toque.inicio = ahora + ARRANQUE_MS;
  Serial.printf("[toque] #%lu %s: %u toques\n", (unsigned long)toque.id,
                programado ? "programado" : "manual", cantidad);
  fijarInversor(true);
  if (ARRANQUE_MS > 0) {
    toque.arrancando = true;
    toque.faseEncendida = false;
    toque.finFase = toque.inicio;
  } else {
    iniciarFase(true, ahora);
  }
  return true;
}

// ---------- Reloj ----------

bool horaValida() { return time(nullptr) >= HORA_MINIMA_VALIDA; }

int64_t ahoraEpochMs() {
  struct timeval tv;
  gettimeofday(&tv, nullptr);
  return (int64_t)tv.tv_sec * 1000 + tv.tv_usec / 1000;
}

bool horaLocal(struct tm &salida) {
  time_t ahora = time(nullptr);
  if (ahora < HORA_MINIMA_VALIDA) return false;
  time_t local = ahora + (time_t)zonaMinutos * 60;
  gmtime_r(&local, &salida);
  return true;
}

void fijarHora(int64_t epochMs) {
  struct timeval tv;
  tv.tv_sec = (time_t)(epochMs / 1000);
  tv.tv_usec = (suseconds_t)((epochMs % 1000) * 1000);
  settimeofday(&tv, nullptr);
#ifdef USAR_DS3231
  if (hayRelojExterno) relojExterno.adjust(DateTime((uint32_t)tv.tv_sec));
#endif
}

void cargarHora() {
#ifdef USAR_DS3231
  hayRelojExterno = relojExterno.begin();
  if (!hayRelojExterno) {
    Serial.println("[reloj] el DS3231 no responde");
  } else if (relojExterno.lostPower()) {
    Serial.println("[reloj] el DS3231 perdió la hora");
  } else {
    struct timeval tv = {(time_t)relojExterno.now().unixtime(), 0};
    settimeofday(&tv, nullptr);
  }
#endif
  Serial.println(horaValida() ? "[reloj] en hora" : "[reloj] sin hora: conecta la app");
}

// ---------- Horario ----------

bool esDigito(char c) { return c >= '0' && c <= '9'; }

bool horaTextoValida(const char *texto) {
  if (strlen(texto) != 5 || texto[2] != ':') return false;
  if (!esDigito(texto[0]) || !esDigito(texto[1]) || !esDigito(texto[3]) || !esDigito(texto[4]))
    return false;
  int horas = (texto[0] - '0') * 10 + (texto[1] - '0');
  int minutos = (texto[3] - '0') * 10 + (texto[4] - '0');
  return horas < 24 && minutos < 60;
}

bool fechaTextoValida(const char *texto) {
  if (strlen(texto) != 10 || texto[4] != '-' || texto[7] != '-') return false;
  for (uint8_t i = 0; i < 10; i++) {
    if (i != 4 && i != 7 && !esDigito(texto[i])) return false;
  }
  return true;
}

bool timbradoValido(JsonVariantConst timbrado) {
  if (!timbrado["id"].is<const char *>() || !horaTextoValida(timbrado["time"] | "")) return false;
  if (!timbrado["label"].isNull() && !timbrado["label"].is<const char *>()) return false;
  return configToqueValida(timbrado);
}

bool timbradosValidos(JsonVariantConst lista) {
  if (!lista.is<JsonArrayConst>()) return false;
  for (JsonVariantConst timbrado : lista.as<JsonArrayConst>()) {
    if (!timbradoValido(timbrado)) return false;
  }
  return true;
}

// Mismo formato que `ScheduleState` en `frontend/src/features/schedule/types.ts`.
bool horarioValido(JsonVariantConst raiz) {
  JsonVariantConst semanal = raiz["weekly"];
  if (!semanal["days"].is<JsonArrayConst>()) return false;
  for (JsonVariantConst dia : semanal["days"].as<JsonArrayConst>()) {
    if (!dia.is<int>() || dia.as<int>() < 0 || dia.as<int>() > 6) return false;
  }
  if (!timbradosValidos(semanal["bells"])) return false;

  if (!raiz["specials"].is<JsonArrayConst>()) return false;
  for (JsonVariantConst especial : raiz["specials"].as<JsonArrayConst>()) {
    const char *modo = especial["mode"] | "";
    if (!especial["id"].is<const char *>() || !fechaTextoValida(especial["date"] | "")) return false;
    if (strcmp(modo, "custom") != 0 && strcmp(modo, "off") != 0) return false;
    if (!timbradosValidos(especial["bells"])) return false;
  }
  return true;
}

void horarioPorDefecto(JsonDocument &doc) {
  static const char *etiquetas[] = {"Primera hora", "Segunda hora", "Tercera hora"};
  static const char *horas[] = {"08:00", "10:00", "12:00"};
  doc.clear();
  JsonObject semanal = doc["weekly"].to<JsonObject>();
  JsonArray dias = semanal["days"].to<JsonArray>();
  for (int dia = 1; dia <= 5; dia++) dias.add(dia);
  JsonArray timbrados = semanal["bells"].to<JsonArray>();
  for (uint8_t i = 0; i < 3; i++) {
    JsonObject timbrado = timbrados.add<JsonObject>();
    timbrado["id"] = String("inicial-") + (i + 1);
    timbrado["label"] = etiquetas[i];
    timbrado["time"] = horas[i];
    timbrado["rings"] = 3;
    timbrado["ringMs"] = 3000;
    timbrado["pauseMs"] = PAUSA_ANTERIOR_MS;
    timbrado["customDurations"] = nullptr;
    timbrado["customPauses"] = nullptr;
  }
  doc["specials"].to<JsonArray>();
}

// La versión 0.2 guardaba `ringSeconds` y `customDurations` en segundos, con pausa fija.
bool migrarTimbrados(JsonArray timbrados) {
  bool migrado = false;
  for (JsonObject timbrado : timbrados) {
    if (timbrado["ringMs"].is<int>()) continue;
    int toques = timbrado["rings"] | 0;
    timbrado["ringMs"] = (timbrado["ringSeconds"] | 3) * 1000;
    timbrado["pauseMs"] = PAUSA_ANTERIOR_MS;
    timbrado.remove("ringSeconds");
    JsonArray duraciones = timbrado["customDurations"].as<JsonArray>();
    if (duraciones.isNull()) {
      timbrado["customPauses"] = nullptr;
    } else {
      for (JsonVariant segundos : duraciones) segundos.set(segundos.as<int>() * 1000);
      JsonArray pausas = timbrado["customPauses"].to<JsonArray>();
      for (int i = 1; i < toques; i++) pausas.add(PAUSA_ANTERIOR_MS);
    }
    migrado = true;
  }
  return migrado;
}

bool migrarHorario(JsonDocument &doc) {
  bool migrado = migrarTimbrados(doc["weekly"]["bells"].as<JsonArray>());
  for (JsonObject especial : doc["specials"].as<JsonArray>()) {
    if (migrarTimbrados(especial["bells"].as<JsonArray>())) migrado = true;
  }
  return migrado;
}

bool leerHorario(const char *ruta, JsonDocument &doc, bool &migrado) {
  if (!LittleFS.exists(ruta)) return false;
  File archivo = LittleFS.open(ruta, "r");
  if (!archivo) return false;
  DeserializationError error = deserializeJson(doc, archivo);
  archivo.close();
  if (error) return false;
  migrado = migrarHorario(doc);
  return horarioValido(doc.as<JsonVariantConst>());
}

// Se escribe aparte y se renombra: un corte a mitad no deja el horario a medias.
bool guardarHorario(JsonDocument &doc) {
  File archivo = LittleFS.open(RUTA_HORARIO_TEMPORAL, "w");
  if (!archivo) return false;
  size_t escritos = serializeJson(doc, archivo);
  archivo.close();
  if (escritos == 0) return false;
  if (LittleFS.rename(RUTA_HORARIO_TEMPORAL, RUTA_HORARIO)) return true;
  LittleFS.remove(RUTA_HORARIO);
  return LittleFS.rename(RUTA_HORARIO_TEMPORAL, RUTA_HORARIO);
}

void cargarHorario() {
  bool migrado = false;
  if (leerHorario(RUTA_HORARIO, horario, migrado) ||
      leerHorario(RUTA_HORARIO_TEMPORAL, horario, migrado)) {
    Serial.println("[horario] cargado de la memoria");
    if (migrado && guardarHorario(horario)) Serial.println("[horario] pasado a milisegundos");
    return;
  }
  Serial.println("[horario] sin horario guardado: lunes a viernes 8:00, 10:00 y 12:00");
  horarioPorDefecto(horario);
  guardarHorario(horario);
}

// Misma regla que `dayPlan` en `frontend/src/features/schedule/upcoming.ts`.
JsonArrayConst timbradosDelDia(const struct tm &dia) {
  char fecha[11];
  snprintf(fecha, sizeof fecha, "%04d-%02d-%02d", dia.tm_year + 1900, dia.tm_mon + 1, dia.tm_mday);
  for (JsonVariantConst especial : horario["specials"].as<JsonArrayConst>()) {
    if (strcmp(especial["date"] | "", fecha) != 0) continue;
    if (strcmp(especial["mode"] | "", "off") == 0) return JsonArrayConst();
    return especial["bells"].as<JsonArrayConst>();
  }
  // `tm_wday` y `Date#getDay()` coinciden: 0 = domingo.
  for (JsonVariantConst diaSemana : horario["weekly"]["days"].as<JsonArrayConst>()) {
    if (diaSemana.as<int>() == dia.tm_wday) return horario["weekly"]["bells"].as<JsonArrayConst>();
  }
  return JsonArrayConst();
}

char ultimoMinutoRevisado[17] = "";
// Persistido: si el ESP32 se reinicia dentro del mismo minuto, el timbrado no se repite.
char ultimoMinutoTocado[17] = "";
uint32_t ultimaRevision = 0;

void revisarHorario(uint32_t ahora) {
  if (ahora - ultimaRevision < REVISION_HORARIO_MS) return;
  ultimaRevision = ahora;

  struct tm local;
  if (!horaLocal(local)) return;
  char minuto[17];
  snprintf(minuto, sizeof minuto, "%04d-%02d-%02d %02d:%02d", local.tm_year + 1900,
           local.tm_mon + 1, local.tm_mday, local.tm_hour, local.tm_min);
  if (strcmp(minuto, ultimoMinutoRevisado) == 0) return;
  strlcpy(ultimoMinutoRevisado, minuto, sizeof ultimoMinutoRevisado);
  if (strcmp(minuto, ultimoMinutoTocado) == 0) return;

  const char *hora = minuto + 11;
  for (JsonVariantConst timbrado : timbradosDelDia(local)) {
    if (strcmp(timbrado["time"] | "", hora) != 0) continue;
    if (!iniciarToque(timbrado, true)) continue;
    strlcpy(ultimoMinutoTocado, minuto, sizeof ultimoMinutoTocado);
    preferencias.putString("ultimo", minuto);
    return;
  }
}

// ---------- API HTTP ----------

void responder(int codigo, JsonDocument &doc) {
  String cuerpo;
  serializeJson(doc, cuerpo);
  servidor.send(codigo, "application/json", cuerpo);
}

void responderError(int codigo, const char *detalle) {
  JsonDocument doc;
  doc["detail"] = detalle;
  responder(codigo, doc);
}

bool leerCuerpo(JsonDocument &doc) {
  if (!servidor.hasArg("plain")) {
    responderError(400, "Falta el cuerpo");
    return false;
  }
  String cuerpo = servidor.arg("plain");
  if (cuerpo.length() > MAX_HORARIO_BYTES) {
    responderError(413, "El horario es demasiado grande");
    return false;
  }
  if (deserializeJson(doc, cuerpo)) {
    responderError(400, "JSON inválido");
    return false;
  }
  return true;
}

void responderEstado() {
  JsonDocument doc;
  doc["firmware"] = VERSION_FIRMWARE;
  doc["clockSet"] = horaValida();
  if (horaValida()) doc["now"] = ahoraEpochMs();
  else doc["now"] = nullptr;
  doc["offsetMinutes"] = zonaMinutos;
  doc["scheduleRevision"] = revisionHorario;
  if (!toque.activa) {
    doc["run"] = nullptr;
  } else {
    JsonObject run = doc["run"].to<JsonObject>();
    run["id"] = toque.id;
    run["source"] = toque.programado ? "scheduled" : "manual";
    run["label"] = toque.etiqueta;
    JsonArray duraciones = run["durations"].to<JsonArray>();
    for (uint8_t i = 0; i < toque.cantidad; i++) duraciones.add(toque.duraciones[i]);
    JsonArray pausas = run["pauses"].to<JsonArray>();
    for (uint8_t i = 0; i + 1 < toque.cantidad; i++) pausas.add(toque.pausas[i]);
    // El reloj de la campana puede no estar en hora: la app calcula inicio y fin con el suyo.
    // Mientras arranca el inversor todavía no ha sonado nada: cuenta como 0.
    int32_t transcurrido = (int32_t)(millis() - toque.inicio);
    run["elapsedMs"] = transcurrido < 0 ? 0 : transcurrido;
  }
  responder(200, doc);
}

void alGuardarHorario() {
  JsonDocument nuevo;
  if (!leerCuerpo(nuevo)) return;
  if (!horarioValido(nuevo.as<JsonVariantConst>())) {
    responderError(422, "Horario inválido");
    return;
  }
  if (!guardarHorario(nuevo)) {
    responderError(500, "No se pudo guardar en la memoria");
    return;
  }
  horario = std::move(nuevo);
  revisionHorario++;
  iniciarDestellos();
  Serial.println("[horario] guardado");
  responder(200, horario);
}

void alFijarHora() {
  JsonDocument doc;
  if (!leerCuerpo(doc)) return;
  if (!doc["now"].is<int64_t>() || doc["now"].as<int64_t>() / 1000 < HORA_MINIMA_VALIDA) {
    responderError(422, "Hora inválida");
    return;
  }
  if (doc["offsetMinutes"].is<int>()) {
    int zona = doc["offsetMinutes"].as<int>();
    if (zona >= -720 && zona <= 840 && zona != zonaMinutos) {
      zonaMinutos = zona;
      preferencias.putInt("zona", zona);
    }
  }
  fijarHora(doc["now"].as<int64_t>());
  Serial.println("[reloj] puesto en hora desde la app");
  responderEstado();
}

void alTocar() {
  JsonDocument doc;
  if (!leerCuerpo(doc)) return;
  if (!configToqueValida(doc.as<JsonVariantConst>()) ||
      !iniciarToque(doc.as<JsonVariantConst>(), false)) {
    responderError(422, "Toque inválido");
    return;
  }
  responderEstado();
}

void alDetener() {
  if (toque.activa) terminarToque("detenido");
  responderEstado();
}

// ---------- Wi-Fi de casa (elegida desde la app) ----------

// La campana sigue creando RED_NOMBRE y además se une a una red del router. La red se elige
// desde la app (escaneo + clave) y queda en la flash. WIFI_CASA_NOMBRE/CLAVE de configuracion.h
// solo la siembra la primera vez que cambia; después manda lo que diga la app.
enum EstadoCasa : uint8_t { CASA_SIN_RED, CASA_CONECTANDO, CASA_CONECTADA, CASA_FALLO };

char casaSsid[33] = "";    // red guardada en la flash
char casaClave[64] = "";
char intentoSsid[33] = "";  // red que se está probando (o que falló)
char intentoClave[64] = "";
bool intentoNuevo = false;  // true mientras se prueba una red que aún no se guardó
EstadoCasa estadoCasa = CASA_SIN_RED;
uint32_t casaDesde = 0;
String casaError = "";
uint32_t escaneoDesde = 0;
// El escaneo falla mientras la STA reintenta unirse a una red que no responde: se pausa el intento.
bool redPausada = false;
volatile bool casaObtuvoIp = false;
volatile uint8_t ultimoMotivoCaida = 0;
// Diagnóstico del último intento: se asoció al router (sin IP aún) o ni siquiera arrancó.
volatile bool casaAsociada = false;
bool inicioFallido = false;

void cargarRedCasa() {
#ifdef WIFI_CASA_NOMBRE
  if (preferencias.getString("wsembrada", "") != WIFI_CASA_NOMBRE) {
    preferencias.putString("wssid", WIFI_CASA_NOMBRE);
    preferencias.putString("wclave", WIFI_CASA_CLAVE);
    preferencias.putString("wsembrada", WIFI_CASA_NOMBRE);
  }
#else
  // Se quitó la red de configuracion.h: si la guardada sigue siendo esa misma, se borra de la flash.
  if (preferencias.isKey("wsembrada")) {
    if (preferencias.getString("wssid", "") == preferencias.getString("wsembrada", "")) {
      preferencias.remove("wssid");
      preferencias.remove("wclave");
    }
    preferencias.remove("wsembrada");
  }
#endif
  preferencias.getString("wssid", casaSsid, sizeof casaSsid);
  preferencias.getString("wclave", casaClave, sizeof casaClave);
}

void unirseARed(const char *ssid, const char *clave) {
  strlcpy(intentoSsid, ssid, sizeof intentoSsid);
  casaError = "";
  estadoCasa = CASA_CONECTANDO;
  casaDesde = millis();
  ultimoMotivoCaida = 0;
  casaAsociada = false;
  inicioFallido = false;
  // Un escaneo en curso o un intento anterior a medias hacen que el ESP32 rechace el nuevo.
  if (WiFi.scanComplete() == WIFI_SCAN_RUNNING) esp_wifi_scan_stop();
  WiFi.scanDelete();
  WiFi.disconnect(false, false);
  delay(100);
  wl_status_t inicio = WiFi.begin(ssid, clave[0] ? clave : nullptr);
  if (inicio == WL_CONNECT_FAILED) {
    delay(500);
    inicio = WiFi.begin(ssid, clave[0] ? clave : nullptr);
  }
  Serial.printf("[red] uniéndose a \"%s\" (clave de %u caracteres, begin=%d)...\n", ssid,
                (unsigned)strlen(clave), (int)inicio);
  if (inicio == WL_CONNECT_FAILED) {
    // Sin intento en marcha no llegará ningún evento: se da por fallido en el próximo loop.
    inicioFallido = true;
    casaDesde = millis() - UNIRSE_MAX_MS;
  }
}

void reanudarRedCasa() {
  if (!redPausada) return;
  redPausada = false;
  if (!intentoNuevo && casaSsid[0] && !WiFi.isConnected()) unirseARed(casaSsid, casaClave);
}

const char *textoMotivo(uint8_t motivo) {
  switch (motivo) {
    case WIFI_REASON_NO_AP_FOUND:
      return "No se encontró la red (¿está lejos o es de 5 GHz?)";
    case WIFI_REASON_NO_AP_FOUND_W_COMPATIBLE_SECURITY:
    case WIFI_REASON_NO_AP_FOUND_IN_AUTHMODE_THRESHOLD:
      return "La seguridad de la red no es compatible";
    case WIFI_REASON_NO_AP_FOUND_IN_RSSI_THRESHOLD:
    case WIFI_REASON_BEACON_TIMEOUT:
      return "La señal de la red es muy débil";
    case WIFI_REASON_AUTH_FAIL:
    case WIFI_REASON_AUTH_EXPIRE:
    case WIFI_REASON_HANDSHAKE_TIMEOUT:
    case WIFI_REASON_4WAY_HANDSHAKE_TIMEOUT:
      return "Clave incorrecta";
    default:
      return "No se pudo unir a la red";
  }
}

void revisarRedCasa() {
  // Hora fresca: el `ahora` del loop es anterior a los pedidos HTTP de esta vuelta, y un intento
  // empezado en esa misma vuelta daría una resta negativa (enorme en uint32_t) y fallaría al acto.
  uint32_t ahora = millis();
  // Si nadie recogió el escaneo, no se deja la campana sin intentar su red para siempre.
  if (redPausada && ahora - escaneoDesde > ESCANEO_VIGENTE_MS && WiFi.scanComplete() != WIFI_SCAN_RUNNING) {
    WiFi.scanDelete();
    reanudarRedCasa();
  }
  if (casaObtuvoIp) {
    casaObtuvoIp = false;
    if (intentoNuevo) {
      // Recién ahora la red es buena: se guarda para los próximos arranques.
      strlcpy(casaSsid, intentoSsid, sizeof casaSsid);
      strlcpy(casaClave, intentoClave, sizeof casaClave);
      preferencias.putString("wssid", casaSsid);
      preferencias.putString("wclave", casaClave);
      intentoNuevo = false;
    }
    strlcpy(intentoSsid, casaSsid, sizeof intentoSsid);
    estadoCasa = CASA_CONECTADA;
    casaError = "";
    Serial.printf("[red] unida a \"%s\", IP http://%s (o http://%s.local)\n", casaSsid,
                  WiFi.localIP().toString().c_str(), NOMBRE_MDNS);
  }
  if (estadoCasa == CASA_CONECTANDO && ahora - casaDesde >= UNIRSE_MAX_MS) {
    estadoCasa = CASA_FALLO;
    // El detalle exacto ayuda a diagnosticar desde la app sin el monitor serie.
    if (inicioFallido) {
      casaError = "La campana no pudo iniciar la conexión";
    } else if (ultimoMotivoCaida) {
      casaError = textoMotivo(ultimoMotivoCaida);
      casaError += " (código " + String(ultimoMotivoCaida) + ")";
    } else if (casaAsociada) {
      casaError = "Se unió a la red, pero no recibió dirección IP";
    } else {
      casaError = "No se pudo unir a la red (sin respuesta de la red)";
    }
    Serial.printf("[red] no se pudo unir a \"%s\": %s\n", intentoSsid, casaError.c_str());
    if (intentoNuevo) {
      // La red nueva no sirvió: se vuelve a la anterior, si había.
      intentoNuevo = false;
      if (casaSsid[0]) WiFi.begin(casaSsid, casaClave[0] ? casaClave : nullptr);
      else WiFi.disconnect(false, true);
    }
  }
}

const char *nombreEstadoCasa() {
  // Si el router se cae después de unida, vuelve a "connecting" mientras reintenta sola.
  if (estadoCasa == CASA_CONECTADA && !WiFi.isConnected()) return "connecting";
  switch (estadoCasa) {
    case CASA_CONECTANDO: return "connecting";
    case CASA_CONECTADA: return "connected";
    case CASA_FALLO: return "failed";
    default: return "none";
  }
}

void responderRed() {
  JsonDocument doc;
  doc["state"] = nombreEstadoCasa();
  doc["ssid"] = estadoCasa == CASA_SIN_RED ? "" : intentoSsid;
  if (estadoCasa == CASA_CONECTADA && WiFi.isConnected()) {
    doc["ip"] = WiFi.localIP().toString();
    doc["rssi"] = WiFi.RSSI();
  } else {
    doc["ip"] = nullptr;
  }
  doc["hostname"] = NOMBRE_MDNS ".local";
  if (estadoCasa == CASA_FALLO) doc["error"] = casaError;
  responder(200, doc);
}

struct RedEscaneada {
  String ssid;
  int32_t rssi;
  bool segura;
};

void alBuscarRedes() {
  int16_t n = WiFi.scanComplete();
  if (n >= 0 && millis() - escaneoDesde > ESCANEO_VIGENTE_MS) {
    // Resultado viejo que nadie recogió: se descarta y se escanea de nuevo.
    WiFi.scanDelete();
    n = WIFI_SCAN_FAILED;
  }
  JsonDocument doc;
  if (n == WIFI_SCAN_RUNNING || n < 0) {
    if (n != WIFI_SCAN_RUNNING) {
      if (!WiFi.isConnected() && !intentoNuevo) {
        // Sin red unida, la STA queda reintentando y el escaneo falla: se corta el intento un momento.
        WiFi.disconnect(false, false);
        redPausada = true;
        delay(300);
      }
      escaneoDesde = millis();
      if (WiFi.scanNetworks(true) == WIFI_SCAN_FAILED) {
        reanudarRedCasa();
        responderError(500, "No se pudo buscar redes");
        return;
      }
    }
    doc["scanning"] = true;
    doc["networks"].to<JsonArray>();
    responder(200, doc);
    return;
  }

  std::vector<RedEscaneada> redes;
  for (int16_t i = 0; i < n; i++) {
    String ssid = WiFi.SSID(i);
    if (ssid.isEmpty()) continue;
    int32_t rssi = WiFi.RSSI(i);
    bool segura = WiFi.encryptionType(i) != WIFI_AUTH_OPEN;
    auto repetida = std::find_if(redes.begin(), redes.end(), [&](const RedEscaneada &r) { return r.ssid == ssid; });
    if (repetida == redes.end()) redes.push_back({ssid, rssi, segura});
    else if (rssi > repetida->rssi) repetida->rssi = rssi;
  }
  WiFi.scanDelete();
  reanudarRedCasa();
  std::sort(redes.begin(), redes.end(), [](const RedEscaneada &a, const RedEscaneada &b) { return a.rssi > b.rssi; });
  if (redes.size() > MAX_REDES_ESCANEO) redes.resize(MAX_REDES_ESCANEO);

  doc["scanning"] = false;
  JsonArray lista = doc["networks"].to<JsonArray>();
  for (const RedEscaneada &r : redes) {
    JsonObject red = lista.add<JsonObject>();
    red["ssid"] = r.ssid;
    red["rssi"] = r.rssi;
    red["secure"] = r.segura;
  }
  responder(200, doc);
}

void alGuardarRed() {
  JsonDocument doc;
  if (!leerCuerpo(doc)) return;
  const char *ssid = doc["ssid"].is<const char *>() ? doc["ssid"].as<const char *>() : "";
  const char *clave = doc["password"].is<const char *>() ? doc["password"].as<const char *>() : "";
  size_t largoSsid = strlen(ssid);
  size_t largoClave = strlen(clave);
  // WPA2: la clave mide de 8 a 63; una red abierta no lleva clave.
  if (largoSsid < 1 || largoSsid > 32 || (largoClave != 0 && (largoClave < 8 || largoClave > 63))) {
    responderError(422, "Nombre o clave de red inválidos");
    return;
  }
  WiFi.scanDelete();
  redPausada = false;
  strlcpy(intentoClave, clave, sizeof intentoClave);
  intentoNuevo = true;
  unirseARed(ssid, intentoClave);
  Serial.println("[red] red nueva pedida desde la app");
  JsonDocument respuesta;
  respuesta["state"] = "connecting";
  respuesta["ssid"] = ssid;
  respuesta["ip"] = nullptr;
  respuesta["hostname"] = NOMBRE_MDNS ".local";
  responder(202, respuesta);
}

void alOlvidarRed() {
  preferencias.remove("wssid");
  preferencias.remove("wclave");
  casaSsid[0] = '\0';
  casaClave[0] = '\0';
  intentoSsid[0] = '\0';
  intentoNuevo = false;
  redPausada = false;
  estadoCasa = CASA_SIN_RED;
  casaError = "";
  WiFi.disconnect(false, true);
  Serial.println("[red] red de casa olvidada");
  responderRed();
}

void iniciarApi() {
  servidor.on("/api/status", HTTP_GET, responderEstado);
  servidor.on("/api/schedule", HTTP_GET, [] { responder(200, horario); });
  servidor.on("/api/schedule", HTTP_PUT, alGuardarHorario);
  servidor.on("/api/clock", HTTP_POST, alFijarHora);
  servidor.on("/api/ring", HTTP_POST, alTocar);
  servidor.on("/api/ring/stop", HTTP_POST, alDetener);
  servidor.on("/api/wifi", HTTP_GET, responderRed);
  servidor.on("/api/wifi", HTTP_PUT, alGuardarRed);
  servidor.on("/api/wifi/scan", HTTP_GET, alBuscarRedes);
  servidor.on("/api/wifi/forget", HTTP_POST, alOlvidarRed);
  servidor.onNotFound([] { responderError(404, "No existe"); });
  servidor.begin();
}

// ---------- Red ----------

bool mdnsActivo = false;

void alEventoWifi(arduino_event_id_t evento, arduino_event_info_t info) {
  switch (evento) {
    case ARDUINO_EVENT_WIFI_AP_STACONNECTED:
      telefonoUnido = true;
      break;
    case ARDUINO_EVENT_WIFI_STA_CONNECTED:
      casaAsociada = true;
      break;
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      casaObtuvoIp = true;
      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED: {
      uint8_t motivo = info.wifi_sta_disconnected.reason;
      // ASSOC_LEAVE y STA_LEAVING son cortes que pide el propio ESP32 (escaneo, red nueva,
      // reintento del núcleo): no son el motivo del fallo.
      if (motivo != WIFI_REASON_ASSOC_LEAVE && motivo != WIFI_REASON_STA_LEAVING) ultimoMotivoCaida = motivo;
      Serial.printf("[red] desconectada de la red de casa, motivo %u (%s)\n", motivo,
                    WiFi.STA.disconnectReasonName((wifi_err_reason_t)motivo));
      break;
    }
    default:
      break;
  }
  // Diagnóstico: todo evento del Wi-Fi menos las sondas, que llegan a cada rato.
  if (evento != ARDUINO_EVENT_WIFI_AP_PROBEREQRECVED) {
    Serial.printf("[red] evento %d: %s\n", (int)evento, Network.eventName(evento));
  }
}

void iniciarRed() {
  static bool eventosRegistrados = false;
  if (!eventosRegistrados) {
    eventosRegistrados = true;
    WiFi.onEvent(alEventoWifi);
  }
  // Modo mixto: crea RED_NOMBRE y puede unirse a la red de casa (solo 2.4 GHz).
  WiFi.persistent(false);  // las credenciales las guarda este firmware, no el núcleo del ESP32
  WiFi.setHostname(NOMBRE_MDNS);
  WiFi.mode(WIFI_AP_STA);
  if (!WiFi.softAP(RED_NOMBRE, RED_CLAVE)) {
    Serial.println("[red] no se pudo crear la red");
    return;
  }
  Serial.printf("[red] %s en http://%s\n", RED_NOMBRE, WiFi.softAPIP().toString().c_str());
  WiFi.setAutoReconnect(true);

  mdnsActivo = MDNS.begin(NOMBRE_MDNS);
  if (mdnsActivo) {
    MDNS.addService("http", "tcp", 80);
    MDNS.addService("solarbell", "tcp", 80);
    Serial.printf("[red] nombre local http://%s.local\n", NOMBRE_MDNS);
  }

  intentoNuevo = false;
  casaObtuvoIp = false;
  if (casaSsid[0]) unirseARed(casaSsid, casaClave);
  else estadoCasa = CASA_SIN_RED;
}

// ---------- Interruptor del Wi-Fi ----------

#ifdef PIN_INTERRUPTOR_WIFI
// Sin cable en el pin, la entrada queda en reposo (pull-up) y el Wi-Fi sigue encendido.
// Con el Wi-Fi apagado el horario sigue sonando: solo se pierde el acceso desde el teléfono.
#ifdef INTERRUPTOR_WIFI_CERRADO_ENCIENDE
constexpr int NIVEL_WIFI_ENCENDIDO = LOW;
#else
constexpr int NIVEL_WIFI_ENCENDIDO = HIGH;
#endif
constexpr uint32_t REBOTE_INTERRUPTOR_MS = 300;

bool wifiEncendido = false;
int nivelVisto = -1;
uint32_t nivelDesde = 0;

void fijarWifi(bool encender) {
  if (encender == wifiEncendido) return;
  wifiEncendido = encender;
  if (encender) {
    Serial.println("[red] interruptor: Wi-Fi encendido");
    iniciarRed();
    servidor.begin();
  } else {
    Serial.println("[red] interruptor: Wi-Fi apagado");
    servidor.stop();
    if (mdnsActivo) MDNS.end();
    mdnsActivo = false;
    WiFi.disconnect(true);
    WiFi.softAPdisconnect(true);
    WiFi.mode(WIFI_OFF);
  }
}

void revisarInterruptorWifi(uint32_t ahora) {
  int nivel = digitalRead(PIN_INTERRUPTOR_WIFI);
  if (nivel != nivelVisto) {
    nivelVisto = nivel;
    nivelDesde = ahora;
    return;
  }
  if (ahora - nivelDesde >= REBOTE_INTERRUPTOR_MS) fijarWifi(nivel == NIVEL_WIFI_ENCENDIDO);
}
#endif

// ---------- LED ----------

void actualizarLed(uint32_t ahora) {
  bool encendido;
  if (toque.activa) {
    encendido = releEncendido;
  } else if (destellando()) {
    encendido = ledDestelloEncendido();
  } else if (!horaValida()) {
    encendido = (ahora % SIN_HORA_PERIODO_MS) < SIN_HORA_ENCENDIDO_MS;
  } else {
    encendido = false;
  }
  digitalWrite(PIN_LED, encendido ? HIGH : LOW);
}

// Diagnóstico por el monitor serie (sin clave, para no pasar claves por el cable):
//   unir <red>   intenta unirse a <red> como red abierta
//   estado       modo, canal y estado de la STA
void atenderSerie() {
  static String linea;
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c != '\n' && c != '\r') {
      if (linea.length() < 64) linea += c;
      continue;
    }
    linea.trim();
    if (linea.startsWith("unir ")) {
      String red = linea.substring(5);
      intentoClave[0] = '\0';
      intentoNuevo = true;
      redPausada = false;
      unirseARed(red.c_str(), intentoClave);
    } else if (linea == "estado") {
      Serial.printf("[diag] modo=%d canal=%d sta=%d estadoCasa=%d ip=%s\n", (int)WiFi.getMode(),
                    (int)WiFi.channel(), (int)WiFi.status(), (int)estadoCasa,
                    WiFi.localIP().toString().c_str());
    }
    linea = "";
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.printf("\nSolarBell local %s (relé simulado con LED GPIO%d)\n", VERSION_FIRMWARE, PIN_LED);

  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
#ifdef PIN_RELE
#if !RELE_ACTIVO_EN_BAJO
  pinMode(PIN_RELE, OUTPUT);
#endif
  // Forzar el nivel de reposo sin pasar por ON (no hacer sonar la campana al arrancar).
  releEncendido = true;
  fijarRele(false);
#endif
#ifdef PIN_INVERSOR
#if !INVERSOR_ACTIVO_EN_BAJO
  pinMode(PIN_INVERSOR, OUTPUT);
#endif
  inversorEncendido = true;
  fijarInversor(false);
#endif

  preferencias.begin("solarbell", false);
  if (preferencias.isKey("zona")) zonaMinutos = preferencias.getInt("zona", ZONA_MINUTOS);
  if (preferencias.isKey("ultimo")) {
    preferencias.getString("ultimo", ultimoMinutoTocado, sizeof ultimoMinutoTocado);
  }

  if (!LittleFS.begin(true)) Serial.println("[memoria] no se pudo montar LittleFS");
  cargarHorario();
  cargarHora();
  cargarRedCasa();
#ifdef PIN_INTERRUPTOR_WIFI
  pinMode(PIN_INTERRUPTOR_WIFI, INPUT_PULLUP);
  delay(20);
  wifiEncendido = digitalRead(PIN_INTERRUPTOR_WIFI) == NIVEL_WIFI_ENCENDIDO;
  Serial.printf("[red] interruptor Wi-Fi en GPIO%d: %s\n", PIN_INTERRUPTOR_WIFI, wifiEncendido ? "encendido" : "apagado");
  if (wifiEncendido) iniciarRed();
  else WiFi.mode(WIFI_OFF);
#else
  iniciarRed();
#endif
  iniciarApi();
}

void loop() {
  uint32_t ahora = millis();
  atenderSerie();
#ifdef PIN_INTERRUPTOR_WIFI
  revisarInterruptorWifi(ahora);
  if (wifiEncendido) {
    servidor.handleClient();
    revisarRedCasa();
  }
#else
  servidor.handleClient();
  revisarRedCasa();
#endif
  if (telefonoUnido) {
    telefonoUnido = false;
    Serial.println("[red] se unió un teléfono");
    iniciarDestellos();
  }
  actualizarDestellos(ahora);
  actualizarToque(ahora);
  revisarHorario(ahora);
  actualizarLed(ahora);
}
