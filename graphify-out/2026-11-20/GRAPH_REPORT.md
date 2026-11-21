# Graph Report - SolarBell  (2026-11-20)

## Corpus Check
- 178 files · ~599,665 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 81 file(s) not represented in the graph (top: .ttf 26, .css 15, .xml 10)

## Summary
- 1525 nodes · 2041 edges · 130 communities (97 shown, 33 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0adeb145`
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
- ESP32 — campana SolarBell (local, sin internet)
- capturas.mjs
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
- device/store.ts
- theme-transition.ts
- reference-effect-geometry.ts
- compilerOptions
- icon.tsx
- reference-gallery-geometry.ts
- presence.tsx
- Design
- history/format.ts
- today-card.tsx
- body.ts
- progress-geometry.ts
- types.ts
- choreography.ts
- slider-geometry.ts
- device.ts
- number-motion.ts
- reference-additions-math.ts
- reference-text-math.ts
- sculpture-particles.ts
- shapes.ts
- history/index.tsx
- text-ribbon-path.ts
- page.tsx
- field.tsx
- flow-motion.ts
- signature-shapes.ts
- text-lines.ts
- Find Skills
- .oxlintrc.json
- @/components/ui/button.tsx
- SolarBell: contexto completo del proyecto
- control-appearance.ts
- marquee-motion.ts
- geometry.ts
- history-detail-sheet.tsx
- reference-additions-portal.ts
- reference-field-paint.ts
- reference-gallery-motion.ts
- Inventario Técnico de Componentes - Proyecto SolarBell
- sculpture-geometry.ts
- text-relay.ts
- motion.ts
- HoldButton.jsx
- motion
- history/types.ts
- next-bell-hero.tsx
- ring-fields.tsx
- ref_lib
- frontend/package.json
- SolarBell Proyect
- use-motion-visibility.ts
- campana.mjs
- pointer-geometry.ts
- lucide-react
- MainActivity.java
- ref_components
- Informe final
- SolarBell: contexto histórico, decisiones y pendientes
- Trabajos académicos en LaTeX (Universidad de Córdoba)
- SolarBell: estado del software, firmware y prueba del relé
- use-reduced-motion.ts
- ref_features
- use-history.ts
- scripts
- icon-data.ts
- wifi-sheet.tsx
- password-modal.tsx
- subtle-backgrounds.ts
- device/index.tsx
- gradlew
- wifi-card.tsx
- SolarBell · Prueba rápida: batería → ESP32 → relé → LED
- tsconfig.json
- react-router
- main.tsx
- api.ts
- cn.ts
- lucide-icon-names.ts
- reference-text-motion.ts
- stepper.tsx
- range.ts
- schedule/index.tsx
- cn
- vite.config.ts
- capacitor.config.ts
- dependencies
- code-review-graph

## God Nodes (most connected - your core abstractions)
1. `react` - 63 edges
2. `compilerOptions` - 22 edges
3. `lucide-react` - 21 edges
4. `loadMotionSettings()` - 21 edges
5. `SolarBell: contexto completo del proyecto` - 18 edges
6. `createLivingShader()` - 17 edges
7. `compilerOptions` - 16 edges
8. `react-router` - 13 edges
9. `ESP32 — campana SolarBell (local, sin internet)` - 13 edges
10. `attach()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `6.2 API HTTP (`http://192.168.4.1` o la IP de casa)` --references--> `now()`  [INFERRED]
  docs/SolarBell_contexto_completo.md → frontend/src/lib/cojeev-motion/clock.ts
- `API (`http://192.168.4.1`)` --references--> `now()`  [INFERRED]
  ESP32/README.md → frontend/src/lib/cojeev-motion/clock.ts
- `APK` --references--> `MainActivity`  [INFERRED]
  frontend/README.md → frontend/android/app/src/main/java/co/solarbell/app/MainActivity.java
- `publish()` --indirect_call--> `snapshot()`  [INFERRED]
  frontend/src/lib/cojeev-motion/settings.ts → frontend/src/lib/cojeev-motion/use-reduced-motion.ts
- `cancel()` --indirect_call--> `frame()`  [INFERRED]
  frontend/src/lib/cojeev/living-shader.ts → frontend/src/lib/cojeev-motion/use-morph.ts

## Import Cycles
- None detected.

## Communities (130 total, 33 thin omitted)

### Community 0 - "settings.ts"
Cohesion: 0.06
Nodes (60): acquireEvents(), applyFlowSettings(), Category, defaultSettings, DOMAIN, event(), exportMorphJSON(), factoryCfg (+52 more)

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
Nodes (20): arcPath(), areaPath(), chartColor, chartColors, chartDomain(), ChartPoint, ChartSeries, ChartSlice (+12 more)

### Community 5 - "use-morph.ts"
Cohesion: 0.18
Nodes (19): acquireEnvironment(), bodySeed(), clear(), disposeEnvironment(), frame(), instances, morphClock, morphInputs() (+11 more)

### Community 6 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, @capacitor/cli, oxlint, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom (+3 more)

### Community 7 - "schedule/store.ts"
Cohesion: 0.13
Nodes (23): commit(), copyWeeklyInto(), createSpecial(), deleteBell(), deleteSpecial(), emit(), EMPTY, enqueue() (+15 more)

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
Nodes (10): Toast(), ToastActionProps, ToastCloseProps, ToastDescriptionProps, ToastProps, ToastProviderProps, ToastTitleProps, toastVariants (+2 more)

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
Cohesion: 0.14
Nodes (22): applyDeviceRun(), buildRun(), config, DEFAULT_CONFIG, emit(), getConfig(), getRun(), listeners (+14 more)

### Community 17 - "theme/store.ts"
Cohesion: 0.23
Nodes (12): apply(), bootTheme(), explicit, getTheme(), listeners, notify(), resolved(), setTheme() (+4 more)

### Community 18 - "glyph-mesh.ts"
Cohesion: 0.19
Nodes (11): bounded(), createGlyphMesh(), GLYPH_RAMP, GlyphForm, glyphGrid, GlyphMesh, GlyphTone, normalizeGlyphOptions() (+3 more)

### Community 19 - "ESP32 — campana SolarBell (local, sin internet)"
Cohesion: 0.06
Nodes (32): 6.1 Qué hace, 6.2 API HTTP (`http://192.168.4.1` o la IP de casa), 6.3 Opciones de `configuracion.h`, 6.4 Compilar y subir, 6.5 Historial de versiones, 6. Firmware `solarbell_local` (v0.4.1), API (`http://192.168.4.1`), arduino-cli (+24 more)

### Community 20 - "capturas.mjs"
Cohesion: 0.06
Nodes (33): argumentsAfterNode, css, cssPath, embedded, existingTargets, faces, found, materialized (+25 more)

### Community 21 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+15 more)

### Community 22 - "Product"
Cohesion: 0.15
Nodes (12): Constraints, Decided (rama `offline-local`), Evidence, Módulos v1 (confirmados por el usuario), Open decisions, Platform, Positioning, Product (+4 more)

### Community 23 - "bell.ts"
Cohesion: 0.15
Nodes (12): bellSummary(), formatSeconds(), ringDurations(), ringPauses(), RINGS_MAX, RINGS_MIN, secondsFormat, TIME_DEFAULT_MS (+4 more)

### Community 24 - "upcoming.ts"
Cohesion: 0.27
Nodes (9): addDays(), atTime(), dayPlan, Occurrence, pastSpecials(), previousBefore(), toDateKey(), upcomingFrom() (+1 more)

### Community 25 - "appearance-tokens.ts"
Cohesion: 0.29
Nodes (11): AppearanceSettings, appearanceTokens(), contrastRatio(), defaultAppearance, luminance(), mixColor(), normalizeAppearance(), PaletteName (+3 more)

### Community 26 - "category.ts"
Cohesion: 0.17
Nodes (6): CATS, FILL_SEL, hosts, MorphHost, NEVER_SEL, STROKE_SEL

### Community 27 - "react"
Cohesion: 0.08
Nodes (5): ButtonProps, BellPushProps, NO_PAUSES, RingPatternProps, react

### Community 28 - "scroll-thumb.ts"
Cohesion: 0.17
Nodes (6): elementScrollRoots, pageScrollbarBootstrap, pageScrollbarPendingAttribute, pageScrollbarPendingTimeout, pageScrollRoots, ScrollRoot

### Community 29 - "toast.ts"
Cohesion: 0.25
Nodes (10): emit(), FeedbackToast, getServerSnapshot(), getSnapshot(), listeners, subscribe(), toast(), TOAST_DURATION_MS (+2 more)

### Community 30 - "assembly-geometry.ts"
Cohesion: 0.07
Nodes (20): WifiNetwork, WifiScan, WifiState, WifiStatus, assemblyContour, AssemblyGeometry, AssemblyGeometryOptions, AssemblyPartId (+12 more)

### Community 31 - "device/store.ts"
Cohesion: 0.17
Nodes (19): commit(), DeviceLink, DeviceState, findDevice(), getSnapshot(), listeners, onVisibility(), poll() (+11 more)

### Community 32 - "theme-transition.ts"
Cohesion: 0.27
Nodes (9): applyTheme(), rememberThemeOrigin(), Reveal, ThemeChangeDetails, ThemeMode, ThemeRevealOptions, ThemeRevealOrigin, themeRevealPath() (+1 more)

### Community 33 - "reference-effect-geometry.ts"
Cohesion: 0.24
Nodes (7): boundedCount(), boundedNumber(), makeSwarm(), Point, Ripple, stepSwarm(), SwarmPoint

### Community 34 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+9 more)

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

### Community 46 - "device.ts"
Cohesion: 0.11
Nodes (19): AP_ADDRESS, device(), DEVICE_NETWORK, deviceAddress(), DeviceError, DeviceRun, DeviceStatus, errorMessage() (+11 more)

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

### Community 52 - "history/index.tsx"
Cohesion: 0.32
Nodes (3): endOfDay(), HistoryPage(), rangeText()

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

### Community 60 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 61 - "@/components/ui/button.tsx"
Cohesion: 0.33
Nodes (5): Button(), ButtonProps, buttonVariants, class-variance-authority, @radix-ui/react-slot

### Community 62 - "SolarBell: contexto completo del proyecto"
Cohesion: 0.05
Nodes (42): 0. Resumen en 10 líneas, 10. Cronología de lo hecho, 11.1 La app no conectaba desde el Wi-Fi de casa — RESUELTO, 11.2 Relé azul siempre activado en reposo — CAUSA IDENTIFICADA, SIN CERRAR, 11.3 ESP32 se cae del USB y se reinicia — ABIERTO, 11.4 USB y LM2596 a la vez — EVITAR, 11.5 Otros hallazgos, 11. Problemas encontrados (+34 more)

### Community 63 - "control-appearance.ts"
Cohesion: 0.40
Nodes (3): ControlAppearanceProps, ControlRadius, FieldAppearance

### Community 65 - "geometry.ts"
Cohesion: 0.50
Nodes (4): f2(), path(), rim, spring

### Community 67 - "reference-additions-portal.ts"
Cohesion: 0.40
Nodes (3): createPortalField(), PortalOptions, PortalStatus

### Community 71 - "Inventario Técnico de Componentes - Proyecto SolarBell"
Cohesion: 0.10
Nodes (19): 1. Sistema de Generación y Almacenamiento Solar, 2. Etapa de Potencia y Conversión AC, 3. Procesamiento, Conectividad y Cronometría, 4. Conmutación y Control de Cargas, 5. Cableado, Conexiones y Accesorios, Batería Auxiliar / Descartada, Batería Operativa Principal (En uso), Cableado Eléctrico (+11 more)

### Community 72 - "sculpture-geometry.ts"
Cohesion: 0.40
Nodes (3): SCULPTURE_LIMITS, sculptureGeometry, SculptureGeometryInput

### Community 74 - "motion.ts"
Cohesion: 0.40
Nodes (4): duration, easeInOut, easeOut, spring

### Community 75 - "HoldButton.jsx"
Cohesion: 0.83
Nodes (3): EASE_OUT(), HoldButton(), LINEAR()

### Community 76 - "motion"
Cohesion: 0.15
Nodes (4): Option, SegmentedProps, OrganicValue, motion

### Community 77 - "history/types.ts"
Cohesion: 0.33
Nodes (5): HistoryEntry, HistoryOutcome, HistoryPage, HistoryQuery, HistorySource

### Community 78 - "next-bell-hero.tsx"
Cohesion: 0.14
Nodes (4): NextBellHeroProps, ref_hooks, @lottiefiles/dotlottie-react, ref_lottiefiles_dotlottie_web

### Community 79 - "ring-fields.tsx"
Cohesion: 0.40
Nodes (4): resize(), RingFields(), RingFieldsProps, time

### Community 80 - "ref_lib"
Cohesion: 0.08
Nodes (8): SwitchProps, SignalIconProps, lucideIconNames, pack, pulseFlowPress, semanticStateTransitions, shapeData, ref_lib

### Community 81 - "frontend/package.json"
Cohesion: 0.11
Nodes (17): name, packageManager, private, type, version, @base-ui/react, @capacitor/android, @fontsource/jetbrains-mono (+9 more)

### Community 82 - "SolarBell Proyect"
Cohesion: 0.20
Nodes (9): Commands, Key Tools, MCP Tools: code-review-graph, Rules, Skills, SolarBell Proyect, Structure, When to use graph tools FIRST (+1 more)

### Community 83 - "use-motion-visibility.ts"
Cohesion: 0.83
Nodes (3): readPreferences(), subscribePreferences(), useMotionVisibility()

### Community 84 - "campana.mjs"
Cohesion: 0.13
Nodes (19): admin, bogota(), deviceNow(), finishRun(), fold(), HORARIO_COLEGIO, pattern(), PORT (+11 more)

### Community 85 - "pointer-geometry.ts"
Cohesion: 0.67
Nodes (3): GuidedPointerPoint, normalizePointerPoints(), resolvePointerPoint()

### Community 86 - "lucide-react"
Cohesion: 0.12
Nodes (8): DeleteButton(), DeleteButtonProps, SheetProps, HistoryTableProps, RingSheetProps, describe(), SpecialDateRow(), lucide-react

### Community 87 - "MainActivity.java"
Cohesion: 0.09
Nodes (22): android.net.ConnectivityManager, android.os.Bundle, androidx.test.ext.junit.runners.AndroidJUnit4, assert, com.getcapacitor.BridgeActivity, context, ExampleInstrumentedTest, MainActivity (+14 more)

### Community 88 - "ref_components"
Cohesion: 0.13
Nodes (5): ConfirmDialogProps, FormActionsProps, HistoryFilterSheetProps, options, ref_components

### Community 89 - "Informe final"
Cohesion: 0.13
Nodes (14): 1. Anexos, 2. Resumen ejecutivo, 3. Antecedentes, 4. Desarrollo de software (5.2), 5. Base de datos (5.1.7), 6. Diagramas, 7. Pruebas (5.3), 8. Fase I y Fase III (+6 more)

### Community 90 - "SolarBell: contexto histórico, decisiones y pendientes"
Cohesion: 0.18
Nodes (10): 1.1 Evidencia fotográfica (2026-10-12), 1. Origen del proyecto (herencia, no inicio desde cero), 2. Mejoras que el equipo actual ya añadió respecto al diseño anterior, 3. Hipótesis (NO confirmadas, verificar), 4. Datos clave de diseño (calculados del inventario), 5.1 Botón manual: decisión actual, 5. Arquitectura recomendada (propuesta, sujeta a H2 y H3), 6. Pendientes / información que falta (+2 more)

### Community 91 - "Trabajos académicos en LaTeX (Universidad de Córdoba)"
Cohesion: 0.18
Nodes (10): Antes de escribir: lo que hay que tener claro, Compilación y verificación (obligatorio), Entrega, Estilo de redacción, Estructura del documento, Referencias, Reglas de formato que no se negocian, Tablas y figuras (+2 more)

### Community 92 - "SolarBell: estado del software, firmware y prueba del relé"
Cohesion: 0.20
Nodes (9): 1. Qué hay en la carpeta del proyecto, 2. Firmware ESP32 `solarbell_local` (sin internet), 3. Prueba rápida: batería → ESP32 → relé → LED, 4. Circuito con relé azul y reloj DS3231 (v2, 2026-10-12), 5. Modo "Wi-Fi de casa" (opción 4 de alcance, v3, 2026-10-12), 6. Pendientes de software/prueba, Consumo (del propio README), Diferencia entre los dos documentos de la prueba (resuelta en la v2) (+1 more)

### Community 93 - "use-reduced-motion.ts"
Cohesion: 0.46
Nodes (7): changed(), listeners, media(), serverSnapshot(), snapshot(), subscribe(), useReducedMotion()

### Community 94 - "ref_features"
Cohesion: 0.17
Nodes (6): BellFormProps, BellList(), Editing, nextSuggestedTime(), WeekdayDisplayProps, ref_features

### Community 95 - "use-history.ts"
Cohesion: 0.40
Nodes (5): Data, failure(), INITIAL, Nav, useHistory()

### Community 96 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, apk, build, dev, lint, preview, sync

### Community 98 - "wifi-sheet.tsx"
Cohesion: 0.38
Nodes (4): wait(), WifiSheet(), join(), WifiSheetProps

### Community 99 - "password-modal.tsx"
Cohesion: 0.40
Nodes (3): PasswordModal(), PasswordModalProps, PasswordTarget

### Community 101 - "device/index.tsx"
Cohesion: 0.38
Nodes (5): appearance, DevicePage(), linkText(), relative, sinceText()

### Community 102 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 104 - "SolarBell · Prueba rápida: batería → ESP32 → relé → LED"
Cohesion: 0.22
Nodes (8): 1. Cambio hecho en el firmware, 2. Esquema, 3. Conexiones, 4. Procedimiento, 5. Precauciones, 6. Si algo falla, 7. Siguiente paso, SolarBell · Prueba rápida: batería → ESP32 → relé → LED

### Community 106 - "react-router"
Cohesion: 0.11
Nodes (5): router, items, ref_app, ref_pages, react-router

### Community 107 - "main.tsx"
Cohesion: 0.50
Nodes (3): root, react-dom, ref_styles

### Community 109 - "api.ts"
Cohesion: 0.50
Nodes (3): fetchHistory(), HISTORY_PAGE, path()

### Community 120 - "vite.config.ts"
Cohesion: 0.25
Nodes (8): away(), deviceProxy(), TARGET, ref_node_http, ref_node_url, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 136 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @base-ui/react, @capacitor/android, @capacitor/core, class-variance-authority, clsx, cn, @fontsource/jetbrains-mono (+12 more)

## Knowledge Gaps
- **621 isolated node(s):** `uvx`, `$schema`, `plugins`, `ignorePatterns`, `react/rules-of-hooks` (+616 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 867 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `createLivingShader`, `use-morph.ts`, `schedule/store.ts`, `@/components/ui/toast.tsx`, `src/components/ui/toast.tsx`, `spinner.tsx`, `ring/store.ts`, `theme/store.ts`, `toast.ts`, `device/store.ts`, `icon.tsx`, `presence.tsx`, `choreography.ts`, `history/index.tsx`, `page.tsx`, `field.tsx`, `@/components/ui/button.tsx`, `control-appearance.ts`, `history-detail-sheet.tsx`, `reference-gallery-motion.ts`, `HoldButton.jsx`, `motion`, `next-bell-hero.tsx`, `ring-fields.tsx`, `ref_lib`, `frontend/package.json`, `use-motion-visibility.ts`, `lucide-react`, `ref_components`, `use-reduced-motion.ts`, `ref_features`, `use-history.ts`, `wifi-sheet.tsx`, `password-modal.tsx`, `device/index.tsx`, `wifi-card.tsx`, `react-router`, `main.tsx`, `reference-text-motion.ts`, `stepper.tsx`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `snapshot()` connect `use-reduced-motion.ts` to `settings.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `publish()` connect `settings.ts` to `use-reduced-motion.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `uvx`, `$schema`, `plugins` to the rest of the system?**
  _621 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Should `flow.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._
- **Should `createLivingShader` be split into smaller, more focused modules?**
  _Cohesion score 0.1396011396011396 - nodes in this community are weakly interconnected._