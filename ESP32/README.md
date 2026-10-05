# ESP32 — nodo SolarBell (simulado)

`solarbell_node/` se conecta por Wi-Fi + WebSocket al backend y ejecuta los toques que manda
(manuales desde la app o programados por el horario). Todavía no hay relé: el **LED azul
integrado (GPIO2)** hace de relé.

| LED | Significa |
| --- | --- |
| Parpadeo lento | Sin Wi-Fi o sin servidor |
| 2 destellos cortos | Conectó al servidor o llegó un comando |
| Encendido fijo | Toque en curso (apagado durante la pausa entre toques) |

Cada acción también sale por el monitor serie a 115200 baudios.

## Configurar

1. Copia `solarbell_node/configuracion.ejemplo.h` como `solarbell_node/configuracion.h` (está en `.gitignore`).
2. Completa `WIFI_RED`, `WIFI_CLAVE`, `SERVIDOR_DIRECCION` (IP LAN del PC que corre el backend) y
   `CLAVE_DISPOSITIVO` (igual a `DEVICE_API_KEY` del backend; en local es `dev-device-key`).

## Compilar y subir

### Arduino IDE

1. Gestor de tarjetas: instala **esp32** de Espressif y elige tu placa (p. ej. *ESP32 Dev Module*).
2. Gestor de librerías: instala **WebSockets** (Markus Sattler) y **ArduinoJson** (Benoit Blanchon, v7).
3. Abre `solarbell_node/solarbell_node.ino`, sube y abre el monitor serie a 115200.

### arduino-cli

```bash
arduino-cli core install esp32:esp32
arduino-cli lib install WebSockets ArduinoJson
arduino-cli compile --fqbn esp32:esp32:esp32 solarbell_node
arduino-cli upload  --fqbn esp32:esp32:esp32 -p /dev/ttyUSB0 solarbell_node
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=115200
```

## Protocolo (`/ws/device?key=...`)

Servidor → nodo:

```json
{ "type": "welcome", "pauseMs": 1000 }
{ "type": "ring", "id": 12, "durations": [3, 3, 3], "pauseMs": 1000 }
{ "type": "stop", "id": 12 }
```

Nodo → servidor: `hello` (firmware, MAC, RSSI), `started`, `done` y `stopped`, cada uno con el `id` del toque.

El servidor lleva el tiempo del toque; si el nodo pierde la conexión en medio de un toque, lo corta.

## Cuando llegue el relé

Descomenta `PIN_RELE` (y `RELE_ACTIVO_EN_BAJO` si el módulo se activa con LOW) en `configuracion.h`.
`fijarRele()` ya conmuta ese pin junto con el LED.
