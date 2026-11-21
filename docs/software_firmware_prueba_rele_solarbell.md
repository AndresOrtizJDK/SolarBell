# SolarBell: estado del software, firmware y prueba del relé

> Leído de la carpeta local del proyecto (`SolarBell Proyect`) el 2026-10-12. Complementa `contexto_y_decisiones_solarbell.md` (hardware, historia, hipótesis) y el inventario.
> No se copian contraseñas ni claves (están en `ESP32/solarbell_local/configuracion.h`).
> v2 (2026-10-12): circuito con relé azul y DS3231 (sección 4). v3 (2026-10-12): modo Wi-Fi de casa (sección 5).

## 1. Qué hay en la carpeta del proyecto

El proyecto no es solo hardware: es un repositorio git con tres partes.

- `ESP32/`: firmware (`solarbell_local/solarbell_local.ino`, `configuracion.h`), `README.md`, `PRUEBA_RAPIDA_RELE.md`, `diagrama_prueba_rele.svg` (versión antigua, sin relé) y **`diagrama_circuito_rele_ds3231.svg`** (versión nueva, con relé y reloj). También existe `solarbell_node/` (otra variante).
- `backend/`: API (carpetas `app/api`, `core`, `db`, `models`, `schemas`, `services`, `tests`).
- `frontend/`: app web/móvil (Vite + React, Capacitor para Android/APK), con `DESIGN.md` y `PRODUCT.md`.
- Rama actual del firmware de prueba: `main`.

## 2. Firmware ESP32 `solarbell_local` (sin internet)

- Crea su **propia red Wi-Fi (punto de acceso)** llamada `SolarBell`; la app se conecta a `http://192.168.4.1`.
- Guarda el **horario en la flash** (LittleFS) y toca solo con su reloj; la app puede cambiar el horario o tocar a mano.
- Reloj: sin internet no hay hora. La app pone la hora del teléfono al conectarse. Con **DS3231** (`#define USAR_DS3231 1`, SDA GPIO21, SCL GPIO22) la hora sobrevive a cortes. Sin DS3231, un corte borra la hora y no toca el horario hasta que un teléfono se conecte (el toque manual sí funciona).
- Si se reinicia dentro del minuto de un timbrado que ya sonó, no lo repite; si vuelve la luz después de la hora, tampoco toca tarde.
- Pines: **LED azul integrado = GPIO2** (indica estado), **relé = GPIO26** (`PIN_RELE`), `RELE_ACTIVO_EN_BAJO` si el módulo funciona al revés.
- LED de estado: parpadeo lento = sin hora; 2 destellos = se unió un teléfono o se guardó el horario; fijo = toque en curso.
- API: `GET /api/status`, `GET/PUT /api/schedule`, `POST /api/clock`, `POST /api/ring`, `POST /api/ring/stop`. Toques y pausas en ms (100 a 30000).

### Consumo (del propio README)

El Wi-Fi como punto de acceso gasta del orden de **100 mA todo el día (~2.4 Ah diarios en el riel de 5 V)**. En la batería de 12 V equivale a ~12 Wh/día (~13 % de lo utilizable, ~45 Wh) y es menor que lo que genera el panel (~80 a 100 Wh/día), pero se nota en días sin sol. **Medir antes de dejarlo en el sitio.** Esto sustituye mi sugerencia anterior de deep sleep: con el punto de acceso siempre activo no hay deep sleep. Alternativa: activar el Wi-Fi solo cuando se necesite.

## 3. Prueba rápida: batería → ESP32 → relé → LED

Objetivo: comprobar que la batería alimenta el ESP32 por el LM2596 y que el ESP32 activa un relé real que enciende un LED.

Conexiones (de `PRUEBA_RAPIDA_RELE.md`):

| Origen | Destino |
|---|---|
| Batería (+) → interruptor (→ fusible 2 A) | IN+ del LM2596 |
| Batería (−) | IN− del LM2596 |
| OUT+ del LM2596 (5 V) | VIN del ESP32 y VCC del relé |
| OUT− del LM2596 | GND del ESP32 y GND del relé |
| GPIO26 del ESP32 | IN del módulo de relé |
| OUT+ del LM2596 (5 V) | COM del relé |
| NO del relé | resistencia 330 Ω → ánodo (pata larga) del LED |
| Cátodo (pata corta) del LED | GND común |

NC queda sin conectar. Procedimiento: ajustar el LM2596 a **5.0 V sin carga** antes de conectar el ESP32; armar con el interruptor en OFF; subir el firmware **por USB con la batería desconectada**; nunca alimentar por USB y VIN a la vez; todas las tierras unidas; el LED siempre con resistencia y desde los 5 V, nunca directo a 12 V.

### Diferencia entre los dos documentos de la prueba (resuelta en la v2)

- `diagrama_prueba_rele.svg` (antiguo) está titulado "sin relé", usa el LED azul integrado (GPIO2) y alimenta el ESP32 desde la salida **LOAD del controlador PWM** (con corte LVD).
- `PRUEBA_RAPIDA_RELE.md` conecta la batería directo al interruptor y al LM2596, sin LVD.
- Decisión: el circuito nuevo usa la ruta **batería → controlador (BAT) → LOAD → interruptor + fusible 2 A → LM2596**, para que el corte por bajo voltaje proteja la batería. El **inversor irá directo a la batería con fusible** (el LOAD solo soporta 10 A).

