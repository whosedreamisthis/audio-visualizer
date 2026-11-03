# Current Feature: Preset Library (TanStack Query)

Bundled royalty-free preset tracks, listed from a manifest and loaded on demand through TanStack Query. This is the app's main use of server state.

## Status

In Progress

## Goals

- Add 3-5 royalty-free tracks to `public/presets/` (about 128 kbps MP3, 30-90 s, under 2 MB each) and a `manifest.json` (`id`, `title`, `artist`, `url`, `license`, `sourceUrl`, `bpm`, `suggestedTheme`)
- `src/api/queryKeys.ts`: `presetKeys.all`, `presetKeys.audio(id)`
- `src/api/presets.ts`: `fetchManifest()` and `fetchPresetAudio(url)` using `import.meta.env.BASE_URL`, checking `response.ok`, validating the manifest shape (Zod or a type guard)
- `src/api/hooks.ts`: `usePresetTracks()` (`staleTime: Infinity`), `useLoadPreset()` mutation (fetch blob → object URL → `engine.loadUrl` → autoplay → apply `suggestedTheme`)
- `PresetLibrary` component: list of cards (title, artist, license badge), active preset highlighted
- Loading skeletons for the manifest; per-track loading state while audio downloads; error state with Retry
- Attribution text for each track visible in the UI
- Revoke the previous object URL when switching presets

## Notes

- Preset audio is fetched only when selected, not at startup
- Query data is never copied into Zustand
- Same-origin files so `AnalyserNode` is not silenced by CORS
- Failures show a toast and set playback `error`; the app stays usable

Tests (Vitest):

- Manifest validator accepts valid data and rejects missing/invalid fields
- URL builder respects `BASE_URL`

Acceptance criteria:

- Clicking a preset loads and plays it, applying its suggested theme
- With the network blocked, the library shows an error with Retry
- Re-selecting a previously loaded preset is served from cache

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
- **State Stores:** Zustand playback, audio, visualizer and UI stores with sanitized persistence, store-to-engine binding and throttled engine events; key files `src/store/`, `src/audio/bindEngineToStore.ts`.
- **File Drop Zone:** Drag and drop or pick an audio file to load and autoplay it, with validation, drag-over overlay and error toasts; key files `src/lib/validateAudioFile.ts`, `src/audio/loadAudioFile.ts`, `src/hooks/useFileDrop.ts`, `src/components/CanvasStage.tsx`.
- **Player Controls:** Working player bar with play/pause, seek, time, volume/mute, loop, restart and track info; key files `src/audio/transport.ts`, `src/components/PlayerBar.tsx`, `SeekBar.tsx`, `VolumeControl.tsx`.
- **Canvas Render Loop:** Single rAF loop drawing a live spectrum on a DPR-aware canvas, with beat detection, visualizer registry, themes data and FPS meter; key files `src/hooks/useVisualizerLoop.ts`, `src/audio/frameSampler.ts`, `src/visualizers/`.
- **Waveform Visualizer:** Oscilloscope line with fading trail, gradient, mirror, glow, beat pulse and idle breathing, plus a working mode toggle; key files `src/visualizers/waveform.ts`, `waveformMath.ts`, `src/components/panels/VisualPanel.tsx`.
- **Frequency Bars Visualizer:** Centered log-spaced spectrum bars (bass in the middle) with eased heights, vertical mirror, beat pulse and small-canvas reduction; key files `src/visualizers/bars.ts`, `barsMath.ts`.
- **Visualizer Settings:** Visual tab with live FFT size, smoothing, sensitivity, count, line width, glow and mirror controls plus reset; bars gain glow and idle ripple; key files `src/components/panels/SettingsPanel.tsx`, `VisualPanel.tsx`.
- **Particle Visualizer:** Particle spectrum mode with a fixed pool, beat bursts, level-driven stream, mid color shift, treble sparkles and soft glowing orbs; key files `src/visualizers/particles.ts`, `particlesMath.ts`.
- **Visualizer Picker and Themes:** Extracted mode and theme pickers with tooltips, swatches from typed theme data, and theme accent applied to shadcn tokens with AA contrast; key files `src/components/VisualizerPicker.tsx`, `ThemePicker.tsx`, `src/hooks/useApplyTheme.ts`.
- **Mixer Panel:** Mixer tab with working gain (0-200%, clipping warning), speed slider and chips, and preserve-pitch switch bound to the audio store; key files `src/components/panels/MixerPanel.tsx`, `ControlRow.tsx`.
- **Equalizer:** EQ tab with three live band sliders, signed dB readouts, presets with Custom detection, reset, bypass and a response curve; key files `src/components/panels/EqPanel.tsx`, `src/lib/eqCurve.ts`.
- **Keyboard Shortcuts and Fullscreen:** Global key shortcuts, page fullscreen with auto-hiding controls and cursor, `?` help dialog and HUD toasts; key files `src/lib/shortcuts.ts`, `src/hooks/useKeyboardShortcuts.ts`, `useFullscreen.ts`.
