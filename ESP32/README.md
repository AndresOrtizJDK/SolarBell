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

## Wi-Fi de casa (se elige desde la app)

En la app, **Campana → Wi-Fi de casa → Elegir red**: escanea, eliges la red, pones la clave y la
campana se une sin recompilar. La red queda en la flash y se vuelve a unir sola en cada arranque.
La campana sigue creando `SolarBell`, así que el teléfono no pierde el acceso; al unirse al router
esa red cambia de canal y el teléfono puede perder la señal un par de segundos. Solo 2,4 GHz.

Para no escribir la IP:

- La campana se anuncia como `http://solarbell.local` (mDNS) en la red a la que se una.
- La app guarda la IP que le dio el router. Si deja de contestar (cambió de red o de IP), prueba
  esa IP, `192.168.4.1` y `solarbell.local`, y cada 2 minutos recorre la subred de la última IP.
  El botón **Buscar campana** lo hace al momento. Solo funciona en el APK.
- `WIFI_CASA_NOMBRE` / `WIFI_CASA_CLAVE` en `configuracion.h` ya son opcionales: solo siembran la
  red la primera vez que cambian. Después manda lo que se elija en la app.

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
| `GET /api/status` | `firmware`, `clockSet`, `now`, `offsetMinutes`, `scheduleRevision`, `historyHead` (id del próximo registro del historial; sube con cada toque terminado) y `run` (toque en curso con `durations`, `pauses` y `elapsedMs`) |
| `GET /api/schedule` | Horario guardado (`weekly`, `specials`) |
| `PUT /api/schedule` | Reemplaza el horario completo (semanal o fechas especiales); sube `scheduleRevision` y responde lo guardado |
| `POST /api/clock` | `{ "now": <ms epoch>, "offsetMinutes": -300 }` |
| `POST /api/ring` | `{ "rings": 3, "ringMs": 1000, "pauseMs": 1000, "customDurations": null, "customPauses": null }` toca ahora |
| `POST /api/ring/stop` | Corta el toque en curso |
| `GET /api/history` | Historial de toques, del más nuevo al más viejo (ver abajo) |
| `POST /api/history/delete` | `{ "id": 123 }` borra un registro del historial; 404 si no existe |
| `GET /api/wifi` | Wi-Fi de casa: `state` (`none`, `connecting`, `connected`, `failed`), `ssid`, `ip`, `rssi`, `hostname` y `error` si falló |
| `GET /api/wifi/scan` | Redes cercanas `{ scanning, networks: [{ssid, rssi, secure}] }`. El primer pedido arranca el escaneo (`scanning: true`); repetir hasta que sea `false` |
| `PUT /api/wifi` | `{ "ssid": "...", "password": "..." }` empieza a unirse (202). La red solo se guarda en la flash cuando obtiene IP; si falla en 20 s vuelve a la anterior |
| `POST /api/wifi/forget` | Olvida la red guardada |

Errores: `{ "detail": "..." }` con 400, 413, 422 o 500.

## Historial de toques

Cada toque que termina (programado o manual, completo, detenido o cortado por otro) queda en la
flash con su nombre, la hora en que se pidió, cuánto sonó y su patrón de toques y pausas. No se
guarda al empezar sino al terminar, así que un corte de luz a mitad de un toque no lo registra.
La app lo muestra en **Historial**.

`GET /api/history?limit=25&before=<id>&from=<ms>&to=<ms>&q=<texto>`:

- `limit` (1 a 40, por defecto 25), `before` (devuelve ids menores; sirve de cursor), `from` / `to`
  (ms epoch, ambos incluidos) y `q` (parte del nombre; ignora mayúsculas y tildes).
- Respuesta: `{ total, capacity, next, records: [{ id, at, source, outcome, label, soundedMs,
  durations, pauses }] }`. `at` va en ms epoch (`null` si la campana no tenía hora), `source` es
  `scheduled` o `manual`, `outcome` es `completed`, `stopped` o `replaced`, `soundedMs` es lo que
  sonó de verdad (sin el arranque del inversor) y `label` va vacío en un toque manual.
- `total` cuenta solo los registros que no se han borrado. La app pide de 15 en 15 y arma las
  páginas con `next` (el `before` de la siguiente); los ids no cambian al llegar toques nuevos.
- Un pedido revisa como mucho 500 registros para no frenar el reloj de los toques. Con filtros
  puede volver con pocos registros y un `next` distinto de `null`: hay que repetir con
  `before=<next>` hasta juntar los que se quieran o hasta que `next` sea `null`. La app lo hace sola.

### Cuánta flash ocupa

La partición `spiffs` de la tabla por defecto mide 0x160000 = **1.408 KB = 352 bloques** de 4 KB
(LittleFS borra y escribe por bloques). El horario ya usa de 1 a 2 bloques y como máximo 12
(`MAX_HORARIO_BYTES` de 24 KB, más su copia temporal al guardar).

| Cuenta | Valor |
| --- | --- |
| Registro | **96 B** fijos: fecha 4, duración real 4, origen/resultado/toques 3, hasta 10 duraciones 20, hasta 9 pausas 18, nombre 47 |
| Segmento | 40 registros = 3.840 B: un archivo cabe en **1 bloque** de 4.096 B |
| Máximo | 25 segmentos = **1.000 registros** = 100 KB = **7 % de la partición** (al abrir el segmento 26 se borra el más viejo: quedan entre 961 y 1.000) |
| Peor caso junto con el horario | 25 + 12 + unos 6 de metadatos ≈ 43 bloques = **12 %**; queda el 88 % libre |
| Duración | 10 timbres al día, 5 días a la semana: ~2.600 al año, **unos 4,5 meses**; con 6 al día, unos 8 |

