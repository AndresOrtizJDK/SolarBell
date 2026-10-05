// Copia este archivo como `configuracion.h` (está en .gitignore) y completa tus datos.
#pragma once

// Wi-Fi 2.4 GHz (el ESP32 no ve redes de 5 GHz).
#define WIFI_RED "mi-red-2g"
#define WIFI_CLAVE "mi-clave-wifi"

// Backend. En local: IP LAN del PC con `podman-compose -f compose.dev.yaml up` (puerto 8000)
// o con `bun dev` (puerto 5173, pasa por el proxy de Vite).
// En producción: dominio o IP del servidor con nginx (puerto 80, o 443 con SERVIDOR_USA_SSL 1).
#define SERVIDOR_DIRECCION "192.168.1.50"
#define SERVIDOR_PUERTO 8000
#define SERVIDOR_USA_SSL 0

// Igual a DEVICE_API_KEY del backend (.env o compose.dev.yaml).
#define CLAVE_DISPOSITIVO "dev-device-key"

// LED azul integrado. En la mayoría de DevKit es GPIO2.
#define PIN_LED 2

// Relé real (opcional): descomenta cuando esté conectado. Sin esto, todo se simula con el LED.
// #define PIN_RELE 26
// #define RELE_ACTIVO_EN_BAJO 1
