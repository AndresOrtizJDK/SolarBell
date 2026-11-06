# Inventario Técnico de Componentes - Proyecto SolarBell

Este documento consolida la ficha técnica detallada de todos los elementos, módulos y accesorios registrados para el diseño e implementación del sistema automatizado **SolarBell**.

---

## 1. Sistema de Generación y Almacenamiento Solar

### Panel Solar Fotovoltaico
* **Marca / Modelo:** Powest SZYL-P30-18C
* **Tipo de celda:** Silicio policristalino (36 celdas en serie, arreglo de 4 o 5 barras colectoras / busbars)
* **Potencia máxima nominal ($P_{\text{max}}$):** 30 Wp ($\pm 3\%$)
* **Voltaje de circuito abierto ($V_{oc}$):** 21.3 VDC
* **Corriente de cortocircuito ($I_{sc}$):** 1.80 A
* **Voltaje a potencia máxima ($V_{mp}$):** 18.0 VDC
* **Corriente a potencia máxima ($I_{mp}$):** 1.67 A
* **Eficiencia del módulo:** 13.1%
* **Tensión máxima del sistema:** 600 VDC
* **Fusible de serie máximo:** 10 A
* **Rango de temperatura de operación:** $-40^\circ\text{C}$ a $+85^\circ\text{C}$
* **Dimensiones físicas:** 510 mm $\times$ 450 mm $\times$ 25 mm
* **Peso:** 2.8 kg
* **Certificaciones:** IEC 61215, IEC 61730, CE, MCS, ISO 9001/14001, CIDET

### Controlador de Carga Solar PWM
* **Tecnología de regulación:** PWM (Modulación por Ancho de Pulsos) con microcontrolador integrado (MCU control)
* **Interfaz de usuario:** Pantalla digital LCD con indicadores de estado e iconos animados
* **Tensión nominal de trabajo:** Autodetección automática 12V / 24V
* **Corriente nominal de operación:** 10 A
* **Voltaje fotovoltaico máximo de entrada ($V_{\text{max}}$):** 50 V
* **Potencia fotovoltaica admisible:**
  * Hasta 130 W operando a 12V
  * Hasta 260 W operando a 24V
* **Salidas auxiliares reguladas:** 2 puertos USB hembra frontales de 5V DC
* **Regleta de conexión:** 6 bornes de tornillo (Entrada Panel PV $\pm$, Batería $\pm$, Salida de carga DC Load $\pm$)
* **Protecciones y funciones:**
  * Temporizador configurable (*Built-in timer*)
  * Protección contra descarga profunda (*Low Voltage Disconnect - LVD*)
  * Protección contra sobrecarga y cortocircuito en salida Load
  * Parámetros de voltaje programables (*SET voltage*)

### Batería Operativa Principal (En uso)
* **Marca / Modelo:** FuliBattery FL1275GS
* **Tecnología:** VRLA recargable (plomo-ácido sellada regulada por válvula, no derramable)
* **Voltaje nominal:** 12 VDC
* **Capacidad nominal:** 7.5 Ah / 20 HR (almacenamiento teórico bruto de ~90 Wh)
* **Voltaje de recarga cíclica (*Cycle use*):** 14.6 V – 14.8 V a $25^\circ\text{C}$
* **Voltaje de recarga en flotación (*Standby use*):** 13.7 V – 13.9 V a $25^\circ\text{C}$
* **Corriente inicial de carga máxima permitida:** Menor a 2.16 A
* **Certificaciones:** RU MH48936, CE, reciclable Pb

### Batería Auxiliar / Descartada
* **Marca / Modelo:** FuliBattery MR 1330
* **Tecnología:** VRLA plomo-ácido sellada
* **Voltaje nominal:** 12 VDC
* **Capacidad estimada:** ~1.3 Ah
* **Estado actual:** Inoperativa por colapso químico/sulfatación irreversible (tensión en reposo de 2.65V)

---

## 2. Etapa de Potencia y Conversión AC

### Inversor de Voltaje DC a AC
* **Modelo comercial:** CAR INVERTER LY-150
* **Voltaje de entrada:** 12 VDC
* **Voltaje de salida AC:** 110 VAC a 60 Hz
* **Potencia nominal continua:** 150 W
* **Tecnologías integradas:**
  * L.I.T (*Low Interference Technology* / Tecnología de baja interferencia)
  * Arranque suave (*Soft Start*) para amortiguar picos inductivos
  * Ventilación forzada con turboventilador de enfriamiento (*Turbo Cooling*)
  * Salida USB integrada en chasis de aluminio disipador

