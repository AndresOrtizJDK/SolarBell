# SolarBell: contexto completo del proyecto

> **ACTUALIZACIÓN 2026-10-27:** el diagrama vigente es `docs/Diagrama_Timbre_Escolar_Rele_Doble_3.pdf`. Reemplaza los dos relés sueltos
> (Songle + módulo azul) por **un módulo de 2 relés optoacoplado (5 V, 10 A, puente JD-VCC–VCC)**: canal 1 = inversor (GPIO26), canal 2 = timbre
> (GPIO27); interruptor de Wi-Fi en GPIO33; el timbre usa un **inversor de contactos** (NC = red escolar con el pulsador de pared, NO = inversor),
> así nunca se unen las dos fuentes. Agrega condensador 1000 µF/16 V en el riel de 5 V, diodo 1N4007, resistencia 15 kΩ 2 W, LED de prueba y varistor 14D241K.
> Firmware v0.5.0 con esos pines y lógica de nivel bajo (suelta el pin para apagar). Las secciones 4.8, 5 y 11.2 describen el diseño anterior
> (relé azul + Songle); quedan como historia del problema que motivó el cambio.

> Documento maestro para retomar el proyecto desde cero (otra persona, otra conversación, otra sesión).
> Estado a **2026-10-19**. Reúne: por qué se hace, qué se quiere lograr, cómo se está haciendo, todos los
> componentes con sus especificaciones, el firmware y la app, lo que se ha probado, los problemas y lo pendiente.
> No incluye contraseñas ni claves: están en `ESP32/solarbell_local/configuracion.h`, que git ignora.
> Documentos relacionados: `inventario_tecnico_componentes_solarbell.md`, `contexto_y_decisiones_solarbell.md`,
> `software_firmware_prueba_rele_solarbell.md`.

---

## 0. Resumen en 10 líneas

1. SolarBell es una **campana escolar automática alimentada por energía solar**, controlada desde el teléfono.
2. Es un proyecto universitario (Ingeniería de Sistemas, Universidad de Córdoba), **heredado** de otro grupo de la misma asignatura.
3. El sistema anterior funcionó y luego se dañó (ESP32 quemado, batería sulfatada); no hay documentación ni contacto.
4. Una campana de 110 VAC suena con un inversor de 12 V alimentado por una batería que carga un panel de 30 Wp.
5. Un **ESP32** guarda el horario, tiene su propio reloj (DS3231) y cierra relés para encender el inversor y tocar la campana.
6. La campana crea su propia red Wi-Fi (`SolarBell`, 192.168.4.1) y también se une a una red de casa; **sin internet, sin servidor, sin login**.
7. Una **app Android (APK)** programa el horario y toca a mano; el horario vive en la flash del ESP32.
8. Hoy el firmware (v0.4.1) y la app funcionan; el ESP32 se une a la red de casa y los toques corren por serie.
9. El problema abierto es el **relé azul**, que no se apaga bien con las señales de 3,3 V del ESP32 (solución: un transistor NPN).
10. Pendiente: arreglar el relé, estabilizar la alimentación, medir consumos y recién entonces conectar la campana real.

---

## 1. Por qué existe y qué se quiere lograr

### 1.1 Problema que resuelve
En un colegio el timbre se toca a mano o con un temporizador viejo, y depende de la red eléctrica. Se quiere una
campana que:

- **suene sola** a las horas del horario escolar, sin que alguien esté presente;
- **no dependa de la red eléctrica** (energía solar con batería), útil si hay cortes o si se instala lejos de un tomacorriente;
- **se pueda programar y tocar a mano desde un teléfono**, sin escaleras ni cajas de breakers;
- **funcione sin internet ni servidor**, porque en el colegio no se puede contar con una red estable.

### 1.2 Objetivo general
Dejar funcionando de punta a punta: *teléfono → ESP32 → relés → inversor → campana de 110 VAC*, alimentado solo por el
panel y la batería, con horarios que se guardan en el propio aparato.

### 1.3 Objetivos específicos
- El toque en el teléfono corresponde a un **toque audible** en la campana (criterio de éxito de la v1).
- Horario semanal (por defecto lunes a viernes 8:00, 10:00, 12:00), con timbrados editables (nombre, hora, veces,
  duración por toque, duración y pausa individuales) y **fechas especiales** que reemplazan el horario ese día.
