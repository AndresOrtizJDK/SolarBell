// SolarBell — nodo de campana (simulado).
//
// Se conecta por Wi-Fi + WebSocket al backend (`/ws/device`) y ejecuta los toques que manda.
// Sin relé conectado: el LED azul integrado hace de relé (encendido = campana sonando).
//
// LED:
//   parpadeo lento ......... sin Wi-Fi o sin servidor
//   2 destellos cortos ..... conectó al servidor o llegó un comando
//   encendido fijo ......... toque en curso (uno por cada duración, con pausa apagado)
//
// Librerías (Arduino Library Manager):
//   - "WebSockets" de Markus Sattler (Links2004)
//   - "ArduinoJson" de Benoit Blanchon (v7)
//
// `setup()`, `loop()` y las claves JSON del protocolo quedan en inglés: los exige Arduino
// y los comparte el backend.

#if __has_include("configuracion.h")
#include "configuracion.h"
#else
#error "Falta configuracion.h: copia configuracion.ejemplo.h como configuracion.h y completa Wi-Fi, servidor y CLAVE_DISPOSITIVO."
#endif

#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <WiFi.h>

#define VERSION_FIRMWARE "0.1.0"

static const uint8_t MAX_TOQUES = 10;
static const uint32_t DESTELLO_ENCENDIDO_MS = 80;
static const uint32_t DESTELLO_APAGADO_MS = 120;
static const uint8_t CANTIDAD_DESTELLOS = 2;
static const uint32_t SIN_CONEXION_ENCENDIDO_MS = 150;
static const uint32_t SIN_CONEXION_PERIODO_MS = 1500;
static const uint32_t REINTENTO_WIFI_MS = 10000;

WebSocketsClient ws;
bool servidorConectado = false;
uint32_t pausaPorDefectoMs = 1000;
uint32_t ultimoIntentoWifi = 0;

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
  bool esperandoDestellos = false;
  long id = 0;
  uint8_t cantidad = 0;
  uint16_t duraciones[MAX_TOQUES];
  uint32_t pausaMs = 0;
  uint8_t indice = 0;
  bool faseEncendida = false;
  uint32_t finFase = 0;
} toque;

void enviarEvento(const char *tipo, long id) {
  JsonDocument doc;
  doc["type"] = tipo;
  doc["id"] = id;
  String salida;
  serializeJson(doc, salida);
  ws.sendTXT(salida);
}

void iniciarFase(bool encendida, uint32_t ahora) {
  toque.faseEncendida = encendida;
  fijarRele(encendida);
  if (encendida) {
    Serial.printf("[toque] %u de %u: %u s\n", toque.indice + 1, toque.cantidad,
                  toque.duraciones[toque.indice]);
    toque.finFase = ahora + (uint32_t)toque.duraciones[toque.indice] * 1000UL;
  } else {
    toque.finFase = ahora + toque.pausaMs;
  }
}

void terminarToque(const char *evento) {
  fijarRele(false);
  long id = toque.id;
  toque.activa = false;
  toque.esperandoDestellos = false;
  Serial.printf("[toque] #%ld %s\n", id, evento);
  if (servidorConectado) enviarEvento(evento, id);
}

void actualizarToque(uint32_t ahora) {
  if (!toque.activa) return;
  if (toque.esperandoDestellos) {
    // El toque arranca apenas terminan los destellos de "comando recibido".
    if (destellando()) return;
    toque.esperandoDestellos = false;
    toque.indice = 0;
    if (servidorConectado) enviarEvento("started", toque.id);
    iniciarFase(true, ahora);
    return;
  }
  if ((int32_t)(ahora - toque.finFase) < 0) return;

  if (toque.faseEncendida) {
    if (toque.indice + 1 >= toque.cantidad) {
      terminarToque("done");
      return;
    }
    if (toque.pausaMs > 0) {
      iniciarFase(false, ahora);
      return;
    }
  }
  toque.indice++;
  iniciarFase(true, ahora);
}

void iniciarToque(JsonDocument &doc) {
  JsonArray duraciones = doc["durations"].as<JsonArray>();
  if (duraciones.isNull() || duraciones.size() == 0) {
    Serial.println("[toque] comando sin duraciones, se ignora");
    return;
  }
  if (toque.activa) terminarToque("stopped");

  toque.id = doc["id"] | 0L;
  toque.cantidad = 0;
  for (JsonVariant d : duraciones) {
    if (toque.cantidad >= MAX_TOQUES) break;
    toque.duraciones[toque.cantidad++] = constrain(d.as<int>(), 1, 30);
  }
  toque.pausaMs = doc["pauseMs"] | pausaPorDefectoMs;
  toque.activa = true;
  toque.esperandoDestellos = true;
  Serial.printf("[toque] #%ld: %u toques, pausa %lu ms\n", toque.id, toque.cantidad,
                (unsigned long)toque.pausaMs);
}

// ---------- LED ----------

