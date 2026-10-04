# Contexto de hardware — SolarBell

Fuente de verdad: las fotos en `docs/images/`. Si un listing, un sticker publicitario o un datasheet de marketplace contradice la pieza fotografiada, gana la foto.

SolarBell es un kit de **campana remota 12 V alimentada por solar**. El panel carga una VRLA; un inversor pasa a 110 V AC para la campana de techo; la lógica (relés + radio LoRa) decide cuándo suena. La app web es el control de ese nodo, no un producto solar genérico.

## Cadena confirmada

```
Panel 30 W / 18 V  →  PWM 12 V 10 A  →  batería VRLA 12 V
                                         ├→ inversor 12 V → 110 V 60 Hz → campana
                                         └→ buck LM2596 → 5 V (relés) y, con otro ajuste o LDO, 3.3 V (Ra-02)
```

Foto de conjunto: `664516a3-91b4-4533-b336-ddd17e826713.jpeg`. El controlador PWM va encima de la caja del inversor; la batería vive en la caja blanca; el cable de red sale del inversor.

## Bill of materials

### 1. Panel — Powest 30 W policristalino

Foto: `WhatsApp Image 2026-10-03 at 2.28.05 PM.jpeg` (etiqueta) y el conjunto.

| Campo | Valor en la etiqueta |
| --- | --- |
| Marca / modelo | Powest SZYL-P30-18C6C |
| Tipo | Policristalino, 36 celdas, 4 o 5 busbars |
| Pmax | 30 Wp ±3 % |
| Eficiencia | 13.1 % |
| Vmp / Imp | 18.0 V / 1.67 A |
| Voc / Isc | 21.3 V / 1.80 A |
| Vsys máx. | 600 V DC (dato de módulo, no del kit) |
| Fusible de serie | 10 A |
| Tamaño / peso | 510 × 450 × 25 mm / 2.8 kg |
| Rango | −40 °C a 85 °C |

En un banco 12 V PWM el panel opera cerca de ~14–15 V, no en Vmp 18 V. La cosecha real queda por debajo de 30 W.

### 2. Controlador — PWM 12/24 V 10 A

Foto: `65b83b04-3a77-4799-9f49-b2ec846d1282.jpeg`.

| Campo | Valor en la etiqueta |
| --- | --- |
| Tipo | Solar charge controller PWM |
| Tensión | 12 V / 24 V (este kit es 12 V) |
| Corriente | 10 A |
| Vpv máx. | 50 V |
| Potencia PV máx. | 130 W @ 12 V / 260 W @ 24 V |

El panel (Voc 21.3 V, ~30 W) cabe holgado. No usar las cifras de 130/260 W como si el arreglo las entregara.

### 3. Batería — Fullbattery / Powest VRLA

Foto de catálogo: `WhatsApp Image 2026-10-03 at 11.18.26 AM.jpeg`. No es una foto de la unidad instalada.

- Química: VRLA sellada (AGM de servicio general).
- Formato: caja UPS pequeña (~151 × 65 × 94 mm).
- La referencia impresa no se lee con certeza. En la línea Powest/Fullbattery ese formato es **12 V 7.5 Ah (FL1275 / FL1275GS)**, no 18 Ah.
- Energía nominal si es 12 V 7.5 Ah: **90 Wh**. En plomo, usable ~50 % → **~45 Wh**.
- Carga típica de esa línea: flotación 13.5–13.8 V, ciclo 14.4–14.8 V, corriente inicial menor a ~2.25 A. El PWM de 10 A sobra; el panel (~1.8 A) es el límite.

Confirmar modelo y Ah en la batería física antes de dimensionar autonomía.

### 4. Inversor — LY-1500, caja de mano

Foto: `WhatsApp Image 2026-10-03 at 11.19.12 AM.jpeg`.

| Lo que dice el sticker | Lo que corresponde a la pieza |
| --- | --- |
| LY-1500 Car Inverter | Modelo de caja chica de aluminio |
| DC 12 V → AC 110 V 60 Hz | Tensión de trabajo del kit. La campana es 110 V. |
| **1500 W** | **No cuadra.** La caja cabe en una mano, el cable AC es fino y no hay acometida de 100 A+ a la batería. |
| USB | Presente en el panel; no es carga del sistema. |

Un 1500 W continuo pediría ~125–150 A a 12 V. Una VRLA de ~7.5 Ah no lo soporta (serían ~20 C) y el panel de 30 W no la repondría. Tratar **1500 W como marketing**. Clase real de estas cajas: **~150–300 W** onda modificada, de sobra para una campana de techo (típicamente menos de 50 W, unos segundos).

El inversor en idle come vatios. Conviene cortarle el 12 V con relé cuando no hay toque; no dejarlo 24/7 sobre 90 Wh.

### 5. Buck — módulo LM2596

Foto / listing: `34b1e18c-619f-4519-b2d4-3ac9a741a663.jpeg`. La placa de la foto es el módulo azul clásico (IN+, IN−, OUT+, OUT−, trimmer).