- Que la hora se conserve aunque se corte la energía (DS3231) y que un reinicio no repita ni toque tarde un timbrado.
- Gastar poca batería: el inversor **solo se enciende al timbrar**.
- Poder apagar el Wi-Fi con un interruptor para ahorrar energía.
- Reutilizar el pulsador de pared existente como botón manual a prueba de fallas (aunque el ESP32 esté muerto).
- Dejar el sistema seguro (110 VAC en caja cerrada, regletas, revisión de alguien con experiencia).

### 1.4 Quién lo usa
Quien programa o dispara una campana física (escolar, de patio o de taller) desde el teléfono, sin estar junto
al pulsador. El perfil demográfico y el lugar exacto de instalación no están confirmados.

### 1.5 Alcance de la rama `main`
Sin internet, sin servidor, sin login. La app habla solo con la campana. La
protección es la clave de la red Wi-Fi de la campana: quien la tenga puede tocarla.

---

## 2. Historia y estado heredado

- Proyecto anterior de otro grupo, **misma asignatura**: timbre automatizado con energía solar (panel + controlador +
  batería + inversor + ESP32). **Funcionaba bien**.
- Se dañó el equipo. Según el equipo actual, un técnico del colegio "quemó" el dispositivo (ESP32 quemado). Hipótesis H1
  (sección 12): probablemente se alimentó el ESP32 directo desde la batería (hasta 14,6 V) sin regulador.
- Estado al recibirlo: ESP32 quemado; batería FuliBattery MR 1330 sulfatada (2,65 V, inservible, ~1,5 a 2 años sin carga);
  panel y demás piezas aparentemente bien.
- **Sin contacto con el grupo anterior. Sin esquemas, sin código.** Solo 3 fotos tomadas por el equipo actual.
- **La campana no se puede abrir ni manipular**; se desconocen su potencia, tensión y tipo (solenoide, motor,
  electrónica). Es una campana de techo con cúpula roja.
- El sistema original tenía un **pulsador de pared** (botón manual).

### 2.1 Evidencia fotográfica
- **Foto 1, montaje en pared:** controlador PWM azul con LCD y USB sobre una caja plástica blanca; encima, una caja de
  aluminio (parece el inversor LY-150). Un cable blanco sube al techo y otro por la esquina. **Cuelga un enchufe de dos
  clavijas planas (110 V)**, sin conectar en la foto; no se sabe a qué alimentaba.
- **Foto 2, botón manual:** pulsador de pared para timbre, marca EXE, tecla blanca con campana, caja de superficie, cable
  plano blanco, **retorno automático**; este tipo suele ser de 6 a 10 A, 125/250 VAC (confirmar leyendo la parte trasera).
- **Foto 3, interior de la caja:** dos compartimentos; en uno una batería sellada negra (terminales amarillos de pala, un
  borne con tapa roja); en el otro una placa perforada naranja con un módulo de relé azul y una placa con módulo tipo ESP.
  A la derecha un **objeto negro con etiqueta y conector gris/azul** (¿adaptador o cargador de pared?) con cables rojo y
  negro. Varios cables blancos suben al techo y **uno tiene un empalme cubierto solo con cinta aislante**.

### 2.2 Mejoras que ya añadió el equipo actual
1. **DS3231** (el diseño anterior no tenía reloj de tiempo real).
2. **Regulador LM2596** a 5 V (el anterior no tenía regulador).
3. Batería nueva FL1275GS 12 V 7,5 Ah.
4. **Dos ESP32** (uno de respaldo).
5. App Android, horario en flash, Wi-Fi propio y de casa, interruptor de Wi-Fi, secuencia del inversor.

---

## 3. Cómo se está haciendo (enfoque)

### 3.1 Arquitectura
```
Panel 30 Wp ─► Controlador PWM ─► Batería 12 V 7,5 Ah
                    │ salida LOAD + / −  (12 V, máx. 10 A, corte LVD)
                    ├──► LM2596 (5,0 V) ──► ESP32 + DS3231 + bobinas de los relés
                    └──► Relé R1 (contactos) ──► Inversor LY-150 ──► 110 VAC
                                                           └──► Relé R2 (contactos) ──► Campana
                                       Pulsador de pared EN PARALELO con los contactos de R2
```
Teléfono ⇄ Wi-Fi (`SolarBell` 192.168.4.1, o la red de casa) ⇄ ESP32 (API HTTP).

