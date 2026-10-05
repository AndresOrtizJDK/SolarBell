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
#include <LittleFS.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <sys/time.h>
#include <time.h>

#ifdef USAR_DS3231
#include <RTClib.h>
#endif

#define VERSION_FIRMWARE "0.3.0"

static_assert(sizeof(RED_CLAVE) > 8, "RED_CLAVE necesita al menos 8 caracteres (WPA2)");

// Mismos límites que `frontend/src/features/schedule/bell.ts`. Toques y pausas en ms.
static const uint8_t MAX_TOQUES = 10;
static const int MS_MIN = 100;
static const int MS_MAX = 30000;
// Pausa fija de los horarios guardados por la versión 0.2, que no la configuraba.
static const uint16_t PAUSA_ANTERIOR_MS = 1000;

static const size_t MAX_HORARIO_BYTES = 24 * 1024;
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
  digitalWrite(PIN_RELE, encender ? LOW : HIGH);
#else
  digitalWrite(PIN_RELE, encender ? HIGH : LOW);
#endif
#endif
  Serial.printf("[rele] %s\n", encender ? "ON  (campana sonando)" : "OFF");
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
  toque.activa = false;
  Serial.printf("[toque] #%lu %s\n", (unsigned long)toque.id, motivo);
}

void actualizarToque(uint32_t ahora) {
  if (!toque.activa || (int32_t)(ahora - toque.finFase) < 0) return;
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
  toque.inicio = millis();
  Serial.printf("[toque] #%lu %s: %u toques\n", (unsigned long)toque.id,
                programado ? "programado" : "manual", cantidad);
  iniciarFase(true, toque.inicio);
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
    run["elapsedMs"] = millis() - toque.inicio;
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

void iniciarApi() {
  servidor.on("/api/status", HTTP_GET, responderEstado);
  servidor.on("/api/schedule", HTTP_GET, [] { responder(200, horario); });
  servidor.on("/api/schedule", HTTP_PUT, alGuardarHorario);
  servidor.on("/api/clock", HTTP_POST, alFijarHora);
  servidor.on("/api/ring", HTTP_POST, alTocar);
  servidor.on("/api/ring/stop", HTTP_POST, alDetener);
  servidor.onNotFound([] { responderError(404, "No existe"); });
  servidor.begin();
}

// ---------- Red ----------

void alEventoWifi(arduino_event_id_t evento) {
  if (evento == ARDUINO_EVENT_WIFI_AP_STACONNECTED) telefonoUnido = true;
}

void iniciarRed() {
  WiFi.mode(WIFI_AP);
  WiFi.onEvent(alEventoWifi);
  if (!WiFi.softAP(RED_NOMBRE, RED_CLAVE)) {
    Serial.println("[red] no se pudo crear la red");
    return;
  }
  Serial.printf("[red] %s en http://%s\n", RED_NOMBRE, WiFi.softAPIP().toString().c_str());
}

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

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.printf("\nSolarBell local %s (relé simulado con LED GPIO%d)\n", VERSION_FIRMWARE, PIN_LED);

  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
#ifdef PIN_RELE
  pinMode(PIN_RELE, OUTPUT);
  // Forzar el nivel de reposo sin pasar por ON (no hacer sonar la campana al arrancar).
  releEncendido = true;
  fijarRele(false);
#endif

  preferencias.begin("solarbell", false);
  if (preferencias.isKey("zona")) zonaMinutos = preferencias.getInt("zona", ZONA_MINUTOS);
  if (preferencias.isKey("ultimo")) {
    preferencias.getString("ultimo", ultimoMinutoTocado, sizeof ultimoMinutoTocado);
  }

  if (!LittleFS.begin(true)) Serial.println("[memoria] no se pudo montar LittleFS");
  cargarHorario();
  cargarHora();
  iniciarRed();
  iniciarApi();
}

void loop() {
  uint32_t ahora = millis();
  servidor.handleClient();
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