## 4. Circuito con relé azul y reloj DS3231 (v2, 2026-10-12)

Archivo: `ESP32/diagrama_circuito_rele_ds3231.svg`.

| Origen | Destino |
|---|---|
| Batería (+)/(−) | BAT+/BAT− del controlador PWM |
| LOAD+ del controlador → interruptor → fusible 2 A | IN+ del LM2596 |
| LOAD− del controlador | IN− del LM2596 |
| OUT+ del LM2596 (**5,0 V** ajustados sin carga) | VIN del ESP32, VCC del relé y COM del relé (riel de 5 V) |
| OUT− del LM2596 | GND común (ESP32, DS3231, relé, LED) |
| 3V3 del ESP32 | **VCC del DS3231** (no de 5 V, para que SDA/SCL queden a 3,3 V con los pull-up del módulo) |
| GPIO21 (SDA) / GPIO22 (SCL) | SDA / SCL del DS3231 |
| GPIO26 | IN del relé |
| NO del relé | resistencia 1 kΩ (≈3 mA) o 330 Ω (≈9 mA) → ánodo del LED |
| Cátodo del LED | GND |

Notas: SQW y 32K del DS3231 sin conectar; NC del relé libre; pila del DS3231 recargable LIR2032 (o quitar el diodo/resistencia de carga si es CR2032); en el firmware, `#define USAR_DS3231 1`, y `RELE_ACTIVO_EN_BAJO` si el relé actúa al revés. Etapa final: sustituir el LED por los contactos COM/NO del relé en la línea de 110 VAC de la campana, solo cuando se confirme el circuito original (H2 y H3 del documento de contexto) y con la parte de red en caja cerrada.

## 5. Modo "Wi-Fi de casa" (opción 4 de alcance, v3, 2026-10-12)

Motivo: ampliar el alcance usando un router existente. Se probará primero con la red de casa del equipo; con la del colegio habría que pedir permiso al administrador (2.4 GHz, sin portal de inicio de sesión, sin aislamiento de clientes, IP reservada).

**Cambio hecho en el firmware** (`solarbell_local.ino` v0.3.1; rama `main`, reversible con `git checkout`):

- Si `configuracion.h` define `WIFI_CASA_NOMBRE` y `WIFI_CASA_CLAVE`, el ESP32 pasa a modo **AP + estación**: sigue creando `SolarBell` y además se une al router. Hostname `solarbell`, reconexión automática, y el monitor serie imprime `[red] unida a la red de casa, IP http://...`.
- Si no se definen, el comportamiento es idéntico al anterior.
- `configuracion.ejemplo.h` ahora trae esas dos líneas comentadas. `configuracion.h` (con las claves reales) es donde el usuario añade sus datos.

**Cómo probar:**

1. En `configuracion.h`: `#define WIFI_CASA_NOMBRE "..."` y `#define WIFI_CASA_CLAVE "..."` (red de **2.4 GHz**).
2. Compilar y subir por USB con la batería desconectada. Abrir el monitor serie a 115200 y copiar la IP.
3. Desde un PC o teléfono en esa misma red: `http://<IP>/api/status`.
4. App en el navegador: `SOLARBELL_DEVICE=http://<IP> bun run dev` (sin cambiar el código). App Android (APK): `NATIVE_BASE` en `frontend/src/lib/device.ts` es `http://192.168.4.1` fijo; se puede cambiar con `VITE_DEVICE_URL=http://<IP>` al compilar.
5. Reservar esa IP en el router (DHCP) para que no cambie.

**Riesgos conocidos:** en modo mixto el canal del punto de acceso se ajusta al del router (un teléfono unido a `SolarBell` puede desconectarse al conectar); el consumo es algo mayor que solo AP (medir); cualquiera en esa red podría llamar a la API (la API no tiene clave propia; la protección de `RED_CLAVE` solo cubre la red `SolarBell`).

## 6. Pendientes de software/prueba

- [x] Actualizar el diagrama con relé, LED y DS3231 (`diagrama_circuito_rele_ds3231.svg`). El `diagrama_prueba_rele.svg` antiguo queda desfasado.
- [x] Añadir al firmware el modo Wi-Fi de casa (opcional).
- [ ] Probar el modo Wi-Fi de casa en la placa (compilar, IP en monitor serie, `/api/status`).
- [ ] Decidir cómo la app encuentra la IP en el APK (fija con `VITE_DEVICE_URL` o configurable).
- [ ] Actualizar `PRUEBA_RAPIDA_RELE.md` para usar la ruta por LOAD y el DS3231 si se decide así.
- [ ] Medir el consumo real del ESP32 con el Wi-Fi en modo punto de acceso, en modo mixto y con relé activo.
- [ ] Probar `RELE_ACTIVO_EN_BAJO` según el módulo azul.
- [ ] Añadir DS3231 y probar la hora tras un corte.
- [ ] Reemplazar el LED por el circuito real de la campana (contactos del relé a la carga de 110 VAC) solo cuando se confirme el circuito original.
- [ ] Decidir si el Wi-Fi permanece siempre activo o solo bajo demanda.
- [ ] Si se usa la red del colegio: pedir permiso, 2.4 GHz, sin portal cautivo, sin aislamiento de clientes, IP reservada.
