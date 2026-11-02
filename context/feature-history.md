
- **Project Setup:** Prepared the Vite + React + TypeScript SPA for all later features.
  - Added Tailwind v4 (`@tailwindcss/vite`, CSS-only config in `src/index.css`) and shadcn/ui (style `base-nova`, Base UI primitives) with button, slider, tabs, tooltip, toggle, toggle-group, select, switch, sheet, sonner, card and separator.
  - Installed Zustand and TanStack Query (devtools in dev only); `src/main.tsx` wraps the app in `QueryClientProvider`, `TooltipProvider` and the sonner `Toaster`.
  - Added the `@/*` alias (tsconfig + vite), Vitest (`vitest.config.ts`, node environment, pure-logic tests only, `npm test` / `npm run test:watch`), and `VITE_BASE` support for the GitHub Pages base path.
  - Built the dark layout shell in `src/App.tsx` (header, canvas area, sidebar, player bar placeholders); removed Vite template files; new title and black and white equalizer favicon.
  - Edited generated `sonner.tsx` to drop `next-themes`; ESLint turns off the fast-refresh rule for `src/components/ui/`.
  - Deferred: folder structure is created as each feature needs it.

- **Responsive Layout:** Built the static, non-functional studio UI that later features wire up.
  - `src/App.tsx`: `h-dvh` layout with header (title, Controls button below 1024 px, fullscreen button), canvas area, desktop sidebar and player bar. Below 1024 px the control panel opens in a shadcn Sheet: right side at 768 px and up, bottom sheet on mobile.
  - `src/components/CanvasStage.tsx`: decorative static spectrum behind the drop zone card (Choose file / Use a preset).
  - `src/components/ControlPanel.tsx` with Tabs and panels in `src/components/panels/`: Mixer (gain, speed, preserve pitch), EQ (3 vertical sliders, bypass, presets), Visual (mode, theme swatches, FFT, smoothing, sensitivity, bar count, glow, mirror), Presets (sample tracks, microphone, saved presets placeholder).
  - `src/components/PlayerBar.tsx`: transport, seek, time, volume and speed readout (hidden below 768 px); `src/components/ControlRow.tsx` shared label/value/reset row; `src/hooks/useMediaQuery.ts`.
  - Values are hardcoded and uncontrolled; touch targets are at least 44 px, with safe-area insets. No tests added: the feature is components only, and `useMediaQuery` only wraps a browser API.

- **Types and Constants:** Added the shared foundation that the engine, stores, visualizers and UI will import.
  - `src/types/index.ts`: `VisualizerMode`, `ThemeId`, `EqBandId`, `FftSize`, `TrackSource`, `Size`, `TrackMeta`, `PresetTrack`, `BandEnergy`, `AudioFrame`, `Theme`, `VisualizerSettings`, `DrawArgs`, `Visualizer`.
  - `src/lib/constants.ts`: gain, volume, speed, EQ range, EQ band definitions (200 Hz low shelf, 1 kHz peaking, 4 kHz high shelf), FFT sizes and default, smoothing, sensitivity, band frequency ranges, accepted extensions and the 100 MB file cap.
  - `src/lib/math.ts`: `clamp` (non-finite → min), `lerp`, `mapRange`; `src/lib/format.ts`: `formatTime`, `formatDb`, `formatPercent`, `formatSpeed` with safe fallbacks for `NaN`, `Infinity` and negatives.
  - Vitest: `math.test.ts` and `format.test.ts` (16 tests). Nothing imports the constants yet; the static UI still has hardcoded values.

- **Audio Engine:** Added the React-free Web Audio layer that later features (stores, drop zone, render loop) build on; not yet called from the UI.
  - `src/audio/AudioEngine.ts`: owns the `<audio>` element and graph source → low shelf (200 Hz) → mid peaking (1 kHz) → high shelf (4 kHz) → gain → analyser → destination. Lazy idempotent `init()`; `loadFile` / `loadUrl` resolve with `TrackMeta`; `play` (resumes context, maps `NotAllowedError` to `autoplay-blocked`), `pause`, `seek`, `setLoop`, `setPlaybackRate`, `setPreservePitch`, `setVolume`, `setMuted`, `setGain`, `setEqBand`, `setFftSize`, `setSmoothing`, `getFrequencyData`, `getTimeDomainData`, `getBands`, typed `on()` events, `dispose()`.
  - Typed `AudioEngineError` codes: `not-initialized`, `autoplay-blocked`, `unsupported-format`, `load-failed`. Parameters are clamped to shared constants and changed with `setTargetAtTime`; object URLs are revoked on track change and dispose.
  - Browser dependencies are injected through `EngineEnv`, so tests use fakes. `src/audio/engine.ts` provides the lazy singleton `getAudioEngine()` with HMR dispose.
  - `src/audio/bands.ts`: `binToFrequency`, `frequencyToBin`, `rangeEnergy`, `getBandEnergy`.
  - Tests: `bands.test.ts` and `AudioEngine.test.ts` (22 tests; 38 total). Real audio output still needs a check by ear once the UI is wired.

- **State Stores:** Added the Zustand state layer and wired it to the audio engine; the UI controls are still static and get connected by later features.
  - `src/store/playbackStore.ts` (status, track, time, duration, loop, error; `setError` moves to `error`, `reset` keeps `loop`), `audioStore.ts` (volume, muted, gain, speed, preservePitch, per-band EQ, eqBypass; persisted as `av-audio`), `visualizerStore.ts` (mode, theme, settings; persisted as `av-visualizer`), `uiStore.ts` (sidebar, controls sheet, tab, fullscreen; only `sidebarOpen` persisted as `av-ui`). All setters clamp to the shared constants.
  - Persistence uses `version: 1`, `partialize`, and `migrate`/`merge` that run `sanitize*` functions so corrupted or outdated data falls back to valid defaults; `src/lib/safeStorage.ts` falls back to in-memory storage when localStorage is unavailable. Helpers: `src/lib/sanitize.ts`, `throttle.ts`, `eqPresets.ts` (Flat, Bass Boost, Vocal, Treble, Lo-Fi), plus new visualizer constants.
  - `src/audio/bindEngineToStore.ts` applies store values to the engine through per-field selector subscriptions (EQ uses `shallow`, flat while bypassed) and re-applies everything on the new engine `initialized` event; the engine gained `isInitialized`.
  - `src/hooks/useAudioEvents.ts` mirrors engine events into the playback store (time throttled to about 10 Hz); `App.tsx` mounts it and the binding.
  - Tests: 36 new (74 total) covering store clamping, presets, sanitize/migrate/merge, binding with a mocked engine, throttle and EQ presets.