### 3.2 Decisiones de diseño clave
| Decisión | Motivo |
|---|---|
| ESP32 siempre por el LM2596 a 5,0 V, nunca directo de la batería | La carga llega a 14,6–14,8 V y destruye el ESP32 (H1). |
| El inversor solo se enciende al timbrar (relé R1) | En vacío gasta ~5–10 W (120–240 Wh/día), más de lo que genera el panel. |
| Los 12 V del inversor salen de **LOAD** del controlador, no directo de la batería | El corte por bajo voltaje (LVD) protege la batería. Límite: LOAD aguanta 10 A (~100 W). |
| Se quitó el interruptor y los fusibles entre controlador y LM2596 | Todo se apaga desde LOAD (botón o temporizador del controlador). Decisión del equipo (no hay fusibles). |
| Pulsador de pared en paralelo con los contactos de R2 | Funciona aunque el ESP32 esté muerto; **nunca** se conecta a un pin del ESP32 (llevaría 110 V). |
| Horario en la flash del ESP32 | La campana toca sola aunque el teléfono se vaya. |
| Hora desde el teléfono + DS3231 | Sin internet no hay hora de red; el DS3231 la conserva en cortes. |
| Sin login | Sin internet ni servidor; la protección es la clave del Wi-Fi. |
| Wi-Fi apagable con interruptor (GPIO27 a GND) | Ahorra ~100 mA; el horario sigue sonando. |
| Modo "Wi-Fi de casa" (AP + estación) | Probar y ampliar el alcance con un router existente. |

### 3.3 Funcionamiento de un timbrado
1. El ESP32 revisa cada 500 ms el horario (semanal y fechas especiales) con su reloj.
2. Al llegar la hora: **R1 enciende el inversor**, espera `ARRANQUE_INVERSOR_MS` (2 s, soft start), y **R2 cierra la línea de la
   campana** tantos toques como indique el timbrado (duración y pausa por toque, 100 a 30000 ms, máx. 10 toques).
3. Al terminar apaga R2 y luego R1. Si se reinicia dentro del minuto de un timbrado que ya sonó, no lo repite; si vuelve la
   luz después de la hora, tampoco toca tarde.
4. El toque manual (`POST /api/ring`) sigue la misma secuencia.

### 3.4 Presupuesto de energía (cálculos del equipo, a validar en sitio)
- Batería FL1275GS: ~90 Wh brutos, **~45 Wh utilizables** (no bajar del 50 %).
- Panel de 30 Wp: ~80–100 Wh/día (4 h sol pico, 70 % de rendimiento).
- ESP32 con Wi-Fi como punto de acceso: ~100 mA a 5 V (~12 Wh/día en la batería, ~13 % de lo utilizable).
- Inversor en vacío: 5–10 W (por eso se apaga entre timbres). Campana ≤100 W: ~8–10 A durante unos segundos.
  Con 150 W serían ~12,5 A (al límite del LOAD de 10 A).
- Salida LOAD: 10 A máx. Hay que **medir** la campana, el inversor en vacío y el Wi-Fi antes de dejarlo instalado.

---

## 4. Componentes con especificaciones (inventario completo)

### 4.1 Panel solar fotovoltaico
- Powest SZYL-P30-18C(6C), silicio policristalino, 36 celdas en serie, 4–5 busbars.
- Pmax **30 Wp** (±3 %), Voc **21,3 V**, Isc **1,80 A**, Vmp **18,0 V**, Imp **1,67 A**, eficiencia 13,1 %.
- Tensión máx. del sistema 600 VDC, fusible de serie máx. 10 A, −40 a +85 °C.
- 510 × 450 × 25 mm, 2,8 kg. Certificaciones IEC 61215, IEC 61730, CE, MCS, ISO 9001/14001, CIDET.

### 4.2 Controlador de carga solar PWM
- PWM con microcontrolador, **pantalla LCD** con iconos, autodetección **12/24 V**, **10 A**.
- Entrada PV máx. 50 V; admite hasta 130 W a 12 V (260 W a 24 V).
- 2 puertos **USB 5 V** frontales; 6 bornes (PV ±, Batería ±, **Carga DC LOAD ±**).
- Temporizador de carga integrado, **LVD** (desconexión por bajo voltaje), protección de sobrecarga y cortocircuito en
  LOAD, voltajes programables (SET).
- **LOAD** entrega los 12 V al LM2596 y al inversor (máx. 10 A).

### 4.3 Baterías
- **FuliBattery FL1275GS (en uso):** VRLA 12 V, **7,5 Ah** (~90 Wh), carga cíclica 14,6–14,8 V, flotación 13,7–13,9 V (25 °C),
  corriente inicial de carga < 2,16 A. Certificaciones RU MH48936, CE.
