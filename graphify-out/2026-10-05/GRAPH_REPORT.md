# Graph Report - SolarBell Proyect  (2026-10-05)

## Corpus Check
- 187 files · ~135,480 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1443 nodes · 2057 edges · 156 communities (111 shown, 45 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.87)
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
- use-reduced-motion.ts
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
- services/ring.py
- form-actions.tsx
- sheet.tsx
- stepper.tsx
- switch.tsx
- ring-sheet.tsx
- routes/schedule.py
- mode-picker.tsx
- special-date-row.tsx
- weekday-display.tsx
- icon-data.ts
- subtle-backgrounds.ts
- profile/index.tsx
- routes/ring.py
- schedule/index.tsx
- tsconfig.json
- router.tsx
- services/schedule.py
- lucide-icon-names.ts
- shape-data.ts
- routes/auth.py
- CamelModel
- security.py
- RingManager
- Hub
- Settings
- api.ts
- package.json
- live.ts
- test_schedule.py
- ESP32 — nodo SolarBell (simulado)
- test_auth.py
- test_ring.py
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
4. `CamelModel` - 19 edges
5. `Base` - 17 edges
6. `createLivingShader()` - 17 edges
7. `compilerOptions` - 16 edges
8. `seed()` - 14 edges
9. `load_state()` - 13 edges
10. `RingManager` - 12 edges

## Surprising Connections (you probably didn't know these)
- `sessionmaker()` --uses--> `Base`  [INFERRED]
  backend/tests/conftest.py → backend/app/db/base.py
- `RingManager` --uses--> `RingRunOut`  [INFERRED]
  backend/app/services/ring.py → backend/app/schemas/ring.py
- `RingManager` --uses--> `RingStateOut`  [INFERRED]
  backend/app/services/ring.py → backend/app/schemas/ring.py
- `_main()` --indirect_call--> `session()`  [INFERRED]
  backend/app/seed.py → backend/tests/conftest.py
- `tick()` --indirect_call--> `session()`  [INFERRED]
  backend/app/services/scheduler.py → backend/tests/conftest.py

## Import Cycles
- None detected.

## Communities (156 total, 45 thin omitted)

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

### Community 46 - "use-reduced-motion.ts"
Cohesion: 0.46
Nodes (7): changed(), listeners, media(), serverSnapshot(), snapshot(), subscribe(), useReducedMotion()

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

### Community 87 - "services/ring.py"
Cohesion: 0.18
Nodes (17): async_sessionmaker, app_socket(), device_socket(), websocket, _touch(), lifespan(), _ms(), datetime (+9 more)

### Community 93 - "routes/schedule.py"
Cohesion: 0.30
Nodes (4): health(), get, ScheduleState, FastAPI

### Community 102 - "routes/ring.py"
Cohesion: 0.27
Nodes (10): get_ring(), CurrentUser, get, post, RingConfig, start_ring(), stop_ring(), Toque en curso. Tiempos en ms epoch, como `Date.now()` en el frontend. (+2 more)

### Community 108 - "services/schedule.py"
Cohesion: 0.05
Nodes (84): do_run_migrations(), run_migrations_online(), delete_bell(), get_schedule(), put_bell(), put_weekdays(), CurrentUser, delete (+76 more)

### Community 121 - "routes/auth.py"
Cohesion: 0.19
Nodes (14): login(), me(), CurrentUser, get, patch, post, update_me(), create_access_token() (+6 more)

### Community 122 - "CamelModel"
Cohesion: 0.22
Nodes (10): CamelModel, JSON en camelCase, igual que los tipos del frontend., RingConfig, SpecialDateCreate, SpecialDateOut, SpecialDatePatch, WeekdaysIn, WeeklyOut (+2 more)

### Community 123 - "security.py"
Cohesion: 0.23
Nodes (11): decode_access_token(), get_current_user(), AsyncSession, HTTPException, _unauthorized(), get_session(), AsyncSession, User (+3 more)