| Listing del marketplace | Datasheet LM2596 (TI) / realidad del módulo |
| --- | --- |
| Entrada 3.2–40 V | Entrada garantizada **4.5–40 V**. 3.2 V no es spec del chip. |
| Salida 1.25–32 V | Ajustable ~1.2–37 V, **siempre menor que Vin** (solo step-down). |
| Eficiencia 92 % | Pico de catálogo; en 12 V → 5 V / 3.3 V suele ser menor. |
| 3 A | Techo del IC. El módulo chino típico se calienta; diseñar por debajo de 2 A. |

Desde la batería 12 V sirve para **5 V de los relés**. El Ra-02 es **3.3 V y no tolera 5 V** en pines. Hace falta un segundo punto a 3.3 V (otro buck, AMS1117, etc.) o un MCU que ya entregue 3V3.

### 6. Radio — Ai-Thinker Ra-02 (LoRa, no Wi-Fi)

Foto: `a0e22cfe-33c6-473f-bea8-1280ad615c62.jpeg`. Serigrafía **Ra-02**, conector IPEX, can metálico. No es ESP8266 ni ESP-12.

| Campo | Spec del módulo |
| --- | --- |
| Chip | Semtech SX1278 |
| Banda | 410–525 MHz (uso típico **433 MHz**) |
| Interfaz | SPI (NSS, SCK, MOSI, MISO) + RESET + DIO0–DIO5 |
| Alimentación | 2.7–3.6 V, típico 3.3 V. **No 5 V.** |
| TX | hasta +18 dBm (~65 mW); ~90–105 mA en TX |
| RX / standby | ~12 mA / ~1.6 mA |
| Antena | IPEX; hace falta antena 433 MHz. En la foto no está. |

El Ra-02 **no es un MCU**. Necesita un host SPI (Arduino, ESP32, etc.). Ese host **no aparece** en las fotos.

### 7. Relé de módulo 5 V (1 canal)

Foto: `796a40a1-c215-4da1-9109-eac1112a7605.jpeg`.

- Bornes VCC, GND, IN. Jumper de trigger alto/bajo.
- Bornes de potencia: COM / NO / NC (SPDT).
- Relé azul típico tipo Songle SRD-05: **10 A 250 V AC / 10 A 30 V DC**, bobina 5 V.
- Encaja para **cortar el 110 V de la campana**.

### 8. Relé Songle SRA-05VDC-CL

Foto: `WhatsApp Image 2026-10-03 at 11.16.43 AM.jpeg`.

| Campo | Datasheet SRA |
| --- | --- |
| Bobina | 5 V DC, ~42 Ω, ~120 mA, 0.60 W |
| Contactos | SPDT. NO: **20 A @ 14 V DC**; NC: 15 A @ 14 V DC |
| AC | 10 A @ 120 V AC (no usar el “20 A” del DC en 110 V) |
| Uso de fábrica | Automotriz (motores, bombas) |

Este es el relé para **12 V DC** (entrada del inversor). No es intercambiable con el módulo azul: uno está pensado para DC alto amperaje, el otro para AC de la campana.

### 9. Carga — campana de techo

Foto: `WhatsApp Image 2026-10-03 at 11.21.52 AM.jpeg`.

Campana tipo escolar/industrial, cúpula roja, montada en viga. Dos hilos. Con inversor a 110 V 60 Hz, la campana es **110 V AC**. No hay placa de watts en la foto; una de este tamaño suele estar en **15–50 W** unos segundos.

## Qué no cuadra (listing / sticker vs pieza)

1. **Inversor 1500 W** — sticker. La caja, el cableado y la batería no son un sistema de 1.5 kW. Usar 12 V → 110 V 60 Hz; ignorar 1500 W para cálculos y para copy de la app.
2. **LM2596 entrada 3.2 V** — listing. El chip arranca a 4.5 V. Además **no sube tensión**: de 12 V no se saca 18 V.
3. **Controlador 130 W / 260 W** — techo del PWM, no del panel. El arreglo es **30 W**.
4. **Ra-02 ≠ Wi-Fi**. Es LoRa 433 MHz por SPI. La app no habla con este módulo directo; hace falta un host y un camino teléfono → radio.
5. **Batería.** La imagen es de catálogo. No tratar “FL187500” ni 18 Ah como confirmados. Formato = 12 V ~7.5 Ah.
6. **Dos relés no son el mismo componente.** SRA-05 (20 A 14 V DC) y módulo 5 V 10 A AC.

## Huecos (no inventar)

- MCU host del Ra-02.
- Antena 433 MHz.
- Cómo la app llega al nodo (Wi-Fi en el host, gateway LoRa, USB, etc.).
- Modelo/Ah exactos de la VRLA instalada.
- Watts reales de la campana y del inversor (medir).
- Si el inversor queda siempre en línea o se conmuta por el SRA.

## Implicaciones para la app

- Dominio: **toque de campana** y estado del kit 12 V, no un inversor de 1500 W ni un monitor de planta.
- Números honestos si se muestran: panel 30 W, banco 12 V, radio LoRa. No copiar 1500 W, 130 W PV ni 3.2 V del listing.
- `/senales` encaja con toques / eventos de radio, no con telemetría inventada.
- Autonomía y “potencia disponible” solo con medidas; no estimar 1500 W ni 18 Ah.