- **FuliBattery MR 1330 (descartada):** ~1,3 Ah, sulfatada (2,65 V en reposo).

### 4.4 Inversor
- **CAR INVERTER LY-150**: entrada 12 VDC, salida **110 VAC 60 Hz**, **150 W** continuos, tecnología L.I.T. (baja interferencia),
  arranque suave (soft start), turboventilador, salida USB, chasis de aluminio. Tiene **botón propio: dejarlo en ON**.
- Nota: `frontend/PRODUCT.md` lo menciona como "LY-1500" y dice que los "1500 W" del sticker no corresponden a la caja ni al banco.
  Se trabaja con el inventario: 150 W. Confirmar leyendo la etiqueta.

### 4.5 Convertidor reductor (buck)
- Módulo **LM2596S** (SMD TO-263): entrada 4,5–35/40 V, salida **1,25–35 V** ajustable con potenciómetro multivuelta azul (W103).
- 2 A continuos (3 A con disipación), ~150 kHz, bobina 470 µH, capacitores 100 µF/50 V (entrada) y 220 µF/35 V (salida).
- **Debe ajustarse a 5,0 V sin carga** antes de conectar el ESP32.
- Es no aislado: IN− y OUT− son el mismo nodo (GND).

### 4.6 Microcontroladores (2 unidades)
- **ESP32 DevKit v1 / NodeMCU-32S**, 30 pines, módulo **ESP-WROOM-32**: CPU Xtensa dual-core 32 bit LX6 hasta 240 MHz,
  4 MB flash, 520 KB SRAM, 448 KB ROM.
- Wi-Fi 802.11 b/g/n 2,4 GHz (antena PCB) y Bluetooth 4.2 BR/EDR + BLE. **Solo 2,4 GHz.**
- USB-UART **CH340C** (micro-USB), regulador AMS1117-3.3, botones EN y BOOT, LED PWR y LED D2 (GPIO2).
- **Pines de 3,3 V, no tolerantes a 5 V**. Tienen diodos de protección hacia 3,3 V (causa del problema 11.2).

### 4.7 Reloj de tiempo real
- Módulo **HW-084** con **DS3231SN** (TCXO de alta precisión con sensor de temperatura), EEPROM AT24C32 (32 Kbit), bus I2C
  (SDA, SCL), salidas SQW y 32K, alimentación 3,3–5,5 V, portapilas CR2032/LIR2032.
- Se alimenta desde 3V3 del ESP32; usar pila recargable LIR2032 o quitar el diodo/resistencia de carga si es CR2032.

### 4.8 Relés (solo hay 2)
**Módulo azul de 1 canal (5 V)**
- Placa con relé azul, bornera de 3 tornillos **COM (centro) / NO / NC**, pines IN, GND, VCC, LED rojo (alimentación) y LED verde
  (relé activado), tres resistencias de 1 kΩ (marcadas 102), un transistor SOT-23 y un diodo de protección. Sin IC de
  optoacoplador visible (el inventario decía "optoacoplado"; en las fotos no se ve).
- Contactos: **10 A a 250 VAC / 10 A a 30 VDC**. Bobina 5 VDC.
- **Entrada de nivel bajo** (se activa llevando IN a 0 V). Ver problema 11.2.

**Relé Songle SRA-05VDC-CL en placa perforada**
- Placa casera: relé + **transistor 2N2222A** + resistencia de base de **100 Ω** (5 bandas café-negro-negro-negro-café) +
  tira de 3 pines (IN, GND, VCC) + bornera roja de 2 tornillos (COM y NO).
- Contactos 1 Form C (SPDT): **20 A a 14 VDC / 10 A a 125 VAC**. Bobina 5 VDC (~70–90 mA).
- **Entrada de nivel alto** (la maneja el ESP32 con 3,3 V). Sin diodo flyback; el equipo decidió no ponerlo.
- Pendiente: cambiar los 100 Ω por **1 kΩ** (con 3,3 V circulan ~26 mA por el GPIO, por encima de los ~12 mA recomendados).

### 4.9 Cableado, interruptores y LEDs
- Cables fotovoltaicos: par paralelo de cobre multifilar estañado, PVC blanco.
- Jumpers Dupont M-M (2,54 mm).
- Interruptores basculantes rojos I/O: 1 estándar (corte principal) y 3 miniatura de 2 terminales.
- LEDs de 5 mm: 2 rojos, 2 verdes, 2 azules.
- Pulsador de pared EXE (retorno automático, tipo timbre).
- Sin fusibles disponibles. Objeto con aspecto de adaptador de pared y enchufe de clavijas planas: **sin identificar**.

