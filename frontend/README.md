# SolarBell — app

App mobile-first que se empaqueta como APK con Capacitor. React 19, Vite 8, Bun, Tailwind v4.

No hay servidor ni login: la app habla por HTTP con la campana (`ESP32/solarbell_local`) en la
red Wi-Fi que crea el ESP32 (`SolarBell`, IP `192.168.4.1`).

## Desarrollo en el navegador

Une el PC a la red `SolarBell` y:

```bash
bun install
bun dev
```

El dev server manda `/api` a `http://192.168.4.1` (se cambia con `SOLARBELL_DEVICE`).

## APK

Hace falta el Android SDK (`ANDROID_HOME`) y **JDK 21**: Gradle 8.14 no arranca con Java 27.

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=$HOME/.local/share/mise/installs/java/21.0.2
bun run apk
```

Sale en `android/app/build/outputs/apk/debug/app-debug.apk`. Para abrir el proyecto en Android
Studio: `bun run sync && bunx cap open android`.

En el APK, `fetch` va por el HTTP nativo de Capacitor, y `MainActivity` liga la app al Wi-Fi:
Android, si la red no tiene internet, manda el tráfico por datos móviles y la campana no responde.

## Scripts

| Command | What |
| --- | --- |
| `bun dev` | Desarrollo en el navegador |
| `bun run build` | Typecheck + build |
| `bun run lint` | Oxlint |
| `bun run sync` | Build + copia a `android/` |
| `bun run apk` | Build + APK de depuración |

## Agentes

Skills del proyecto en `../.agents/skills/`. Convenciones en `../AGENTS.md`, `PRODUCT.md` y `DESIGN.md`.