### Community 124 - "RingManager"
Cohesion: 0.17
Nodes (9): Any, AsyncSession, date, RingConfig, Con `session`, el cambio de estado queda en esa transacción (la confirma quien…, Un solo toque a la vez. El servidor lleva el tiempo; el ESP32 solo ejecuta., Para un timbrado ya registrado ese día lanza `IntegrityError` antes de tocar…, RingManager (+1 more)

### Community 125 - "Hub"
Cohesion: 0.27
Nodes (4): Hub, Any, WebSocket, Conexiones WebSocket vivas: nodos ESP32 y apps abiertas. Vive en memoria (1…

### Community 126 - "Settings"
Cohesion: 0.50
Nodes (3): Settings, BaseSettings, ZoneInfo

### Community 127 - "api.ts"
Cohesion: 0.18
Nodes (6): api(), ApiError, errorMessage(), onUnauthorized(), RequestOptions, token

### Community 128 - "package.json"
Cohesion: 0.18
Nodes (10): name, packageManager, private, scripts, build, dev, lint, preview (+2 more)

### Community 129 - "live.ts"
Cohesion: 0.28
Nodes (5): dispatch(), listeners, LiveMessage, open(), scheduleRetry()

### Community 130 - "test_schedule.py"
Cohesion: 0.43
Nodes (7): AsyncClient, test_bell_cannot_jump_scope(), test_bell_validation(), test_seeded_schedule_matches_frontend_default(), test_special_dates_flow(), test_upsert_and_delete_weekly_bell(), test_weekdays()

### Community 131 - "ESP32 — nodo SolarBell (simulado)"
Cohesion: 0.25
Nodes (7): arduino-cli, Arduino IDE, Compilar y subir, Configurar, Cuando llegue el relé, ESP32 — nodo SolarBell (simulado), Protocolo (`/ws/device?key=...`)

### Community 132 - "test_auth.py"
Cohesion: 0.48
Nodes (6): AsyncClient, test_health(), test_login_is_case_insensitive_on_email(), test_login_rejects_bad_password(), test_protected_routes_need_token(), test_update_name()

### Community 133 - "test_ring.py"
Cohesion: 0.67
Nodes (3): AsyncClient, test_manual_ring_and_stop(), test_new_ring_replaces_current()

### Community 136 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, class-variance-authority, clsx, cn, dependencies, @base-ui/react, class-variance-authority, clsx (+11 more)

## Knowledge Gaps
- **461 isolated node(s):** `uvx`, `solarbell-backend`, `deploy.sh script`, `$schema`, `typescript` (+456 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `createLivingShader`, `use-morph.ts`, `bell-push.tsx`, `schedule/store.ts`, `src/components/ui/button.tsx`, `@/components/ui/toast.tsx`, `src/components/ui/toast.tsx`, `spinner.tsx`, `ring/store.ts`, `theme/store.ts`, `bell-form.tsx`, `toast.ts`, `session/store.ts`, `icon.tsx`, `presence.tsx`, `hold-button.tsx`, `choreography.ts`, `use-reduced-motion.ts`, `page.tsx`, `field.tsx`, `ignorePatterns`, `@/components/ui/button.tsx`, `control-appearance.ts`, `reference-gallery-motion.ts`, `reference-text-motion.ts`, `HoldButton.jsx`, `segmented.tsx`, `bell-list.tsx`, `flow-press.ts`, `use-motion-visibility.ts`, `use-organic-value.ts`, `sheet.tsx`, `ring-sheet.tsx`, `use-flow.ts`, `profile/index.tsx`, `detail.tsx`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `snapshot()` connect `use-reduced-motion.ts` to `settings.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `publish()` connect `settings.ts` to `use-reduced-motion.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `uvx`, `solarbell-backend`, `deploy.sh script` to the rest of the system?**
  _461 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Should `flow.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._
- **Should `createLivingShader` be split into smaller, more focused modules?**
  _Cohesion score 0.1396011396011396 - nodes in this community are weakly interconnected._