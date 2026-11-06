# SolarBell: contexto histórico, decisiones y pendientes

> Documento vivo. Complementa `inventario_tecnico_componentes_solarbell.md`.
> Última actualización: 2026-10-12 (v4: foto del interior de la caja y nota sobre LEDs). Actualizar cada vez que se decida o se descubra algo nuevo.

## 1. Origen del proyecto (herencia, no inicio desde cero)

- SolarBell es la **continuación / reconstrucción** de un proyecto hecho antes por otro grupo, en la **misma asignatura de la universidad**.
- El sistema anterior era un timbre/campana automatizado con energía solar (panel + controlador + batería + inversor + ESP32). **Funcionaba bien** con estos mismos componentes.
- Falla del grupo anterior: se les dañó el equipo. Según lo que sabe el equipo actual, **un técnico del colegio "quemó" el dispositivo** (el ESP32 quedó quemado). No fue culpa del grupo anterior.
- Estado en que se recibió el hardware:
  - ESP32: quemado.
  - Batería FuliBattery MR 1330 (~1.3 Ah): sulfatada, inservible (2.65 V en reposo). Llevaba ~1.5 a 2 años sin cargarse.
  - Panel solar y demás componentes: aparentemente bien.
- **No hay contacto con el grupo anterior.** No hay documentación, esquemas ni código. Fotos: solo las 3 de la sección 1.1 (tomadas por el equipo actual al revisar el montaje).
- **La campana no se puede manipular/abrir**, y se desconocen sus especificaciones (potencia, tensión, tipo de carga).
- El sistema original tenía además un **botón manual** para activar el timbre directamente (ver 1.1 y H3).

### 1.1 Evidencia fotográfica (2026-10-12)

- **Foto 1, montaje en pared:** el controlador de carga PWM azul con pantalla LCD y puertos USB está sobre una caja plástica blanca fijada a la pared. Encima hay una caja de aluminio (parece ser el inversor LY-150 con su chasis disipador). Un cable blanco sube hacia el techo y otro sube por la esquina de la pared. **Cuelga un enchufe de dos clavijas planas (110 V) con su cable**, sin estar conectado en la foto. No se sabe a qué alimentaba ni de dónde.
- **Foto 2, botón manual:** es un **pulsador de pared para timbre** (marca EXE, tecla blanca con el símbolo de campana), montado en caja de superficie, con un cable plano blanco tipo "cordón". **Es de retorno automático (se suelta y vuelve).** Los pulsadores de timbre de este tipo se fabrican para tensión de red (típicamente 6 a 10 A, 125/250 VAC; confirmar leyendo la parte trasera).
- **Foto 3, interior de la caja (observaciones, sin confirmar):** caja plástica blanca con dos compartimentos. En uno hay una batería sellada negra (bornes con terminales amarillos de pala, un borne con tapa roja). En el otro, una placa perforada naranja (baquelita) con un módulo de relé azul y una placa pequeña con módulo tipo ESP (con blindaje metálico), cableado con jumpers amarillos, rojos y negros. A la derecha, **un objeto negro con etiqueta y un conector gris/azul parecido a una clavija**, con cables rojo y negro de salida: podría ser un adaptador o cargador de pared (por confirmar leyendo su etiqueta). Varios cables blancos salen por arriba hacia el techo, y **uno de ellos tiene un empalme cubierto solo con cinta aislante negra**.

## 2. Mejoras que el equipo actual ya añadió respecto al diseño anterior

1. **Módulo RTC DS3231 (HW-084)**: el diseño anterior no tenía reloj de tiempo real.
2. **Regulación de voltaje (LM2596S step-down)**: el diseño anterior no tenía regulador. Ver hipótesis H1 abajo.
3. Batería nueva operativa: FuliBattery FL1275GS 12 V 7.5 Ah.
4. Dos ESP32 disponibles (uno de respaldo).

## 3. Hipótesis (NO confirmadas, verificar)