### Convertidor Reductor DC-DC (Step-Down / Buck)
* **Modelo de placa:** Módulo Step-Down LM2596S
* **Circuito integrado:** LM2596S en encapsulado SMD TO-263
* **Rango de tensión de entrada ($V_{in}$):** 4.5 VDC a 35 VDC / 40 VDC
* **Rango de tensión de salida ($V_{out}$):** 1.25 VDC a 35 VDC (ajustable con potenciómetro multivuelta azul W103)
* **Corriente de salida nominal:** 2.0 A continuo (hasta 3.0 A con disipación térmica adecuada)
* **Frecuencia de conmutación interna:** ~150 kHz
* **Filtrado pasivo:** Bobina de potencia blindada de 470 $\mu\text{H}$, capacitor de entrada de 100 $\mu\text{F}$ 50V y capacitor de salida de 220 $\mu\text{F}$ 35V

---

## 3. Procesamiento, Conectividad y Cronometría

### Microcontroladores de Desarrollo (2 Unidades)
* **Modelo de placa:** ESP32 DevKit v1 / NodeMCU-32S (versión estrecha de 30 pines)
* **Módulo SoC central:** ESP-WROOM-32 (Espressif Systems)
* **Arquitectura:** CPU Xtensa Dual-Core 32-bit LX6
* **Frecuencia de reloj máxima:** Hasta 240 MHz
* **Memoria interna:** 4 MB (32 Mb) SPI Flash externa, 520 KB SRAM, 448 KB ROM
* **Conectividad inalámbrica:**
  * Wi-Fi 802.11 b/g/n (2.4 GHz) con antena integrada en PCB
  * Bluetooth v4.2 BR/EDR y Bluetooth Low Energy (BLE)
* **Interfaz USB-UART:** Puente conversor CH340C con conector Micro-USB hembra
* **Regulación a bordo:** Regulador lineal LDO AMS1117-3.3 (convierte 5V de entrada a nivel lógico 3.3V)
* **Controles e indicadores:** Botones físicos EN (Reset) y BOOT; LEDs indicadores de alimentación (PWR) y estado (D2 / GPIO2)

### Módulo de Reloj en Tiempo Real (RTC)
* **Referencia del módulo:** Módulo HW-084
* **Circuito integrado RTC:** Maxim Integrated DS3231SN
* **Tipo de oscilador:** TCXO (Oscilador de cristal compensado por temperatura) de ultra alta precisión con sensor de temperatura interno
* **Memoria auxiliar integrada:** EEPROM AT24C32 (32 Kbits de almacenamiento I2C direccionable)
* **Bus de comunicación:** Interfaz I2C estándar (pines SDA y SCL)
* **Líneas de salida complementarias:** SQW (onda cuadrada programable) y salida de referencia directa de 32 kHz (32K)
* **Voltaje de operación:** 3.3V a 5.5V DC
* **Respaldo de batería:** Portapilas metálico para pila de botón de litio (CR2032 / LIR2032) en cara posterior

---

## 4. Conmutación y Control de Cargas

### Módulo de Relé de 1 Canal (Azul)
* **Tipo:** Módulo de conmutación para microcontrolador con aislamiento óptico
* **Componentes de disparo:** Optoacoplador, transistor NPN de conmutación y diodo flyback de protección
* **Tensión de bobina:** 5 VDC
* **Entradas de control:** VCC, GND e IN (compatible con señales lógicas del ESP32)
* **Indicadores lumínicos:** LED rojo de alimentación activa y LED verde de activación de bobina
* **Bornera de conmutación:** Bloque de 3 tornillos con contactos Común (COM), Normalmente Abierto (NO) y Normalmente Cerrado (NC)
* **Capacidad máxima nominal:** 10 A a 250 VAC / 10 A a 30 VDC

### Relé Electromecánico Individual (Negro)
* **Fabricante / Referencia:** Songle SRA-05VDC-CL
* **Montaje:** Montado sobre placa de baquela de pruebas con bornera de conexión roja
* **Tensión de bobina:** 5 VDC
* **Forma de contacto:** 1 Form C / SPDT (1 polo, 2 tiros)
* **Capacidad nominal de contactos:**
  * 20 A a 14 VDC
  * 10 A a 125 VAC

---

## 5. Cableado, Conexiones y Accesorios

### Cableado Eléctrico
* **Cables de acometida fotovoltaica:** Par paralelo de cobre multifilar estañado con aislamiento PVC blanco (marcado para exterior/instalación general)
* **Cables de señal (Jumpers Dupont):** Cinta plana de conductores flexibles con conectores macho-macho (M-M) de 2.54 mm en variados colores

### Interruptores de Potencia
* **Tipo:** Interruptores basculantes tipo balancín (*Rocker Switches*) color rojo con marcación serigrafiada I / O:
  * 1 interruptor de tamaño estándar (corte principal)
  * 3 interruptores basculantes miniatura rectangulares de 2 terminales

### Diodos Emisores de Luz (LEDs)
* **Formato:** Encapsulado difuso cilíndrico estándar de 5 mm de orificio pasante (Through-Hole):
  * 2 LEDs rojos
  * 2 LEDs verdes
  * 2 LEDs azules
