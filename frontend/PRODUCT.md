# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React 19 + Vite 8 + Bun + Tailwind v4 + Motion + React Router. Pedido explícito del usuario.

## Users

Quien dispara o programa una campana física (escolar / patio / taller) desde el teléfono, sin estar al lado del pulsador.

El perfil demográfico y el sitio exacto de instalación no están confirmados.

## Product Purpose

SolarBell es el control mobile-first de un **nodo de campana alimentado por un kit solar 12 V**.

El hardware ya existe y está documentado en `docs/md/contexto.md` (fotos en `docs/images/`). La app no inventa otra planta solar: toca la campana y, cuando haya telemetría real, muestra el estado de ese kit.

Éxito de v1: un toque en el teléfono corresponde a un toque audible en la campana, sin copiar specs de marketplace.

## Positioning

Campana remota off-grid con radio **LoRa (Ra-02 / 433 MHz)**, no un timbre Wi-Fi de consumo ni un dashboard solar genérico.

El puente teléfono → LoRa todavía no está en las fotos.

## Constraints

- Mobile-first: se diseña primero para teléfono; desktop es una ampliación.
- Craft de interfaz: Emil Kowalski (motion, detalles nativos) + Impeccable + frontend-design.
- No desactivar zoom. Inputs ≥ 16px. Probar en hardware real cuando el cambio toque touch, teclado o safe areas.
- Las specs de producto salen de las piezas fotografiadas. Listings y stickers publicitarios (p. ej. inversor “1500 W”) no se usan como verdad. Detalle en `docs/md/contexto.md`.
- Banco 12 V, campana 110 V AC vía inversor, lógica a 5 V, radio a 3.3 V.

## Voice

Español claro y corto. Instrumento de campo, no marketing de vatios inflados.

## Evidence

- Panel Powest 30 W, modelo SZYL-P30-18C6C.
- PWM 12/24 V 10 A.
- Batería VRLA Fullbattery/Powest formato 12 V ~7.5 Ah (Ah exactos por confirmar en la unidad).
- Inversor LY-1500: 12 V → 110 V 60 Hz. Los 1500 W del sticker no corresponden a la caja ni al banco.
- Buck LM2596 (step-down).
- Relé módulo 5 V (AC campana) + Songle SRA-05VDC-CL (12 V DC).
- Radio Ai-Thinker Ra-02 (SX1278, SPI). No es Wi-Fi.
- Campana de techo, cúpula roja.

## Módulos v1 (confirmados por el usuario)

- **Inicio**: fecha de hoy, cuenta regresiva con segundos al próximo timbrado y su hora. Tarjeta con timbrados de hoy, restantes y fechas especiales próximas; la gráfica va de 2 h antes del primer timbrado a 1 h después del último, con una barra que avanza con la hora. Bajo la gráfica se nombra el próximo timbrado, sobre el fondo de la tarjeta.
- **Horario**: horario global (por defecto lunes a viernes, 8:00, 10:00 y 12:00). CRUD de timbrados con nombre, hora, veces que suena y duración por toque; opciones avanzadas para duración por toque individual. Días activos editables de lunes a viernes. Sábado y domingo se cubren con una fecha especial.
- **Tocar**: botón de campana dibujado; al presionarlo abre un bottom sheet para elegir veces que suena, duración por toque y opciones avanzadas (duración por toque individual), y lo ejecuta enseguida. Recuerda la última configuración y muestra el toque en curso con opción de detener.
- **Fechas especiales**: una fecha reemplaza el horario solo ese día, con horario especial propio o sin timbrado.
- **Campana** (reemplaza a Perfil en esta rama): conexión, reloj y firmware de la campana, cómo unirse a su red y apariencia (claro u oscuro).

## Decided (rama `offline-local`)

- **Sin internet ni servidor**: la versión con backend sigue en `main`.
- **MCU**: ESP32 (`ESP32/solarbell_local`). Crea su propia red Wi-Fi `SolarBell`; la app le habla por HTTP en `192.168.4.1`. Por ahora sin relé: el LED azul integrado simula cada toque.
- **App**: APK con Capacitor. Mismas pantallas que la web.
- **Horario**: vive en la flash del ESP32 y lo toca la campana con su reloj, aunque el teléfono se vaya. La app manda el horario completo en cada cambio; si la campana no está al alcance, el cambio no se guarda y la app vuelve a la última copia.
- **Reloj**: la app pone la campana en la hora del teléfono al conectarse. Con DS3231 la hora aguanta cortes de luz; sin él, no toca el horario hasta la próxima conexión.
- **Sin login**: la protección es la clave de la red Wi-Fi de la campana.
- **Toque manual**: `POST /api/ring`; la campana lleva el tiempo y la app lo lee de `/api/status`.

## Open decisions

- Radio LoRa (Ra-02): si hace falta para llegar a la campana desde más lejos que el Wi-Fi.
- Consumo del Wi-Fi siempre encendido (~100 mA) sobre la VRLA del kit; quizá encenderlo solo con un botón.
- DS3231: no aparece en las fotos del kit.
- Pausa entre toques consecutivos de un mismo timbrado: provisional `PAUSA_TOQUE_MS=1000`, no confirmada.
- Historial de toques y batería.
- Ah exactos de la VRLA y watts reales de inversor/campana