void actualizarLed(uint32_t ahora) {
  bool encendido;
  if (destellando()) {
    encendido = ledDestelloEncendido();
  } else if (toque.activa && !toque.esperandoDestellos) {
    encendido = releEncendido;
  } else if (!servidorConectado) {
    encendido = (ahora % SIN_CONEXION_PERIODO_MS) < SIN_CONEXION_ENCENDIDO_MS;
  } else {
    encendido = false;
  }
  digitalWrite(PIN_LED, encendido ? HIGH : LOW);
}

// ---------- WebSocket ----------

void procesarMensaje(uint8_t *contenido, size_t largo) {
  JsonDocument doc;
  if (deserializeJson(doc, contenido, largo)) {
    Serial.println("[ws] mensaje no JSON, se ignora");
    return;
  }
  const char *tipo = doc["type"] | "";
  iniciarDestellos();

  if (strcmp(tipo, "welcome") == 0) {
    pausaPorDefectoMs = doc["pauseMs"] | pausaPorDefectoMs;
    Serial.printf("[ws] servidor listo, pausa entre toques %lu ms\n",
                  (unsigned long)pausaPorDefectoMs);
  } else if (strcmp(tipo, "ring") == 0) {
    iniciarToque(doc);
  } else if (strcmp(tipo, "stop") == 0) {
    if (toque.activa) terminarToque("stopped");
  } else {
    Serial.printf("[ws] tipo desconocido: %s\n", tipo);
  }
}

void alEventoSocket(WStype_t tipo, uint8_t *contenido, size_t largo) {
  switch (tipo) {
    case WStype_CONNECTED: {
      servidorConectado = true;
      Serial.println("[ws] conectado");
      iniciarDestellos();
      JsonDocument saludo;
      saludo["type"] = "hello";
      saludo["fw"] = VERSION_FIRMWARE;
      saludo["mac"] = WiFi.macAddress();
      saludo["rssi"] = WiFi.RSSI();
      String salida;
      serializeJson(saludo, salida);
      ws.sendTXT(salida);
      break;
    }
    case WStype_DISCONNECTED:
      if (servidorConectado) Serial.println("[ws] desconectado");
      servidorConectado = false;
      // Sin servidor no hay quien pare el toque: se corta por seguridad.
      if (toque.activa) terminarToque("stopped");
      break;
    case WStype_TEXT:
      procesarMensaje(contenido, largo);
      break;
    case WStype_ERROR:
      Serial.println("[ws] error de conexión");
      break;
    default:
      break;
  }
}

// ---------- Wi-Fi ----------

void asegurarWifi(uint32_t ahora) {
  if (WiFi.status() == WL_CONNECTED) return;
  if (ultimoIntentoWifi != 0 && ahora - ultimoIntentoWifi < REINTENTO_WIFI_MS) return;
  ultimoIntentoWifi = ahora;
  Serial.printf("[wifi] conectando a %s...\n", WIFI_RED);
  WiFi.disconnect();
  WiFi.begin(WIFI_RED, WIFI_CLAVE);
}

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.printf("\nSolarBell nodo %s (relé simulado con LED GPIO%d)\n", VERSION_FIRMWARE, PIN_LED);

  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
#ifdef PIN_RELE
  pinMode(PIN_RELE, OUTPUT);
  // Forzar el nivel de reposo sin pasar por ON (no hacer sonar la campana al arrancar).
  releEncendido = true;
  fijarRele(false);
#endif

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  asegurarWifi(millis());
  for (uint8_t i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) {
    delay(250);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[wifi] %s rssi %d → %s:%d\n", WiFi.localIP().toString().c_str(), WiFi.RSSI(),
                  SERVIDOR_DIRECCION, SERVIDOR_PUERTO);
    WiFiClient sonda;
    Serial.print("[red] tcp al backend... ");
    if (sonda.connect(SERVIDOR_DIRECCION, SERVIDOR_PUERTO, 4000)) {
      Serial.println("ok");
      sonda.stop();
    } else {
      Serial.println("falló (¿aislamiento de clientes Wi-Fi?)");
    }
  } else {
    Serial.println("[wifi] sin asociación todavía; se reintenta en loop");
  }

  String ruta = String("/ws/device?key=") + CLAVE_DISPOSITIVO;
#if SERVIDOR_USA_SSL
  ws.beginSSL(SERVIDOR_DIRECCION, SERVIDOR_PUERTO, ruta.c_str());
#else
  ws.begin(SERVIDOR_DIRECCION, SERVIDOR_PUERTO, ruta.c_str());
#endif
  ws.onEvent(alEventoSocket);
  ws.setExtraHeaders("");
  ws.setReconnectInterval(3000);
  // Ping cada 15 s; 2 pongs perdidos = conexión caída.
  ws.enableHeartbeat(15000, 3000, 2);
}

void loop() {
  uint32_t ahora = millis();
  asegurarWifi(ahora);
  ws.loop();
  actualizarDestellos(ahora);
  actualizarToque(ahora);
  actualizarLed(ahora);
}
