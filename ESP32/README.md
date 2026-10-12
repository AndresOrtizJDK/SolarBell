# ESP32 — campana SolarBell (local, sin internet)

`solarbell_local/` crea su propia red Wi-Fi, guarda el horario en la flash y toca sola con su
reloj. La app (APK) se une a esa red para cambiar el horario o tocar a mano; después el teléfono
se puede ir. Todavía no hay relé: el **LED azul integrado (GPIO2)** hace de relé.

| LED | Significa |
| --- | --- |
| Parpadeo lento | Sin hora: no toca el horario hasta que la app se conecte |
| 2 destellos cortos | Se unió un teléfono o se guardó el horario |
| Encendido fijo | Toque en curso (apagado durante la pausa entre toques) |

Cada acción también sale por el monitor serie a 115200 baudios.

## Configurar

1. Copia `solarbell_local/configuracion.ejemplo.h` como `solarbell_local/configuracion.h` (está en `.gitignore`).
2. Cambia `RED_CLAVE`. Es la única protección: quien la tenga puede tocar la campana.
3. Con un DS3231 conectado (SDA GPIO21, SCL GPIO22), descomenta `USAR_DS3231`.

## Compilar y subir

### Arduino IDE

1. Gestor de tarjetas: **esp32** de Espressif, placa *ESP32 Dev Module* (esquema de particiones por defecto: trae espacio para LittleFS).
2. Gestor de librerías: **ArduinoJson** (Benoit Blanchon, v7) y, con DS3231, **RTClib** (Adafruit).
3. Abre `solarbell_local/solarbell_local.ino`, sube y abre el monitor serie a 115200.

### arduino-cli

```bash
arduino-cli core install esp32:esp32
arduino-cli lib install ArduinoJson RTClib
arduino-cli compile --fqbn esp32:esp32:esp32 solarbell_local
arduino-cli upload  --fqbn esp32:esp32:esp32 -p /dev/ttyUSB0 solarbell_local
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=115200
```

## Reloj

Sin internet no hay hora de red. Cada vez que la app se conecta, pone la campana en la hora del
teléfono (y su zona horaria) si difiere en más de 5 s.

- **Con DS3231**: la hora aguanta cortes de luz.
- **Sin DS3231**: un corte borra la hora. La campana no toca el horario (LED en parpadeo lento)
  hasta que un teléfono se vuelva a conectar. El toque manual funciona igual.

Si el ESP32 se reinicia dentro del minuto de un timbrado que ya sonó, no lo repite. Si vuelve la
luz después de la hora, tampoco toca tarde.

## Energía

El Wi-Fi en modo punto de acceso gasta del orden de 100 mA todo el día (~2.4 Ah diarios). Sobre la
VRLA de ~7.5 Ah del kit se nota en días sin sol: medir antes de dejarlo así en el sitio.

## API (`http://192.168.4.1`)

JSON con las mismas claves que `frontend/src/features/schedule/types.ts`. Toques y pausas van en
ms (100 a 30000). `customDurations` (uno por toque) y `customPauses` (uno por pausa, `rings - 1`)
van los dos o ninguno. Un horario guardado por la 0.2 (en segundos) se pasa a ms al arrancar.

| Ruta | Qué hace |
| --- | --- |
| `GET /api/status` | `firmware`, `clockSet`, `now`, `offsetMinutes`, `scheduleRevision` y `run` (toque en curso con `durations`, `pauses` y `elapsedMs`) |
| `GET /api/schedule` | Horario guardado (`weekly`, `specials`) |
| `PUT /api/schedule` | Reemplaza el horario completo (semanal o fechas especiales); sube `scheduleRevision` y responde lo guardado |
| `POST /api/clock` | `{ "now": <ms epoch>, "offsetMinutes": -300 }` |
| `POST /api/ring` | `{ "rings": 3, "ringMs": 1000, "pauseMs": 1000, "customDurations": null, "customPauses": null }` toca ahora |
| `POST /api/ring/stop` | Corta el toque en curso |

Errores: `{ "detail": "..." }` con 400, 413, 422 o 500.

## Cuando llegue el relé

Descomenta `PIN_RELE` (y `RELE_ACTIVO_EN_BAJO` si el módulo se activa con LOW) en `configuracion.h`.
`fijarRele()` ya conmuta ese pin junto con el LED.