---

## 5. Conexiones y pines (diseño actual)

| ESP32 | Va a | Notas |
|---|---|---|
| VIN | Riel de 5 V (OUT+ del LM2596) | Nunca con USB y LM2596 a la vez |
| GND | GND común | Todas las tierras unidas |
| 3V3 | VCC del DS3231 | Pull-ups del módulo a 3,3 V |
| GPIO21 (SDA) / GPIO22 (SCL) | SDA / SCL del DS3231 | I2C |
| GPIO25 | IN del **Songle (R1)** | Activo en alto; enciende el inversor |
| GPIO32 | IN del **módulo azul (R2)** | Hoy: nivel bajo, ver 11.2. Era GPIO26 |
| GPIO27 | Interruptor a GND | Cerrado = Wi-Fi apagado; sin cable = encendido |
| GPIO2 | LED azul de la placa | Indica toque y "sin hora" |

Potencia:
- LOAD + del controlador → LM2596 IN+ y → contacto COM de R1 → NO de R1 → IN+ del inversor.
- LOAD − → LM2596 IN− y cable grueso → IN− del inversor.
- LM2596 OUT+ → riel 5 V → VIN del ESP32 y VCC de ambos relés. OUT− → GND común.
- Inversor L → COM de R2 → NO de R2 → campana; N directo a la campana. Pulsador de pared en paralelo con COM/NO de R2.
- Práctica sin campana: COM de R2 a 5 V; NO → 330 Ω → LED (pata larga) → GND.

Diagramas: `ESP32/diagrama_completo_solarbell.svg/.png` (campana real) y `ESP32/diagrama_practica_led.svg/.png` (LED).

---

## 6. Firmware `solarbell_local` (v0.4.1)

### 6.1 Qué hace
- Crea la red Wi-Fi **`SolarBell`** (192.168.4.1) y, si hay `WIFI_CASA_NOMBRE`, se une también a la red de casa (hostname `solarbell`).
- Guarda el horario en LittleFS y la zona/último minuto tocado en Preferences. Reloj por DS3231 si responde; si no, el
  teléfono lo pone en cada conexión.
- Revisa el horario cada 500 ms y ejecuta los timbrados; secuencia R1 → espera → R2 (sección 3.3).
- LED azul GPIO2: parpadeo lento = sin hora; 2 destellos = se unió un teléfono o se guardó el horario; fijo = toque en curso.

### 6.2 API HTTP (`http://192.168.4.1` o la IP de casa)
| Ruta | Qué hace |
|---|---|
| `GET /api/status` | firmware, `clockSet`, `now`, `offsetMinutes`, `scheduleRevision`, `run` (toque en curso con `elapsedMs`) |
| `GET /api/schedule` | Horario guardado (`weekly`, `specials`) |
| `PUT /api/schedule` | Reemplaza el horario completo; sube `scheduleRevision` |
| `POST /api/clock` | `{ "now": <ms epoch>, "offsetMinutes": -300 }` |
| `POST /api/ring` | `{ "rings", "ringMs", "pauseMs", "customDurations", "customPauses" }` toca ahora |
| `POST /api/ring/stop` | Corta el toque en curso |

Errores: `{ "detail": "..." }` con 400, 413, 422 o 500. Durante el arranque del inversor, `elapsedMs` es 0.

### 6.3 Opciones de `configuracion.h`
| Macro | Valor actual | Función |
|---|---|---|
| `RED_NOMBRE`, `RED_CLAVE` | SolarBell, (clave) | Red propia; clave mínima de 8 caracteres |
| `ZONA_MINUTOS` | -300 | Colombia (UTC−5) |
| `PAUSA_TOQUE_MS` | 1000 | Pausa entre toques (provisional) |
| `PIN_LED` | 2 | LED azul |
| `USAR_DS3231` | 1 | Reloj externo |
| `PIN_RELE` | 32 | Relé de la campana (R2) |
| `RELE_ACTIVO_EN_BAJO` | 1 | Apaga soltando el pin y activa bajándolo a 0 V |
| `PIN_INVERSOR` | 25 | Relé del inversor (R1), activo en alto |
| `ARRANQUE_INVERSOR_MS` | 2000 (por defecto) | Espera del inversor antes de tocar |
| `WIFI_CASA_NOMBRE`, `WIFI_CASA_CLAVE` | KATIA, (clave) | Wi-Fi de casa (2,4 GHz) |
| `PIN_INTERRUPTOR_WIFI` | 27 | Interruptor de Wi-Fi |

