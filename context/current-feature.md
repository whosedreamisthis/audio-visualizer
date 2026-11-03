# Current Feature: Frequency Bars Visualizer

A classic spectrum analyzer: vertical bars whose heights follow the frequency data, with smooth easing and falling peak caps.

## Status

In Progress

## Goals

- `src/visualizers/bars.ts` implementing `Visualizer`
- Group FFT bins into `settings.barCount` bands using a logarithmic frequency scale (bass is not squashed into a few bars)
- Smooth bar heights with lerp (fast attack, slower release)
- Peak caps that hold briefly then fall with gravity
- Theme gradient fill built once per resize/theme change
- `mirror` option (bars grow from the center or mirrored left/right)
- Rounded bar tops, gap proportional to bar width
- Scale heights by `settings.sensitivity`
- Beat pulse: slight global scale/brightness boost
- Register as `"bars"`

## Notes

Spec: `context/features/frequency-bars-visualizer.md`

Requirements:

- State arrays (current heights, peaks, velocities) sized to `barCount` and reallocated only when `barCount` changes
- No per-frame allocation
- Handles very small canvases (mobile) by reducing bar count automatically

Tests (Vitest):

- Bin grouping helper: log-spaced edges are monotonic, cover the range, and each bar gets at least one bin

Acceptance criteria:

- Bass-heavy music visibly moves the left bars; hi-hats move the right bars
- Bars settle to zero when paused without snapping
- Changing bar count live does not crash or flicker

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
