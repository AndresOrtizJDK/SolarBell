# Design

## Mode

Operate. El scaffold es una app shell, no una landing.

## World

Instrumento de campo: papel blanco, rojo de campana, cielo pastel. Sin verde de bosque, sin oro, sin cristal esmerilado como default, sin púrpura, sin gradientes de texto.

## Color

Estrategia: restrained. Blanco de base, rojo para la acción, azul pastel para el cielo y la selección.

| Token | Light | Dark | Uso |
| --- | --- | --- | --- |
| paper | `#ffffff` | `#10151c` | Fondo de app y chrome |
| surface / raised | `#e5f2fb` / `#fff` | `#182433` / `#1b2532` | Hueco pastel / cards |
| ink | `#1a2433` | `#e8eef5` | Texto |
| muted | `#5a6a7c` | `#96a6b8` | Meta |
| line | `#d5e1ec` | `#2e3d50` | Bordes |
| field | `#c4313a` | `#c4313a` | Acción, campana |
| blue / on-blue | `#1670c4` / `#fff` | igual | Acción del login (botón azul) |
| sky / solar | `#c5e4f8` / `#3e94cc` | `#1a4d73` / `#8ec8f2` | Superficie pastel / marcas |

`theme-color` del browser chrome iguala `paper`. En oscuro el texto sobre rojo usa `--field-ink` (`#ffb7bb`); el relleno del botón sigue en `--field` con `--on-field` blanco. La apariencia se elige en Perfil (`data-theme`); si no hay elección, sigue el sistema. Sin luces ni lavados de fondo.

## Type

- UI: Fredoka (variable, `src/assets/fonts/Fredoka`)
- Datos / labels: JetBrains Mono
- Cuerpo ≥ 15px. Inputs ≥ 16px en puntero grueso.

## Motion

Tokens en `src/lib/motion.ts`.

- UI < 300ms. Press 120ms. Ease-out custom, nunca `ease-in`.
- Feedback en `:active` / `pointerdown`, no solo en `click`.
- Respetar `prefers-reduced-motion`.

## Layout

- Mobile-first. Shell a `100dvh`.
- Contenido `max-w-lg`, centrado al crecer.
- Nav inferior flotante: burbuja redondeada con píldora activa que se desliza (spring). Respeta `env(safe-area-inset-bottom)`.
- Inicio: fondo plano de `--paper`, sin lavados de esquina. La tarjeta de resumen monta sobre el hero. La barra de estado toma `--hero`, igual que `paper`.
- Formularios de timbrado en bottom sheet (`<dialog>` nativo); en desktop pasa a modal centrado.
- Hover solo detrás de `@media (hover: hover)` — Tailwind v4 ya lo hace.

## Anti-patterns

- `100vh` para el shell
- `user-scalable=no`
- `user-select: none` en texto de contenido
- Inter / Space Grotesk / púrpura genérico