### 6.4 Compilar y subir
- `arduino-cli` incluido en el IDE: `/opt/arduino-ide/resources/app/lib/backend/resources/arduino-cli` (el sistema no lo
  tiene en el PATH). Núcleo `esp32:esp32` 3.3.12; librerías ArduinoJson y RTClib ya instaladas.
- Compilar: `arduino-cli compile --fqbn esp32:esp32:esp32 ESP32/solarbell_local`.
- Subir: `arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32 ESP32/solarbell_local`.
- **Siempre con la batería y el LM2596 desconectados** (nunca USB y 5 V del LM a la vez).
- Leer la salida serie a 115200 (el monitor de `arduino-cli` no reinicia la placa; se usa `esptool ... read-mac` para
  reiniciar y luego `cat /dev/ttyUSB0`).

### 6.5 Historial de versiones
- 0.3.x: Wi-Fi propio, horario en flash, modo "Wi-Fi de casa".
- 0.3.2: interruptor de Wi-Fi (GPIO27).
- 0.4.0: relé R1 (inversor) con arranque previo de 2 s.
- 0.4.1: lógica de relé de nivel bajo soltando el pin (`RELE_ACTIVO_EN_BAJO`).

---

## 7. App (APK Android)

- Stack: React 19 + Vite 8 + Bun + Tailwind v4 + Motion + React Router; empaquetada con Capacitor. Mobile-first en español.
- Módulos: **Inicio** (cuenta regresiva y timbrados de hoy), **Horario** (CRUD de timbrados y días activos),
  **Tocar** (botón de campana con ajustes y detener), **Fechas especiales**, **Campana** (conexión, reloj, firmware, cómo
  unirse a la red, apariencia).
- Conexión: por defecto `http://192.168.4.1`. **Campo "Dirección de la campana"** (pestaña Campana) para escribir la IP de la
  red de casa (hoy `192.168.1.88`, cambia por DHCP). `VITE_DEVICE_URL` fija una dirección al compilar.
- APK de depuración: `cd frontend && bun run apk` con JDK 21 (`~/.local/share/mise/installs/java/21`) y
  `ANDROID_HOME=~/Android/Sdk`. Salida: `frontend/android/app/build/outputs/apk/debug/SolarBell-APK.apk`.
- En el navegador: `SOLARBELL_DEVICE=http://<IP> bun run dev`.
- La app pone la campana en la hora del teléfono al conectarse y recoge cambios de otros teléfonos por `scheduleRevision`.

---

## 8. Redes y conectividad

- `SolarBell`: siempre disponible (si el Wi-Fi no está apagado por el interruptor).
- Red de casa **KATIA** (2,4 GHz): el ESP32 se une como estación. El PC y el teléfono pueden estar en KATIA 5G (misma subred, probado).
- Colegio: pedir permiso; debe ser 2,4 GHz, sin portal de inicio de sesión, sin aislamiento de clientes y con IP reservada.
- El firmware guarda **una sola** red de casa (se puede ampliar a varias).
- IPs vistas por DHCP: .81, .90, .88. **Reservar la IP en el router.**
- En modo mixto el canal del punto de acceso se ajusta al del router: un teléfono unido a `SolarBell` puede desconectarse.
- La API no tiene clave propia; cualquiera en la red de casa podría llamarla.

---

## 9. Puesta en marcha y reglas de seguridad

1. Ajustar el LM2596 a **5,0 V sin carga** y medirlo antes de conectar el ESP32.
2. Armar con el LOAD del controlador apagado; revisar continuidad (sin energía): 5 V contra GND no debe sonar, 12 V contra GND tampoco;
   todos los GND deben sonar entre sí.
3. Subir el firmware por USB **sin batería** ni 5 V del LM2596.
4. Probar primero con LED + resistencia (práctica), nunca con la campana ni los 110 VAC.
5. El LED siempre con resistencia (330 Ω a 5 V ≈ 9 mA; 1 kΩ a 12 V ≈ 10 mA); varios LEDs en paralelo, **una resistencia por LED**.
6. Todo lo de **110 VAC en caja cerrada**, empalmes en regletas (no cinta), revisado por alguien con experiencia; no
   probar con la campana hasta confirmar el circuito original (H2 y H3).
