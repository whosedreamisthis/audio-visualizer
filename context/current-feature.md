# Current Feature: Visualizer Picker and Themes

UI and data for switching visualizers live and choosing a color theme that styles both the canvas and the app chrome.

## Status

Not Started

## Goals

- `src/visualizers/themes.ts`: five themes (Neon, Sunset, Ocean, Mono, Aurora), each with `background`, gradient `colors`, and `accent`
- `VisualizerPicker` (shadcn ToggleGroup): Waveform / Bars / Particles with icons and tooltips
- `ThemePicker`: swatch buttons (or Select) showing each theme's gradient; active theme indicated by a ring, not color alone
- Applying a theme sets `--accent` (and a derived foreground) on `document.documentElement` so shadcn controls match
- Switching visualizer mid-playback calls the old visualizer's `dispose` and the new one's `init` with no audio glitch
- Keyboard shortcuts `1/2/3` switch modes (wired in the shortcuts feature)
- Persist `mode` and `themeId`

## Notes

- Theme contrast: text on `--accent` meets WCAG AA
- Themes defined as typed data; adding a theme requires only a new entry
- Respect `prefers-color-scheme`-independent dark UI (themes affect accents and canvas only)
- Acceptance: changing theme updates canvas colors and slider/button accents instantly; reload restores the last mode and theme
- Spec: `context/features/visualizer-picker-and-themes.md`

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
