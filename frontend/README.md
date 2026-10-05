# SolarBell — frontend

App web mobile-first. React 19, Vite 8, Bun, Tailwind v4.

## Setup

Primero levanta la API desde la raíz del monorepo (`podman-compose -f compose.dev.yaml up -d`).

```bash
bun install
bun dev
```

El dev server escucha en la red local y manda `/api` y `/ws` a `http://localhost:8000`
(se cambia con `SOLARBELL_API`). En el teléfono, abre `http://<LAN-IP>:5173`.

Usuario local por defecto: `admin@solarbell.local` / `solarbell`.

## Scripts

| Command | What |
| --- | --- |
| `bun dev` | Desarrollo |
| `bun run build` | Typecheck + build |
| `bun run preview` | Preview de producción |
| `bun run lint` | Oxlint |

## Agentes

Skills del proyecto en `../.agents/skills/`. Convenciones en `../AGENTS.md`, `PRODUCT.md` y `DESIGN.md`.