7. No poner nunca en paralelo la red 110 VAC y la salida del inversor hacia la campana.
8. La pantalla del controlador apagada indica que no hay voltaje en LOAD.

---

## 10. Cronología de lo hecho

- Se recibió el hardware heredado y se documentó (inventario, fotos, hipótesis).
- Se compiló y subió el firmware `solarbell_local` al ESP32; se unió a la red de casa y respondió la API.
- Se corrigió el APK (dirección configurable) y se compiló de nuevo con JDK 21.
- Se agregó el interruptor de Wi-Fi (GPIO27) y se dibujaron los diagramas (práctica con LED y completo).
- Se agregó el relé R1 para el inversor y se pasó la alimentación del inversor a LOAD; se quitó el interruptor y los fusibles.
- Se probaron los relés con LED: el Songle funciona; el módulo azul **no se apaga** conectado al ESP32 (sección 11.2).

---

## 11. Problemas encontrados

### 11.1 La app no conectaba desde el Wi-Fi de casa — RESUELTO
El APK tenía `192.168.4.1` fijo. Se agregó el campo "Dirección de la campana".

### 11.2 Relé azul siempre activado en reposo — CAUSA IDENTIFICADA, SIN CERRAR
**Síntomas:** LED verde del módulo encendido (luego tenue) y LED del circuito encendido siempre.

**Pruebas y mediciones**
- Con el cable de IN **suelto**, el relé se apaga. IN a GND lo enciende; IN a VCC lo apaga (módulo de **nivel bajo**).
- Conectado al GPIO26 o al GPIO32, nunca se apaga del todo, ni con el pin en alta impedancia ni en alto.
- Con el pin en alta impedancia, IN marca **3,88 V** en reposo y baja a **0,9 V** durante el toque.
- El ESP32 sí baja el pin durante el toque (el firmware imprime `[rele] ON/OFF`).

**Causa:** el módulo necesita IN > ~4,3 V para apagarse, pero el **diodo de protección interno del pin del ESP32** (hacia 3,3 V)
sujeta IN en ~3,9 V, así que el transistor PNP del módulo queda semiconduciendo y el relé medio activado. El brillo tenue
del LED verde y su parpadeo con el Wi-Fi son esa fuga.

**Soluciones**
1. **Transistor NPN como traductor** (recomendada): GPIO → 1 kΩ → base; emisor a GND; colector al pin IN del módulo. El ESP32 no
   toca IN y el módulo sube solo a 5 V. Firmware: lógica normal (alto = encendido), se quita `RELE_ACTIVO_EN_BAJO`.
2. Remiendo: un LED o diodo en serie con IN (ánodo a IN, cátodo/raya hacia el ESP32); puede quedar justo.
3. Práctica inmediata: usar el **Songle** (GPIO25, activo en alto) para el LED/campana y dejar el azul para después.

Con el cambio, en reposo IN debe marcar ~5 V. Compra sugerida: 2 a 3 transistores **NPN** (BC547, 2N3904, 2N2222A; **no PNP**: BC557,
2N3906, S8550) y 2 a 5 resistencias de 1 kΩ.

### 11.3 ESP32 se cae del USB y se reinicia — ABIERTO
`dmesg` muestra `failed to send control message: -110` y el puerto USB desaparece, sobre todo al subir firmware y al activar
relés alimentados por USB (cada bobina gasta 70–90 mA; el USB se hunde). Se ve también como reloj sin hora y contador de toques
vuelto a 1. Mitigación: cable de datos bueno, otro puerto, probar con los relés desconectados y **alimentar por el LM2596** (sin USB).
Con batería y LM2596 el relé azul hace clic y el toque suena.

### 11.4 USB y LM2596 a la vez — EVITAR
Si el VIN del ESP32 está unido al riel y el OUT+ del LM2596 está soldado al riel, el USB mete 5 V por la salida del LM
(se enciende solo). Para pruebas por USB se aisló el VIN y se alimentó el VCC del módulo desde VIN con un jumper. Regla: nunca los
dos a la vez.

### 11.5 Otros hallazgos
- La resistencia café-negro-negro-negro-café es **100 Ω** (no 1 kΩ).
- El LED azul de la placa también se enciende en los toques: es indicador, no un error.
- Sin DS3231 conectado, un corte de luz borra la hora hasta que la app se conecte (el firmware avisa por serie).
- El pulsador de pared solo suena mientras el inversor está encendido (durante un timbrado).
- Wi-Fi como punto de acceso: ~100 mA; medir. El interruptor de Wi-Fi apagado no detiene el horario.
- La documentación de producto (`frontend/PRODUCT.md`) menciona una radio LoRa Ra-02 que **no se usa** en esta rama.