- **H1: causa probable del ESP32 quemado.** Si el diseño anterior alimentaba el ESP32 directo desde la batería de 12 V sin regulador, la tensión de carga (hasta 14.6 a 14.8 V) lo destruye. Esto encaja con el síntoma y puede ser independiente de la acción del técnico. Verificar si hay marcas de quemado en la placa o en el pin VIN.
- **H2: conexión a la toma de corriente (110 VAC) en el diseño anterior.** Hay un enchufe colgando junto al controlador (foto 1) y un objeto con aspecto de adaptador dentro de la caja (foto 3). Posibles usos: (a) cargar la batería cuando el sol no alcanzaba, (b) alimentar la campana directamente desde la red y usar el inversor solo como respaldo, (c) ser la salida del inversor hacia la campana (clavijas **con tensión** cuando el inversor está encendido), (d) alimentar un cargador del ESP32. **Verificar con el equipo desconectado** a dónde va cada cable.
- **H3: botón manual en el circuito de la campana (110 VAC), en paralelo con los contactos del relé.** Un pulsador de timbre de pared cerraría el mismo circuito que cierra el relé (contactos COM y NO) y el timbre sonaría aunque el ESP32 no funcionara. El relé del inventario (10 A a 250 VAC) es compatible con esa conexión.

## 4. Datos clave de diseño (calculados del inventario)

- Energía de la batería FL1275GS: ~90 Wh brutos, ~45 Wh utilizables (no bajar del 50 % para cuidar el plomo-ácido).
- Generación estimada del panel de 30 Wp: ~80 a 100 Wh/día (4 h sol pico, 70 % de rendimiento). Valor a validar en sitio.
- **El consumo dominante es el inversor encendido en vacío** (típico 5 a 10 W para 150 W, es decir ~120 a 240 Wh/día): supera lo que genera el panel. Debe medirse el consumo real del LY-150 en vacío.
- Una campana de ≤100 W tomaría ~8 a 10 A de la batería durante unos segundos: aceptable. Con 150 W, ~12.5 A: al límite.
- La salida DC Load del controlador PWM soporta solo 10 A: **el inversor va directo a la batería (con fusible), no a esa salida.**

## 5. Arquitectura recomendada (propuesta, sujeta a H2 y H3)

```
Panel 30W ──► Controlador PWM ──► Batería 12V 7.5Ah ──┬──► Buck LM2596 (5.0 V) ──► ESP32 + RTC + módulo relé
                                        ▲              │
Red 110 VAC ──► Cargador 13.6-13.8 V (≤2 A, opcional) ┘└──► Inversor 150 W ──► [línea 110 VAC] ──► Campana
                                                                                    ▲
                                                  Contactos del relé (COM/NO) ──────┤ en paralelo
                                                  Pulsador de pared (EXE) ──────────┘
```

Reglas:
1. ESP32 alimentado **siempre** por el buck a 5.0 V (medir con multímetro ANTES de conectar el ESP32).
2. Cargador de red a la batería (opcional): flotación 13.6 a 13.8 V, límite ≤2 A (la batería admite <2.16 A), con fusible.
3. ESP32 en **deep sleep** con despertar por la alarma del DS3231 (pin SQW al pin RTC del ESP32) para ahorrar batería.
4. Nunca poner en paralelo la red 110 VAC y la salida del inversor hacia la campana. Si se quiere doble fuente, usar un relé conmutador (SPDT) que elija una u otra.
5. Fusible en el positivo de la batería (~15 A para el inversor) y caja cerrada con candado/etiqueta para evitar manipulación (riesgo que ya dañó el equipo anterior).
6. DS3231 HW-084: usar pila recargable LIR2032 o retirar la resistencia/diodo de carga si se usa CR2032 no recargable.
7. Todo cableado a 110 VAC debe quedar en caja cerrada, con clavijas nunca expuestas con tensión, empalmes en regletas o conectores (no solo cinta) y revisado por alguien con experiencia.
8. **LEDs indicadores (5 mm):** R = (V − Vf) / I, con I ≈ 5 a 10 mA. Vf típico: rojo ~2.0 V, verde ~2.2 a 3.0 V, azul ~3.0 a 3.2 V. Una resistencia de **1 kΩ sirve** a 5 V (~3 mA, tenue pero visible) y a 12 V (~10 mA, bien). A **3.3 V** (GPIO del ESP32) el rojo se ve apagado con 1 kΩ (~1.3 mA): usar 220 a 330 Ω; el verde y el azul casi no encienden a 3.3 V sin importar la resistencia, así que alimentarlos desde 5 V con transistor o usar el rojo en GPIOs. Corriente máxima recomendada por GPIO: ~12 mA.

