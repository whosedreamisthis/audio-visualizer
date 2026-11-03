# Current Feature: Microphone Input (Enhanced)

Visualize live sound from the user's microphone as an alternative to a file.

## Status

In Progress

## Goals

- "Use microphone" button in the empty state and the Presets tab
- `engine.useMicrophone()` using `getUserMedia({ audio })` and a `MediaStreamAudioSourceNode` into the same graph (EQ and analyser work; output to speakers is muted by default to avoid feedback)
- Switching back to a file/preset disconnects the mic source and stops all `MediaStream` tracks
- Permission handling: prompt, granted, denied (explains how to re-enable), no device available
- Playback controls adapt: seek/speed disabled for the live source; track badge shows "mic"
- "Monitor through speakers" switch with a feedback warning, off by default

## Notes

- Requires HTTPS or localhost (satisfied by GitHub Pages)
- Tracks stopped on unmount, on source switch and when the tab closes
- Echo cancellation / noise suppression constraints turned off for accurate visuals (configurable)
- Acceptance: speaking or clapping drives the visualizers in real time; denying permission shows a helpful message and the app remains usable; no lingering "recording" indicator in the browser after switching away

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
- **Preset Library:** Manifest-driven preset tracks loaded on demand via TanStack Query, with clickable cards, skeletons and Retry; key files `src/api/presets.ts`, `hooks.ts`, `src/components/PresetLibrary.tsx`.