---

## 12. Hipótesis sin confirmar
- **H1:** el ESP32 anterior se quemó por alimentarlo a 14,6 V sin regulador.
- **H2:** el enchufe de clavijas planas y el objeto negro alimentaban la campana, cargaban la batería o el ESP32. Verificar con todo
  desconectado.
- **H3:** el pulsador de pared estaba en paralelo con los contactos del relé, en la línea de 110 VAC.

---

## 13. Decisiones abiertas
- Radio LoRa: ¿hace falta más alcance que el Wi-Fi?
- ¿Wi-Fi siempre encendido o solo con botón (consumo)?
- Pausa entre toques consecutivos (provisional 1000 ms).
- ¿Cargador de red 110 VAC a la batería (opcional) o solo solar?
- Ampliar el firmware a varias redes Wi-Fi guardadas.
- Historial de toques y estado de la batería en la app.
- ¿Cómo mantiene encendido el inversor el pulsador de pared fuera de los timbrados? (opciones: inversor siempre encendido,
  campana desde la red, o un pulsador de 3,3 V al ESP32).

---

## 14. Pendientes
- [ ] Comprar 2–3 transistores NPN y 2–5 resistencias de 1 kΩ; armar el traductor del módulo azul; actualizar firmware y diagrama.
- [ ] Cambiar la resistencia de base del Songle de 100 Ω a 1 kΩ.
- [ ] Práctica: pasar el LED + 330 Ω al Songle si se opta por esa vía y ajustar el firmware (GPIO25 como relé de campana).
- [ ] Resolver las caídas del USB y estabilizar la alimentación del ESP32; probar todo con batería (sin USB).
- [ ] Confirmar que el LM2596 está a 5,0 V y verificar el riel con multímetro.
- [ ] Conectar el DS3231 y probar la hora tras un corte.
- [ ] Medir: potencia de la campana (vatímetro), consumo del inversor en vacío, consumo del Wi-Fi y del ESP32 con relés.
- [ ] Verificar el controlador PWM: voltajes de LVD y de carga, y que LOAD entregue 12 V.
- [ ] Reservar la IP del ESP32 en el router; decidir IP fija o configurable en el APK.
- [ ] Leer etiquetas del adaptador y del pulsador EXE; seguir los cables al techo y el empalme con cinta; identificar la placa ESP de la foto 3.
- [ ] Registrar el pulsador EXE en el inventario.
- [ ] Probar el modo Wi-Fi del colegio (permiso del administrador).
- [ ] Revisar y hacer commit de los cambios (firmware 0.4.1, diagramas, README, docs, frontend).

---

## 15. Lista de compras sugerida
| Cantidad | Pieza | Para qué |
|---|---|---|
| 2–3 | Transistor NPN (BC547 / 2N3904 / 2N2222A) | Traductor ESP32 → módulo azul (uno de repuesto) |
| 2–5 | Resistencia 1 kΩ 1/4 W | Base del transistor y base del Songle |
| 2 (opcional) | Diodo 1N4007 | Protección de bobina si se cambia el módulo por un relé suelto |
| 1 (opcional) | Vatímetro enchufable | Medir la campana y el inversor |
| 1 (opcional) | Fusibles (2 A y ~10–15 A) con portafusible | Protección que hoy no existe |

---

## 16. Archivos importantes
- Firmware: `ESP32/solarbell_local/solarbell_local.ino`, `configuracion.ejemplo.h`, `configuracion.h` (local).
- README del firmware: `ESP32/README.md`. Guía antigua: `ESP32/PRUEBA_RAPIDA_RELE.md` (desfasada).
- Diagramas: `ESP32/diagrama_completo_solarbell.*`, `diagrama_practica_led.*`, `diagrama_prueba_led.svg`,
  `diagrama_prueba_rele_esp32.svg`, `diagrama_circuito_rele_ds3231_interruptor_wifi.svg` (etapas anteriores).
- App: `frontend/src/lib/device.ts`, `frontend/src/features/device/store.ts`, `frontend/src/pages/device/index.tsx`,
  `frontend/PRODUCT.md`, `frontend/DESIGN.md`.
- Docs: carpeta `docs/` (este archivo, inventario, contexto y decisiones, software y firmware).
- Repositorio: rama `main`.
