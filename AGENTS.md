# SolarBell Proyect

Monorepo de la campana solar SolarBell, en `main`: sin internet, sin servidor, sin login.

- `frontend/` — React 19 + Vite 8 + Bun, empaquetada como APK con Capacitor (`frontend/android/`).
- `ESP32/solarbell_local/` — sketch Arduino. Crea la red Wi-Fi `SolarBell`, guarda el horario en
  la flash y toca solo con su reloj. Sin relé: el LED azul simula cada toque.

La app habla por HTTP con la campana en `192.168.4.1` (`frontend/src/lib/device.ts`). El
contrato está en `ESP32/README.md`.

## Commands

Frontend (`cd frontend`):

- `bun dev` — servidor en `0.0.0.0:5173`; `/api` va por proxy a la campana (`SOLARBELL_DEVICE`)
- `bun run build`
- `bun run lint`
- `bun run apk` — APK de depuración (JDK 21 y `ANDROID_HOME`; ver `frontend/README.md`)

Firmware:

- `arduino-cli compile --fqbn esp32:esp32:esp32 ESP32/solarbell_local` (necesita `configuracion.h`)

## Skills

Project skills viven en `.agents/skills/` (Cursor las carga). `find-skills` está en `.cursor/skills/`.

| Cuándo | Skill |
| --- | --- |
| Viewport, touch, safe area, PWA feel | `mobile-native` |
| Motion, microinteracciones, detalles | `emil-design-eng`, `animate` |
| Revisar motion | `review-animations` |
| Gestos, springs, materiales | `apple-design` |
| Diseño / polish / critique | `impeccable` |
| UI distintiva, no slop | `frontend-design` |
| Audit a11y / UX web | `web-design-guidelines` |
| Performance React | `vercel-react-best-practices` |
| APIs de componentes | `vercel-composition-patterns` |
| Taxonomía UX / stacks | `ui-ux-pro-max` |

## Rules

Ver `.cursor/rules/`. No inventar producto: `frontend/PRODUCT.md` marca lo abierto.

## Structure

```
frontend/src/app          providers + router
frontend/src/pages        rutas
frontend/src/features     dominios (schedule, ring, device, theme, feedback)
frontend/src/components   ui + layout
frontend/src/hooks lib styles
frontend/android          proyecto Android de Capacitor
ESP32/solarbell_local     firmware de la campana
```

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
