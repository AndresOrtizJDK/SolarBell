// Copia este archivo como `configuracion.h` (está en .gitignore) y completa tus datos.
#pragma once

// Red Wi-Fi que crea la campana. El teléfono se une a ella; no hace falta router ni internet.
// La clave es la única protección: quien la tenga puede tocar la campana. Mínimo 8 caracteres.
#define RED_NOMBRE "SolarBell"
#define RED_CLAVE "cambia-esta-clave"

// Hora local en minutos respecto a UTC (Colombia: -300). La app la corrige al conectarse.
#define ZONA_MINUTOS -300

// Silencio entre toques consecutivos de un mismo timbrado.
#define PAUSA_TOQUE_MS 1000

// LED azul integrado. En la mayoría de DevKit es GPIO2.
#define PIN_LED 2

// Reloj DS3231 por I2C (SDA GPIO21, SCL GPIO22). Sin él, un corte de luz borra la hora y la
// campana no toca el horario hasta que el teléfono se vuelva a conectar.
// #define USAR_DS3231 1

// Relé real (opcional): descomenta cuando esté conectado. Sin esto, todo se simula con el LED.
// #define PIN_RELE 26
// #define RELE_ACTIVO_EN_BAJO 1