### 5.1 Botón manual: decisión actual

- El botón es un **pulsador de pared de timbre, con retorno automático** (foto 2). Puede reutilizarse tal cual.
- **Opción recomendada (probable diseño original, a prueba de fallas):** dejar el pulsador de pared en paralelo con los contactos COM/NO del relé, en la línea de 110 VAC de la campana. Funciona aunque el ESP32 esté muerto. No conectar nunca este pulsador a un pin del ESP32 (llevaría 110 V).
- **Condición:** para que el pulsador suene en modo solar, la línea de la campana debe tener tensión (inversor encendido o red). Si el inversor permanece apagado entre timbres, el pulsador no sonará. Opciones: (a) alimentar la campana desde la red cuando haya y usar el inversor solo de respaldo, (b) dejar el inversor encendido si el consumo en vacío resulta tolerable (medirlo primero), (c) añadir un segundo pulsador pequeño (3.3 V) hacia el ESP32 que encienda inversor y relé.

## 6. Pendientes / información que falta

- [ ] Leer la etiqueta del objeto negro dentro de la caja (foto 3): tensión de entrada y salida. ¿Es un adaptador/cargador?
- [ ] Leer en la parte trasera del pulsador EXE su tensión y corriente nominales.
- [ ] Determinar a qué va el enchufe de clavijas planas (foto 1) y de dónde viene. **Con todo desconectado.** No enchufarlo hasta saberlo.
- [ ] Seguir el cable plano del pulsador y los cables blancos que suben al techo hasta su destino (campana, inversor, relé). Identificar el empalme con cinta negra.
- [ ] Identificar la placa pequeña con módulo ESP de la foto 3 (modelo exacto) y cómo está alimentada.
- [ ] Potencia, tensión y tipo (solenoide, motor, electrónica) de la campana. Medir con un vatímetro enchufable.
- [ ] Confirmar que la caja de aluminio de la foto 1 es el inversor LY-150, y su tipo de onda.
- [ ] Medir en sitio el consumo en vacío del inversor.
- [ ] Definir el horario de timbres y su lógica (tabla de horarios en el ESP32 + RTC).
- [ ] Decidir si se incluye cargador de red o solo solar.
- [ ] Verificar el controlador PWM: voltajes de LVD y de carga configurados.
- [ ] Registrar en el inventario el pulsador de pared EXE.

## 7. Registro de decisiones

| Fecha | Decisión / hallazgo |
|---|---|
| 2026-10-12 | Se crea este documento. Se confirma que el proyecto es continuación de uno anterior de la misma asignatura. Se documentan hipótesis H1 y H2. |
| 2026-10-12 | Recomendación inicial: apagar el inversor entre timbres con relé; ESP32 por buck a 5 V; cargador de red opcional a la batería como respaldo. |
| 2026-10-12 | Se informa que no hay fotos del montaje original y que existía un botón manual. Se agrega H3 y opciones de botón. |
| 2026-10-12 | Fotos 1 y 2: el botón es un pulsador de pared de timbre (EXE, retorno automático) y hay un enchufe colgando junto al controlador. Se descarta llevar el pulsador al ESP32. Recomendación: pulsador en paralelo con los contactos del relé en la línea de 110 VAC. |
| 2026-10-12 | Foto 3 del interior de la caja: batería, relé, placa ESP, un objeto con aspecto de adaptador de pared y un empalme con cinta. Se agrega la regla 8 sobre resistencias para LEDs (1 kΩ sirve a 5 y 12 V). |
| 2026-10-19 | Se decide alimentar el inversor desde la salida LOAD del controlador PWM (a través del relé R1), no directo de la batería. Ventaja: el corte LVD protege la batería. Límite: LOAD aguanta 10 A (~100 W a 12 V), por debajo de los 150 W del LY-150: medir el consumo real de la campana. Sustituye la regla de la sección 4 sobre conectar el inversor directo a la batería. |
