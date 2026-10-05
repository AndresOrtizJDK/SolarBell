# Graph Report - SolarBell Proyect  (2026-10-05)

## Corpus Check
- 187 files · ~135,704 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1443 nodes · 2071 edges · 154 communities (109 shown, 45 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `57b03892`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- settings.ts
- flow.ts
- createLivingShader
- components.json
- chart-geometry.ts
- use-morph.ts
- devDependencies
- schedule/store.ts
- format.ts
- bento-layout.ts
- @/components/ui/toast.tsx
- src/components/ui/toast.tsx
- sculpture-raster.ts
- Bill of materials
- BloomSimulation
- spinner.tsx
- ring/store.ts
- theme/store.ts
- glyph-mesh.ts
- clock.ts
- cojeev-materialize-fonts.mjs
- compilerOptions
- Product
- bell.ts
- upcoming.ts
- appearance-tokens.ts
- category.ts
- react
- scroll-thumb.ts
- toast.ts
- assembly-geometry.ts
- session/store.ts
- theme-transition.ts
- reference-effect-geometry.ts
- compilerOptions
- icon.tsx
- reference-gallery-geometry.ts
- presence.tsx
- Design
- hold-button.tsx
- today-card.tsx
- body.ts
- progress-geometry.ts
- types.ts
- choreography.ts
- slider-geometry.ts
- services/horario.py
- number-motion.ts
- reference-additions-math.ts
- reference-text-math.ts
- sculpture-particles.ts
- shapes.ts
- sculpture-flow.ts
- text-ribbon-path.ts
- page.tsx
- field.tsx
- flow-motion.ts
- signature-shapes.ts
- text-lines.ts
- Find Skills
- ignorePatterns
- @/components/ui/button.tsx
- SolarBell — frontend
- control-appearance.ts
- marquee-motion.ts
- geometry.ts
- morph-paint.ts
- reference-additions-portal.ts
- reference-field-paint.ts
- reference-gallery-motion.ts
- reference-text-motion.ts
- sculpture-geometry.ts
- text-relay.ts
- motion.ts
- HoldButton.jsx
- segmented.tsx
- bell-list.tsx
- next-bell-hero.tsx
- ring-fields.tsx
- lucide-icon-data.ts
- flow-press.ts
- SolarBell Proyect
- use-motion-visibility.ts
- use-organic-value.ts
- pointer-geometry.ts
- bottom-nav.tsx
- semilla.py
- form-actions.tsx
- sheet.tsx
- stepper.tsx
- switch.tsx
- ring-sheet.tsx
- principal.py
- mode-picker.tsx
- special-date-row.tsx
- weekday-display.tsx
- icon-data.ts
- subtle-backgrounds.ts
- profile/index.tsx
- test_programador.py
- schedule/index.tsx
- tsconfig.json
- router.tsx
- models/__init__.py
- lucide-icon-names.ts
- shape-data.ts
- EsquemaBase
- services/toque.py
- seguridad.py
- Concentrador
- test_horario.py
- test_autenticacion.py
- api.ts
- package.json
- live.ts
- test_toque.py
- ESP32 — nodo SolarBell (simulado)
- bell-push.tsx
- dependencies
- src/components/ui/button.tsx
- @fontsource-variable/geist
- @lottiefiles/dotlottie-react
- lucide-react
- react-dom
- react-router
- shadcn
- tailwind-merge
- code-review-graph
- solarbell-backend
- bell-form.tsx
- deploy.sh
- @fontsource/jetbrains-mono

## God Nodes (most connected - your core abstractions)
1. `react` - 51 edges
2. `compilerOptions` - 22 edges
3. `loadMotionSettings()` - 21 edges
4. `EsquemaBase` - 19 edges
5. `Base` - 17 edges
6. `createLivingShader()` - 17 edges
7. `compilerOptions` - 16 edges
8. `Timbrado` - 15 edges
9. `EstadoHorario` - 14 edges
10. `sembrar()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `obtener_usuario_actual()` --uses--> `Usuario`  [INFERRED]
  backend/app/core/seguridad.py → backend/app/models/usuario.py
- `fabrica()` --uses--> `Base`  [INFERRED]
  backend/tests/conftest.py → backend/app/db/base.py
- `ciclo_de_vida()` --indirect_call--> `sesion()`  [INFERRED]
  backend/app/principal.py → backend/tests/conftest.py
- `revisar_minuto()` --uses--> `ConfigToque`  [INFERRED]
  backend/app/services/programador.py → backend/app/schemas/horario.py
- `revisar_minuto()` --indirect_call--> `sesion()`  [INFERRED]
  backend/app/services/programador.py → backend/tests/conftest.py

## Import Cycles
- None detected.

## Communities (154 total, 45 thin omitted)

### Community 0 - "settings.ts"
Cohesion: 0.05
Nodes (67): acquireEvents(), applyFlowSettings(), Category, defaultSettings, DOMAIN, event(), exportMorphJSON(), factoryCfg (+59 more)

### Community 1 - "flow.ts"
Cohesion: 0.11
Nodes (26): acquireFlowEnvironment(), appearFlow(), attachFlowGroup(), dispose(), Box, cancelFlowPulse(), createFlowPresence(), set() (+18 more)

### Community 2 - "createLivingShader"
Cohesion: 0.14
Nodes (26): createLivingShader(), appearance(), cancel(), canDraw(), color(), compile(), draw(), initialize() (+18 more)

### Community 3 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 4 - "chart-geometry.ts"
Cohesion: 0.14
Nodes (20): arcPath(), areaPath(), ChartColor, chartColors, chartDomain(), ChartPoint, ChartSeries, ChartSlice (+12 more)

### Community 5 - "use-morph.ts"
Cohesion: 0.18
Nodes (19): acquireEnvironment(), bodySeed(), clear(), disposeEnvironment(), frame(), instances, morphClock, morphInputs() (+11 more)

### Community 6 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+11 more)

### Community 7 - "schedule/store.ts"
Cohesion: 0.14
Nodes (24): commit(), copyWeeklyInto(), createSpecial(), deleteBell(), deleteSpecial(), emit(), EMPTY, enqueue() (+16 more)

### Community 8 - "format.ts"
Cohesion: 0.14
Nodes (17): capitalize(), CountdownPart, countdownParts(), countdownText(), formatClock(), formatClockText(), formatDateKey(), formatLongDate() (+9 more)

### Community 9 - "bento-layout.ts"
Cohesion: 0.15
Nodes (16): bentoEdge(), BentoEdit, BentoLayout, BentoSide, BentoTemplate, bentoTemplates, BentoTile, bentoTilePath() (+8 more)

### Community 10 - "@/components/ui/toast.tsx"
Cohesion: 0.12
Nodes (9): Toast(), ToastActionProps, ToastCloseProps, ToastDescriptionProps, ToastProps, ToastProviderProps, ToastTitleProps, toastVariants (+1 more)

### Community 11 - "src/components/ui/toast.tsx"
Cohesion: 0.12
Nodes (9): Toast(), ToastActionProps, ToastCloseProps, ToastDescriptionProps, ToastProps, ToastProviderProps, ToastTitleProps, toastVariants (+1 more)

### Community 12 - "sculpture-raster.ts"
Cohesion: 0.15
Nodes (13): bayer, DitherPattern, fract(), GlyphSet, InkTreatment, noise(), PrintOptions, rasterizeSculpture() (+5 more)

### Community 13 - "Bill of materials"
Cohesion: 0.12
Nodes (15): 1. Panel — Powest 30 W policristalino, 2. Controlador — PWM 12/24 V 10 A, 3. Batería — Fullbattery / Powest VRLA, 4. Inversor — LY-1500, caja de mano, 5. Buck — módulo LM2596, 6. Radio — Ai-Thinker Ra-02 (LoRa, no Wi-Fi), 7. Relé de módulo 5 V (1 canal), 8. Relé Songle SRA-05VDC-CL (+7 more)

### Community 14 - "BloomSimulation"
Cohesion: 0.20
Nodes (6): bloomNumber(), BloomOptions, BloomParticle, BloomPoint, BloomSimulation, normalizeBloomOptions()

### Community 15 - "spinner.tsx"
Cohesion: 0.16
Nodes (12): pebble, point, pointSoft, puff, Spinner(), SpinnerAppearance, SpinnerLabel(), SpinnerLabelProps (+4 more)

### Community 16 - "ring/store.ts"
Cohesion: 0.17
Nodes (18): apply(), config, DEFAULT_CONFIG, emit(), getConfig(), getDeviceOnline(), getRun(), listeners (+10 more)

### Community 17 - "theme/store.ts"
Cohesion: 0.23
Nodes (12): apply(), bootTheme(), explicit, getTheme(), listeners, notify(), resolved(), setTheme() (+4 more)

### Community 18 - "glyph-mesh.ts"
Cohesion: 0.19
Nodes (11): bounded(), createGlyphMesh(), GLYPH_RAMP, GlyphForm, glyphGrid, GlyphMesh, GlyphTone, normalizeGlyphOptions() (+3 more)

### Community 19 - "clock.ts"
Cohesion: 0.21
Nodes (10): animationStarts, arm(), drivers, flowClock, getMotionTime(), motionClock(), MotionTimer, now() (+2 more)

### Community 20 - "cojeev-materialize-fonts.mjs"
Cohesion: 0.19
Nodes (11): argumentsAfterNode, css, cssPath, embedded, existingTargets, faces, found, materialized (+3 more)

### Community 21 - "compilerOptions"
Cohesion: 0.07
Nodes (27): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+19 more)

### Community 22 - "Product"
Cohesion: 0.15
Nodes (12): Constraints, Decided, Evidence, Módulos v1 (confirmados por el usuario), Open decisions, Platform, Positioning, Product (+4 more)

### Community 23 - "bell.ts"
Cohesion: 0.20
Nodes (7): bellSummary(), ringDurations(), RINGS_MAX, RINGS_MIN, SECONDS_MAX, SECONDS_MIN, totalSeconds()

### Community 24 - "upcoming.ts"
Cohesion: 0.27
Nodes (9): addDays(), atTime(), dayPlan, Occurrence, pastSpecials(), previousBefore(), toDateKey(), upcomingFrom() (+1 more)

### Community 25 - "appearance-tokens.ts"
Cohesion: 0.29
Nodes (11): AppearanceSettings, appearanceTokens(), contrastRatio(), defaultAppearance, luminance(), mixColor(), normalizeAppearance(), PaletteName (+3 more)

### Community 26 - "category.ts"
Cohesion: 0.17
Nodes (6): CATS, FILL_SEL, hosts, MorphHost, NEVER_SEL, STROKE_SEL

### Community 28 - "scroll-thumb.ts"
Cohesion: 0.17
Nodes (6): elementScrollRoots, pageScrollbarBootstrap, pageScrollbarPendingAttribute, pageScrollbarPendingTimeout, pageScrollRoots, ScrollRoot

### Community 29 - "toast.ts"
Cohesion: 0.25
Nodes (10): emit(), FeedbackToast, getServerSnapshot(), getSnapshot(), listeners, subscribe(), toast(), TOAST_DURATION_MS (+2 more)

### Community 30 - "assembly-geometry.ts"
Cohesion: 0.18
Nodes (8): assemblyContour, AssemblyGeometry, AssemblyGeometryOptions, AssemblyPartId, AssemblyRect, organismChoices, OrganismKind, shapes

### Community 31 - "session/store.ts"
Cohesion: 0.22
Nodes (10): commit(), listeners, refreshSession(), rename(), Session, signIn(), signOut(), subscribe() (+2 more)

### Community 32 - "theme-transition.ts"
Cohesion: 0.27
Nodes (9): applyTheme(), rememberThemeOrigin(), Reveal, ThemeChangeDetails, ThemeMode, ThemeRevealOptions, ThemeRevealOrigin, themeRevealPath() (+1 more)

### Community 33 - "reference-effect-geometry.ts"
Cohesion: 0.24
Nodes (7): boundedCount(), boundedNumber(), makeSwarm(), Point, Ripple, stepSwarm(), SwarmPoint

### Community 34 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+12 more)

### Community 35 - "icon.tsx"
Cohesion: 0.07
Nodes (43): additionalIcons, canonicalIcon(), createIconMotionPainter(), Disk(), DiskProps, DiskVariants, extraPaths, familyRecipe() (+35 more)

### Community 36 - "reference-gallery-geometry.ts"
Cohesion: 0.36
Nodes (8): ditherCells(), galleryClamp(), galleryOffset(), ramp(), spiralPlacement(), stepGalleryTransition(), transitionLayers(), waveBoundary()

### Community 37 - "presence.tsx"
Cohesion: 0.22
Nodes (6): MotionPresenceProps, MotionSlot, MotionSurfaceProps, PresencePreset, presencePresets, shown

### Community 38 - "Design"
Cohesion: 0.22
Nodes (8): Anti-patterns, Color, Design, Layout, Mode, Motion, Type, World

### Community 39 - "hold-button.tsx"
Cohesion: 0.28
Nodes (7): EASE_OUT(), HoldButton(), HoldButtonProps, HoldButtonStyle, InputKind, LINEAR(), Phase

### Community 40 - "today-card.tsx"
Cohesion: 0.31
Nodes (5): axisLabel(), axisTicks(), DayTimeline(), minutesOf(), TodayCardProps

### Community 41 - "body.ts"
Cohesion: 0.25
Nodes (5): Body, BodyFrame, createBody(), drawnFrames, scalar()

### Community 42 - "progress-geometry.ts"
Cohesion: 0.50
Nodes (8): bounded(), f(), organicBandPath(), organicLinePath(), organicOrbitPath(), organicThumbPath(), progressRatio(), segmentCount()

### Community 43 - "types.ts"
Cohesion: 0.25
Nodes (7): Bell, BellScope, RingConfig, ScheduleState, SpecialDate, SpecialDateMode, WeeklySchedule

### Community 44 - "choreography.ts"
Cohesion: 0.36
Nodes (5): isQuiet(), motionTokens, resolveChoreography(), useChoreography(), useMotionQuiet()

### Community 45 - "slider-geometry.ts"
Cohesion: 0.57
Nodes (7): clamp(), f(), sliderRailPath(), sliderRubberPath(), sliderRubberProfile(), sliderScreenVelocity(), sliderThumbPath()

### Community 46 - "services/horario.py"
Cohesion: 0.09
Nodes (57): alias, borrar_especial(), copiar_semanal(), crear_especial(), modificar_especial(), delete, patch, post (+49 more)

### Community 48 - "reference-additions-math.ts"
Cohesion: 0.43
Nodes (7): decodeHeading(), finite(), HeadingDecodeOptions, headingTiming(), normalizePortal(), portalContour(), segment()

### Community 49 - "reference-text-math.ts"
Cohesion: 0.43
Nodes (7): bounded(), caretFrame(), FallingBody, fallStep(), graphemes(), proximityWeight(), scrollWordProgress()

### Community 50 - "sculpture-particles.ts"
Cohesion: 0.29
Nodes (4): ParticlePointer, ParticleSpring, resetParticleSpring(), stepParticleSpring()

### Community 51 - "shapes.ts"
Cohesion: 0.33
Nodes (4): fromShape(), rawShape(), shapeNames, SHAPES

### Community 52 - "sculpture-flow.ts"
Cohesion: 0.43
Nodes (5): advanceVelocityField(), clearVelocityField(), createVelocityField(), sample(), VelocityField

### Community 53 - "text-ribbon-path.ts"
Cohesion: 0.33
Nodes (3): advanceRibbonPhase(), moveRibbonPhase(), TextRibbonShape

### Community 56 - "flow-motion.ts"
Cohesion: 0.40
Nodes (4): Box, createFlowPainter(), paint(), flowTravelTransition()

### Community 57 - "signature-shapes.ts"
Cohesion: 0.40
Nodes (5): Point, radial(), shapeContour(), SignatureShapeName, signatureShapePaths

### Community 58 - "text-lines.ts"
Cohesion: 0.40
Nodes (5): groupTextLines(), MeasuredGrapheme, measureTextLines(), TEXT_LINE_LIMIT, TextLine

### Community 59 - "Find Skills"
Cohesion: 0.14
Nodes (13): Common Skill Categories, Find Skills, How to Help Users Find Skills, Step 1: Understand What They Need, Step 2: Check the Leaderboard First, Step 3: Search for Skills, Step 4: Verify Quality Before Recommending, Step 5: Present Options to the User (+5 more)

### Community 60 - "ignorePatterns"
Cohesion: 0.14
Nodes (13): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, .agents/**, .cursor/** (+5 more)

### Community 61 - "@/components/ui/button.tsx"
Cohesion: 0.50
Nodes (3): Button(), ButtonProps, buttonVariants

### Community 62 - "SolarBell — frontend"
Cohesion: 0.40
Nodes (4): Agentes, Scripts, Setup, SolarBell — frontend

### Community 63 - "control-appearance.ts"
Cohesion: 0.40
Nodes (3): ControlAppearanceProps, ControlRadius, FieldAppearance

### Community 65 - "geometry.ts"
Cohesion: 0.50
Nodes (4): f2(), path(), rim, Spring

### Community 66 - "morph-paint.ts"
Cohesion: 0.70
Nodes (3): acquireDefs(), createMorphOverlays(), node()

### Community 67 - "reference-additions-portal.ts"
Cohesion: 0.40
Nodes (3): createPortalField(), PortalOptions, PortalStatus

### Community 72 - "sculpture-geometry.ts"
Cohesion: 0.40
Nodes (3): SCULPTURE_LIMITS, sculptureGeometry, SculptureGeometryInput

### Community 74 - "motion.ts"
Cohesion: 0.40
Nodes (4): duration, easeInOut, easeOut, spring

### Community 75 - "HoldButton.jsx"
Cohesion: 0.83
Nodes (3): EASE_OUT(), HoldButton(), LINEAR()

### Community 77 - "bell-list.tsx"
Cohesion: 0.67
Nodes (3): BellList(), Editing, nextSuggestedTime()

### Community 79 - "ring-fields.tsx"
Cohesion: 0.67
Nodes (3): resize(), RingFields(), RingFieldsProps

### Community 82 - "SolarBell Proyect"
Cohesion: 0.20
Nodes (9): Commands, Key Tools, MCP Tools: code-review-graph, Rules, Skills, SolarBell Proyect, Structure, When to use graph tools FIRST (+1 more)

### Community 83 - "use-motion-visibility.ts"
Cohesion: 0.83
Nodes (3): readPreferences(), subscribePreferences(), useMotionVisibility()

### Community 85 - "pointer-geometry.ts"
Cohesion: 0.67
Nodes (3): GuidedPointerPoint, normalizePointerPoints(), resolvePointerPoint()

### Community 87 - "semilla.py"
Cohesion: 0.21
Nodes (14): async_sessionmaker, hashear_contrasena(), _principal(), AsyncSession, Datos base idempotentes: admin, horario semanal por defecto y el dispositivo…, sembrar(), auth(), cliente() (+6 more)

### Community 93 - "principal.py"
Cohesion: 0.31
Nodes (5): get, Sesion, salud(), ciclo_de_vida(), FastAPI

### Community 102 - "test_programador.py"
Cohesion: 0.27
Nodes (14): resolver_dia(), ejecutar_programador(), datetime, Dispara los timbrados de `ahora` (hora local del sitio). Devuelve los ids que…, revisar_minuto(), a_las(), AsyncSession, date (+6 more)

### Community 108 - "models/__init__.py"
Cohesion: 0.20
Nodes (13): _ejecutar_migraciones(), migrar_con_conexion(), Base, Dispositivo, EventoToque, Historial de toques. Un timbrado programado solo se registra una vez por día., FechaEspecial, HorarioSemanal (+5 more)

### Community 121 - "EsquemaBase"
Cohesion: 0.16
Nodes (18): actualizar_yo(), iniciar_sesion(), get, patch, post, Sesion, UsuarioActual, yo() (+10 more)

### Community 122 - "services/toque.py"
Cohesion: 0.10
Nodes (22): detener_toque(), iniciar_toque(), obtener_toque(), get, post, Sesion, UsuarioActual, ConfigToque (+14 more)

### Community 123 - "seguridad.py"
Cohesion: 0.13
Nodes (19): _marcar_visto(), websocket, socket_app(), socket_dispositivo(), Configuracion, Cada campo se lee de la variable de entorno de su `alias` (p. ej.…, decodificar_token_acceso(), hashear_clave_api() (+11 more)

### Community 124 - "Concentrador"
Cohesion: 0.27
Nodes (4): Concentrador, Any, WebSocket, Conexiones WebSocket vivas: nodos ESP32 y apps abiertas. Vive en memoria (1…

### Community 125 - "test_horario.py"
Cohesion: 0.43
Nodes (7): AsyncClient, test_dias_de_la_semana(), test_flujo_de_fechas_especiales(), test_guardar_y_borrar_timbrado_semanal(), test_semilla_coincide_con_el_horario_del_frontend(), test_timbrado_no_salta_de_horario(), test_validacion_del_timbrado()

### Community 126 - "test_autenticacion.py"
Cohesion: 0.48
Nodes (6): AsyncClient, test_actualizar_nombre(), test_login_ignora_mayusculas_del_correo(), test_login_rechaza_contrasena_incorrecta(), test_rutas_protegidas_piden_token(), test_salud()

### Community 127 - "api.ts"
Cohesion: 0.18
Nodes (6): api(), ApiError, errorMessage(), onUnauthorized(), RequestOptions, token

### Community 128 - "package.json"
Cohesion: 0.18
Nodes (10): name, packageManager, private, scripts, build, dev, lint, preview (+2 more)

### Community 129 - "live.ts"
Cohesion: 0.28
Nodes (5): dispatch(), listeners, LiveMessage, open(), scheduleRetry()

### Community 130 - "test_toque.py"
Cohesion: 0.67
Nodes (3): AsyncClient, test_toque_manual_y_detener(), test_toque_nuevo_reemplaza_al_actual()

### Community 131 - "ESP32 — nodo SolarBell (simulado)"
Cohesion: 0.25
Nodes (7): arduino-cli, Arduino IDE, Compilar y subir, Configurar, Cuando llegue el relé, ESP32 — nodo SolarBell (simulado), Protocolo (`/ws/device?key=...`)

### Community 136 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, class-variance-authority, clsx, cn, dependencies, @base-ui/react, class-variance-authority, clsx (+11 more)

## Knowledge Gaps
- **461 isolated node(s):** `uvx`, `solarbell-backend`, `deploy.sh script`, `$schema`, `typescript` (+456 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `settings.ts`, `createLivingShader`, `use-morph.ts`, `bell-push.tsx`, `schedule/store.ts`, `src/components/ui/button.tsx`, `@/components/ui/toast.tsx`, `src/components/ui/toast.tsx`, `spinner.tsx`, `ring/store.ts`, `theme/store.ts`, `bell-form.tsx`, `toast.ts`, `session/store.ts`, `icon.tsx`, `presence.tsx`, `hold-button.tsx`, `choreography.ts`, `page.tsx`, `field.tsx`, `ignorePatterns`, `@/components/ui/button.tsx`, `control-appearance.ts`, `reference-gallery-motion.ts`, `reference-text-motion.ts`, `HoldButton.jsx`, `segmented.tsx`, `bell-list.tsx`, `flow-press.ts`, `use-motion-visibility.ts`, `use-organic-value.ts`, `sheet.tsx`, `ring-sheet.tsx`, `use-flow.ts`, `profile/index.tsx`, `detail.tsx`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `uvx`, `solarbell-backend`, `deploy.sh script` to the rest of the system?**
  _461 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053830227743271224 - nodes in this community are weakly interconnected._
- **Should `flow.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._
- **Should `createLivingShader` be split into smaller, more focused modules?**
  _Cohesion score 0.1396011396011396 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `chart-geometry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._