// Copia este archivo como `configuracion.h` (está en .gitignore) y completa tus datos.
#pragma once

// Red Wi-Fi que crea la campana. El teléfono se une a ella; no hace falta router ni internet.
// La clave es la única protección: quien la tenga puede tocar la campana. Mínimo 8 caracteres.
#define RED_NOMBRE "SolarBell"
#define RED_CLAVE "6767" 

// Hora local en minutos respecto a UTC (Colombia: -300). La app la corrige al conectarse.
#define ZONA_MINUTOS -300

// LED azul integrado. En la mayoría de DevKit es GPIO2.
#define PIN_LED 2

// Reloj DS3231 por I2C (SDA GPIO21, SCL GPIO22). Sin él, un corte de luz borra la hora y la
// campana no toca el horario hasta que el teléfono se vuelva a conectar.
// #define USAR_DS3231 1

// Relé real (opcional): descomenta cuando esté conectado. Sin esto, todo se simula con el LED.
// #define PIN_RELE 27
// #define RELE_ACTIVO_EN_BAJO 1

// Relé R1 que enciende el inversor solo al timbrar (opcional). Primero lo enciende, espera
// ARRANQUE_INVERSOR_MS y luego toca la campana con PIN_RELE; al terminar lo apaga.
// #define PIN_INVERSOR 26
// #define INVERSOR_ACTIVO_EN_BAJO 1
// #define ARRANQUE_INVERSOR_MS 2000

// Red Wi-Fi de casa/colegio inicial (opcional, solo 2.4 GHz). Normalmente se elige desde la app
// (Campana → Wi-Fi de casa) y esto no hace falta: solo siembra la red la primera vez que cambia.
// La campana sigue creando RED_NOMBRE y se anuncia como http://solarbell.local.
// #define WIFI_CASA_NOMBRE "mi-red"
// #define WIFI_CASA_CLAVE "mi-clave"

// Interruptor del Wi-Fi (opcional): un interruptor entre este GPIO y GND.
// Por defecto contacto cerrado = Wi-Fi apagado; sin cable o abierto = encendido.
// Descomenta la segunda línea para invertirlo (cerrado = encendido).
// #define PIN_INTERRUPTOR_WIFI 33
// #define INTERRUPTOR_WIFI_CERRADO_ENCIENDE 1
