# Graph Report - frontend  (2026-10-09)

## Corpus Check
- 143 files · ~139,454 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1198 nodes · 1473 edges · 129 communities (97 shown, 32 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ced0c878`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- settings.ts
- icon.tsx
- dependencies
- devDependencies
- react
- flow.ts
- compilerOptions
- schedule/store.ts
- createLivingShader
- components.json
- chart-geometry.ts
- compilerOptions
- use-morph.ts
- ring/store.ts
- format.ts
- bento-layout.ts
- @/components/ui/toast.tsx
- src/components/ui/toast.tsx
- device/store.ts
- bell.ts
- sculpture-raster.ts
- Bill of materials
- BloomSimulation
- spinner.tsx
- ignorePatterns
- theme/store.ts
- glyph-mesh.ts
- clock.ts
- Product
- cojeev-materialize-fonts.mjs
- upcoming.ts
- appearance-tokens.ts
- category.ts
- scroll-thumb.ts
- toast.ts
- assembly-geometry.ts
- device.ts
- theme-transition.ts
- reference-effect-geometry.ts
- reference-gallery-geometry.ts
- ExampleInstrumentedTest.java
- MainActivity
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
- device/index.tsx
- SolarBell — app
- page.tsx
- field.tsx
- ring-fields.tsx
- flow-motion.ts
- signature-shapes.ts
- text-lines.ts
- @/components/ui/button.tsx
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
- gradlew
- HoldButton.jsx
- segmented.tsx
- stepper.tsx
- bell-list.tsx
- next-bell-hero.tsx
- ring-pattern.tsx
- lucide-icon-data.ts
- flow-press.ts
- use-motion-visibility.ts
- use-organic-value.ts
- pointer-geometry.ts
- vite.config.ts
- bottom-nav.tsx
- src/components/ui/button.tsx
- form-actions.tsx
- switch.tsx
- ring-sheet.tsx
- bell-form.tsx
- mode-picker.tsx
- special-date-row.tsx
- weekday-display.tsx
- icon-data.ts
- subtle-backgrounds.ts
- schedule/index.tsx
- tsconfig.json
- capacitor.config.ts
- router.tsx
- lucide-icon-names.ts
- shape-data.ts

## God Nodes (most connected - your core abstractions)
1. `react` - 53 edges
2. `compilerOptions` - 22 edges
3. `loadMotionSettings()` - 21 edges
4. `createLivingShader()` - 17 edges
5. `compilerOptions` - 16 edges
6. `Product` - 12 edges
7. `mutate()` - 10 edges
8. `attach()` - 10 edges
9. `BloomSimulation` - 10 edges
10. `Bill of materials` - 10 edges

## Surprising Connections (you probably didn't know these)
- `publish()` --indirect_call--> `snapshot()`  [INFERRED]
  src/lib/cojeev-motion/settings.ts → src/lib/cojeev-motion/use-reduced-motion.ts
- `cancel()` --indirect_call--> `frame()`  [INFERRED]
  src/lib/cojeev/living-shader.ts → src/lib/cojeev-motion/use-morph.ts

## Import Cycles
- None detected.

## Communities (129 total, 32 thin omitted)

### Community 0 - "settings.ts"
Cohesion: 0.06
Nodes (60): acquireEvents(), applyFlowSettings(), Category, defaultSettings, DOMAIN, event(), exportMorphJSON(), factoryCfg (+52 more)

### Community 1 - "icon.tsx"
Cohesion: 0.07
Nodes (43): additionalIcons, canonicalIcon(), createIconMotionPainter(), Disk(), DiskProps, DiskVariants, extraPaths, familyRecipe() (+35 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (39): @base-ui/react, @capacitor/android, @capacitor/core, class-variance-authority, clsx, cn, @fontsource/jetbrains-mono, @fontsource-variable/geist (+31 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (33): @capacitor/cli, oxlint, devDependencies, @capacitor/cli, oxlint, tailwindcss, @tailwindcss/vite, @types/node (+25 more)

### Community 4 - "react"
Cohesion: 0.06
Nodes (4): react, SheetProps, BellPushProps, root

### Community 5 - "flow.ts"
Cohesion: 0.11
Nodes (26): acquireFlowEnvironment(), appearFlow(), attachFlowGroup(), dispose(), Box, cancelFlowPulse(), createFlowPresence(), set() (+18 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (27): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+19 more)

### Community 7 - "schedule/store.ts"
Cohesion: 0.13
Nodes (23): commit(), copyWeeklyInto(), createSpecial(), deleteBell(), deleteSpecial(), emit(), EMPTY, enqueue() (+15 more)

### Community 8 - "createLivingShader"
Cohesion: 0.14
Nodes (26): createLivingShader(), appearance(), cancel(), canDraw(), color(), compile(), draw(), initialize() (+18 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 10 - "chart-geometry.ts"
Cohesion: 0.14
Nodes (20): arcPath(), areaPath(), ChartColor, chartColors, chartDomain(), ChartPoint, ChartSeries, ChartSlice (+12 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+12 more)

### Community 12 - "use-morph.ts"
Cohesion: 0.18
Nodes (19): acquireEnvironment(), bodySeed(), clear(), disposeEnvironment(), frame(), instances, morphClock, morphInputs() (+11 more)

### Community 13 - "ring/store.ts"
Cohesion: 0.17
Nodes (18): applyDeviceRun(), config, DEFAULT_CONFIG, emit(), getConfig(), getRun(), isSounding(), listeners (+10 more)

### Community 14 - "format.ts"
Cohesion: 0.14
Nodes (17): capitalize(), CountdownPart, countdownParts(), countdownText(), formatClock(), formatClockText(), formatDateKey(), formatLongDate() (+9 more)

### Community 15 - "bento-layout.ts"
Cohesion: 0.15
Nodes (16): bentoEdge(), BentoEdit, BentoLayout, BentoSide, BentoTemplate, bentoTemplates, BentoTile, bentoTilePath() (+8 more)

### Community 16 - "@/components/ui/toast.tsx"
Cohesion: 0.12
Nodes (9): Toast(), ToastActionProps, ToastCloseProps, ToastDescriptionProps, ToastProps, ToastProviderProps, ToastTitleProps, toastVariants (+1 more)

### Community 17 - "src/components/ui/toast.tsx"
Cohesion: 0.12
Nodes (9): Toast(), ToastActionProps, ToastCloseProps, ToastDescriptionProps, ToastProps, ToastProviderProps, ToastTitleProps, toastVariants (+1 more)

### Community 18 - "device/store.ts"
Cohesion: 0.19
Nodes (15): commit(), DeviceLink, DeviceState, getSnapshot(), listeners, onVisibility(), poll(), pullScheduleIfChanged() (+7 more)

### Community 19 - "bell.ts"
Cohesion: 0.15
Nodes (12): bellSummary(), formatSeconds(), ringDurations(), ringPauses(), RINGS_MAX, RINGS_MIN, secondsFormat, TIME_DEFAULT_MS (+4 more)

### Community 20 - "sculpture-raster.ts"
Cohesion: 0.15
Nodes (13): bayer, DitherPattern, fract(), GlyphSet, InkTreatment, noise(), PrintOptions, rasterizeSculpture() (+5 more)

### Community 21 - "Bill of materials"
Cohesion: 0.12
Nodes (15): 1. Panel — Powest 30 W policristalino, 2. Controlador — PWM 12/24 V 10 A, 3. Batería — Fullbattery / Powest VRLA, 4. Inversor — LY-1500, caja de mano, 5. Buck — módulo LM2596, 6. Radio — Ai-Thinker Ra-02 (LoRa, no Wi-Fi), 7. Relé de módulo 5 V (1 canal), 8. Relé Songle SRA-05VDC-CL (+7 more)

### Community 22 - "BloomSimulation"
Cohesion: 0.20
Nodes (6): bloomNumber(), BloomOptions, BloomParticle, BloomPoint, BloomSimulation, normalizeBloomOptions()

### Community 23 - "spinner.tsx"
Cohesion: 0.16
Nodes (12): pebble, point, pointSoft, puff, Spinner(), SpinnerAppearance, SpinnerLabel(), SpinnerLabelProps (+4 more)

### Community 24 - "ignorePatterns"
Cohesion: 0.14
Nodes (13): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, .agents/**, .cursor/** (+5 more)

### Community 25 - "theme/store.ts"
Cohesion: 0.23
Nodes (12): apply(), bootTheme(), explicit, getTheme(), listeners, notify(), resolved(), setTheme() (+4 more)

### Community 26 - "glyph-mesh.ts"
Cohesion: 0.19
Nodes (11): bounded(), createGlyphMesh(), GLYPH_RAMP, GlyphForm, glyphGrid, GlyphMesh, GlyphTone, normalizeGlyphOptions() (+3 more)

### Community 27 - "clock.ts"
Cohesion: 0.21
Nodes (10): animationStarts, arm(), drivers, flowClock, getMotionTime(), motionClock(), MotionTimer, now() (+2 more)

### Community 28 - "Product"
Cohesion: 0.15
Nodes (12): Constraints, Decided (rama `offline-local`), Evidence, Módulos v1 (confirmados por el usuario), Open decisions, Platform, Positioning, Product (+4 more)

### Community 29 - "cojeev-materialize-fonts.mjs"
Cohesion: 0.19
Nodes (11): argumentsAfterNode, css, cssPath, embedded, existingTargets, faces, found, materialized (+3 more)

### Community 30 - "upcoming.ts"
Cohesion: 0.27
Nodes (9): addDays(), atTime(), dayPlan, Occurrence, pastSpecials(), previousBefore(), toDateKey(), upcomingFrom() (+1 more)

### Community 31 - "appearance-tokens.ts"
Cohesion: 0.29
Nodes (11): AppearanceSettings, appearanceTokens(), contrastRatio(), defaultAppearance, luminance(), mixColor(), normalizeAppearance(), PaletteName (+3 more)

### Community 32 - "category.ts"
Cohesion: 0.17
Nodes (6): CATS, FILL_SEL, hosts, MorphHost, NEVER_SEL, STROKE_SEL

### Community 33 - "scroll-thumb.ts"
Cohesion: 0.17
Nodes (6): elementScrollRoots, pageScrollbarBootstrap, pageScrollbarPendingAttribute, pageScrollbarPendingTimeout, pageScrollRoots, ScrollRoot

### Community 34 - "toast.ts"
Cohesion: 0.25
Nodes (10): emit(), FeedbackToast, getServerSnapshot(), getSnapshot(), listeners, subscribe(), toast(), TOAST_DURATION_MS (+2 more)

### Community 35 - "assembly-geometry.ts"
Cohesion: 0.18
Nodes (8): assemblyContour, AssemblyGeometry, AssemblyGeometryOptions, AssemblyPartId, AssemblyRect, organismChoices, OrganismKind, shapes

### Community 36 - "device.ts"
Cohesion: 0.22
Nodes (8): device(), DEVICE_NETWORK, DeviceError, DeviceRun, DeviceStatus, errorMessage(), RequestOptions, withTimeout()

### Community 37 - "theme-transition.ts"
Cohesion: 0.27
Nodes (9): applyTheme(), rememberThemeOrigin(), Reveal, ThemeChangeDetails, ThemeMode, ThemeRevealOptions, ThemeRevealOrigin, themeRevealPath() (+1 more)

### Community 38 - "reference-effect-geometry.ts"
Cohesion: 0.24
Nodes (7): boundedCount(), boundedNumber(), makeSwarm(), Point, Ripple, stepSwarm(), SwarmPoint

### Community 39 - "reference-gallery-geometry.ts"
Cohesion: 0.36
Nodes (8): ditherCells(), galleryClamp(), galleryOffset(), ramp(), spiralPlacement(), stepGalleryTransition(), transitionLayers(), waveBoundary()

### Community 40 - "ExampleInstrumentedTest.java"
Cohesion: 0.33
Nodes (5): ExampleInstrumentedTest, ExampleUnitTest, androidx.test.ext.junit.runners.AndroidJUnit4, org.junit.runner.RunWith, org.junit.Test

### Community 41 - "MainActivity"
Cohesion: 0.33
Nodes (6): MainActivity, android.net.ConnectivityManager, android.os.Bundle, com.getcapacitor.BridgeActivity, NetworkCallback, Override

### Community 42 - "presence.tsx"
Cohesion: 0.22
Nodes (6): MotionPresenceProps, MotionSlot, MotionSurfaceProps, PresencePreset, presencePresets, shown

### Community 43 - "Design"
Cohesion: 0.22
Nodes (8): Anti-patterns, Color, Design, Layout, Mode, Motion, Type, World

### Community 44 - "hold-button.tsx"
Cohesion: 0.28
Nodes (7): EASE_OUT(), HoldButton(), HoldButtonProps, HoldButtonStyle, InputKind, LINEAR(), Phase

### Community 45 - "today-card.tsx"
Cohesion: 0.31
Nodes (5): axisLabel(), axisTicks(), DayTimeline(), minutesOf(), TodayCardProps

### Community 46 - "body.ts"
Cohesion: 0.25
Nodes (5): Body, BodyFrame, createBody(), drawnFrames, scalar()

### Community 47 - "progress-geometry.ts"
Cohesion: 0.50
Nodes (8): bounded(), f(), organicBandPath(), organicLinePath(), organicOrbitPath(), organicThumbPath(), progressRatio(), segmentCount()

### Community 48 - "types.ts"
Cohesion: 0.25
Nodes (7): Bell, BellScope, RingConfig, ScheduleState, SpecialDate, SpecialDateMode, WeeklySchedule

### Community 49 - "choreography.ts"
Cohesion: 0.36
Nodes (5): isQuiet(), motionTokens, resolveChoreography(), useChoreography(), useMotionQuiet()

### Community 50 - "slider-geometry.ts"
Cohesion: 0.57
Nodes (7): clamp(), f(), sliderRailPath(), sliderRubberPath(), sliderRubberProfile(), sliderScreenVelocity(), sliderThumbPath()

### Community 51 - "use-reduced-motion.ts"
Cohesion: 0.46
Nodes (7): changed(), listeners, media(), serverSnapshot(), snapshot(), subscribe(), useReducedMotion()

### Community 53 - "reference-additions-math.ts"
Cohesion: 0.43
Nodes (7): decodeHeading(), finite(), HeadingDecodeOptions, headingTiming(), normalizePortal(), portalContour(), segment()

### Community 54 - "reference-text-math.ts"
Cohesion: 0.43
Nodes (7): bounded(), caretFrame(), FallingBody, fallStep(), graphemes(), proximityWeight(), scrollWordProgress()

### Community 55 - "sculpture-particles.ts"
Cohesion: 0.29
Nodes (4): ParticlePointer, ParticleSpring, resetParticleSpring(), stepParticleSpring()

### Community 56 - "shapes.ts"
Cohesion: 0.33
Nodes (4): fromShape(), rawShape(), shapeNames, SHAPES

### Community 57 - "sculpture-flow.ts"
Cohesion: 0.43
Nodes (5): advanceVelocityField(), clearVelocityField(), createVelocityField(), sample(), VelocityField

### Community 58 - "text-ribbon-path.ts"
Cohesion: 0.33
Nodes (3): advanceRibbonPhase(), moveRibbonPhase(), TextRibbonShape

### Community 59 - "device/index.tsx"
Cohesion: 0.38
Nodes (5): appearance, DevicePage(), linkText(), relative, sinceText()

### Community 60 - "SolarBell — app"
Cohesion: 0.33
Nodes (5): Agentes, APK, Desarrollo en el navegador, Scripts, SolarBell — app

### Community 63 - "ring-fields.tsx"
Cohesion: 0.40
Nodes (4): resize(), RingFields(), RingFieldsProps, time

### Community 64 - "flow-motion.ts"
Cohesion: 0.40
Nodes (4): Box, createFlowPainter(), paint(), flowTravelTransition()

### Community 65 - "signature-shapes.ts"
Cohesion: 0.40
Nodes (5): Point, radial(), shapeContour(), SignatureShapeName, signatureShapePaths

### Community 66 - "text-lines.ts"
Cohesion: 0.40
Nodes (5): groupTextLines(), MeasuredGrapheme, measureTextLines(), TEXT_LINE_LIMIT, TextLine

### Community 67 - "@/components/ui/button.tsx"
Cohesion: 0.50
Nodes (3): Button(), ButtonProps, buttonVariants

### Community 68 - "control-appearance.ts"
Cohesion: 0.40
Nodes (3): ControlAppearanceProps, ControlRadius, FieldAppearance

### Community 70 - "geometry.ts"
Cohesion: 0.50
Nodes (4): f2(), path(), rim, Spring

### Community 71 - "morph-paint.ts"
Cohesion: 0.70
Nodes (3): acquireDefs(), createMorphOverlays(), node()

### Community 72 - "reference-additions-portal.ts"
Cohesion: 0.40
Nodes (3): createPortalField(), PortalOptions, PortalStatus

### Community 77 - "sculpture-geometry.ts"
Cohesion: 0.40
Nodes (3): SCULPTURE_LIMITS, sculptureGeometry, SculptureGeometryInput

### Community 79 - "motion.ts"
Cohesion: 0.40
Nodes (4): duration, easeInOut, easeOut, spring

### Community 80 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 81 - "HoldButton.jsx"
Cohesion: 0.83
Nodes (3): EASE_OUT(), HoldButton(), LINEAR()

### Community 84 - "bell-list.tsx"
Cohesion: 0.67
Nodes (3): BellList(), Editing, nextSuggestedTime()

### Community 89 - "use-motion-visibility.ts"
Cohesion: 0.83
Nodes (3): readPreferences(), subscribePreferences(), useMotionVisibility()

### Community 91 - "pointer-geometry.ts"
Cohesion: 0.67
Nodes (3): GuidedPointerPoint, normalizePointerPoints(), resolvePointerPoint()

### Community 92 - "vite.config.ts"
Cohesion: 0.67
Nodes (3): away(), deviceProxy(), TARGET

## Knowledge Gaps
- **451 isolated node(s):** `$schema`, `typescript`, `oxc`, `.agents/**`, `.cursor/**` (+446 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `icon.tsx`, `schedule/store.ts`, `createLivingShader`, `use-morph.ts`, `ring/store.ts`, `@/components/ui/toast.tsx`, `src/components/ui/toast.tsx`, `device/store.ts`, `spinner.tsx`, `ignorePatterns`, `theme/store.ts`, `toast.ts`, `presence.tsx`, `hold-button.tsx`, `choreography.ts`, `use-reduced-motion.ts`, `device/index.tsx`, `page.tsx`, `field.tsx`, `ring-fields.tsx`, `@/components/ui/button.tsx`, `control-appearance.ts`, `reference-gallery-motion.ts`, `reference-text-motion.ts`, `HoldButton.jsx`, `segmented.tsx`, `stepper.tsx`, `bell-list.tsx`, `ring-pattern.tsx`, `flow-press.ts`, `use-motion-visibility.ts`, `use-organic-value.ts`, `src/components/ui/button.tsx`, `ring-sheet.tsx`, `bell-form.tsx`, `use-flow.ts`, `ring/index.tsx`, `use-depth.ts`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `snapshot()` connect `use-reduced-motion.ts` to `settings.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `publish()` connect `settings.ts` to `use-reduced-motion.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `createLivingShader()` (e.g. with `appearance()` and `onLost()`) actually correct?**
  _`createLivingShader()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _451 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Should `icon.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07149758454106281 - nodes in this community are weakly interconnected._