Por qué así:

- **Solo se agrega**: LittleFS reescribe desde el punto donde se modifica un archivo, así que un
  buffer circular en un solo archivo desgastaría la flash. Con segmentos, al llenarse el último se
  abre otro y, al llegar al máximo, se **borra el segmento más viejo** (el historial se renueva solo,
  no se llena nunca).
- **Desgaste**: cada registro cuesta borrar un bloque (LittleFS copia el último al agregar) y se
  reparte entre los ~300 bloques libres. A ~2.600 registros al año son ~9 borrados por bloque
  al año frente a los ~100.000 que aguanta la flash: irrelevante.
- **Dos topes de seguridad** (`limiteSegmentos`, `FLASH_LIBRE_MINIMA`): el historial nunca pasa de la
  cuarta parte de la partición (una placa con menos flash guarda menos) y, si quedan menos de 64 KB
  libres, se borra lo más viejo antes de arriesgar el guardado del horario.
- **Nombre de 46 bytes**: la app deja 40 caracteres; el resto se corta sin partir una tilde. El
  nombre guardado es el que tenía el timbrado en ese momento: renombrarlo después no cambia el
  historial.
- **Borrar** un registro solo levanta un bit en su byte `resultado` (se reescribe un byte): los ids de
  los demás no cambian y los borrados dejan de salir en las lecturas. El espacio no vuelve hasta que
  ese segmento sale por ser el más viejo.
- Si un segmento queda con bytes sueltos por un corte, se ignoran y el siguiente registro va a otro
  archivo.

## Cuando llegue el relé

Descomenta `PIN_RELE` (y `RELE_ACTIVO_EN_BAJO` si el módulo se activa con LOW) en `configuracion.h`.
`fijarRele()` ya conmuta ese pin junto con el LED.

## Interruptor del Wi-Fi

Un interruptor de 2 terminales entre `GPIO33` y `GND` (`PIN_INTERRUPTOR_WIFI` en `configuracion.h`).

| Interruptor | Qué queda encendido |
| --- | --- |
| Abierto o sin cable | La red `SolarBell` y la unión a la red de casa |
| Cerrado, con red de casa guardada | **Solo la unión a la red de casa**: sin la red `SolarBell` (lo que más gasta) y el radio duerme entre balizas del router. La app sigue funcionando si el teléfono está en esa misma red |
| Cerrado, sin red de casa | Nada: el Wi-Fi queda apagado y la app no puede conectarse |

El horario suena solo en los tres casos. Para que el segundo funcione, elige antes la red de casa
desde la app (con el interruptor abierto). Con la red `SolarBell` apagada, el teléfono debe estar en
la red de casa: la app busca la campana sola (última IP, `solarbell.local` o recorriendo la subred).
Si la campana no contesta de inmediato es normal: con el radio durmiendo un pedido puede tardar
unos cientos de ms. Si olvidas la red de casa con el interruptor cerrado, el Wi-Fi se apaga del todo.

Para invertir la lógica, define `INTERRUPTOR_WIFI_CERRADO_ENCIENDE`.
Diagrama: `diagrama_circuito_rele_ds3231_interruptor_wifi.svg`.

## Relé del inversor (R1)

`PIN_INVERSOR` (GPIO25) cierra el relé Songle que conecta los 12 V de la batería al inversor.
En cada timbrado (programado o manual) el firmware enciende el inversor, espera
`ARRANQUE_INVERSOR_MS` (2000 por defecto), toca la campana con `PIN_RELE` (GPIO32) y al terminar
apaga ambos. Mientras arranca, `/api/status` reporta `elapsedMs: 0`. El botón del inversor debe
quedar en ON. Diagrama: `diagrama_completo_solarbell.svg`.

## Módulo de relé azul (nivel bajo)

El módulo azul se activa con señal **baja** y no se apaga con 3,3 V del ESP32: `RELE_ACTIVO_EN_BAJO`
en `configuracion.h` hace que el firmware lo apague **soltando** el pin (entrada) y lo active
bajándolo a 0 V. Con el pin conectado a D26 el relé quedaba siempre activado; en D32 (`PIN_RELE 32`)
queda en reposo. Si el LED verde del módulo se ve tenue o parpadea con el Wi-Fi, es una fuga sin
efecto sobre el relé; un diodo en serie con IN (raya hacia el ESP32) la elimina.

## Módulo de 2 relés (diagrama vigente: `docs/Diagrama_Timbre_Escolar_Rele_Doble_3.pdf`)

Módulo de 2 canales optoacoplado de 5 V (puente JD-VCC–VCC). Canal 1 = inversor (`PIN_INVERSOR` GPIO26,
`INVERSOR_ACTIVO_EN_BAJO`), canal 2 = timbre (`PIN_RELE` GPIO27, `RELE_ACTIVO_EN_BAJO`). Ambos son de nivel bajo:
el firmware apaga soltando el pin (entrada) y enciende bajándolo a 0 V. El interruptor de Wi-Fi va en GPIO33.
Si en reposo algún canal queda activado, el módulo es de nivel alto: quita su `*_ACTIVO_EN_BAJO` y vuelve a subir.
