# Current Feature

Waveform Visualizer (see `context/features/waveform-visualizer.md`): an oscilloscope-style line with a fading trail, glow and beat pulse.

## Status

In Progress

## Goals

- [ ] `src/visualizers/waveformMath.ts`: point count, sample-to-position helper (with tests)
- [ ] `src/visualizers/waveform.ts` implementing `Visualizer`, registered as `waveform`
- [ ] Smooth path from the time-domain data, centered, amplitude scaled by sensitivity, at most about one point per 2 px
- [ ] Trail: low-alpha background fill each frame instead of a hard clear
- [ ] Theme gradient line (cached per theme and width), width from `settings.lineWidth`
- [ ] `mirror` option: reflected second line
- [ ] Glow via `shadowBlur`, only when `settings.glow` is on
- [ ] Beat pulse: line width and glow swell on beat
- [ ] Idle: flat line with a slow breathing motion, eased in and out with play state
- [ ] Wire the Visual tab's visualizer mode toggle to the store so modes can be switched
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- No allocation in `draw`: the points array and gradient are reused.
- Wiring the mode toggle is a small first piece of `visualizer-picker-and-themes`, needed to see this visualizer; the theme picker and shortcuts come with that feature.
- Verify by eye: switch to Waveform in Controls → Visual, play a song, try Mirror and Glow (not wired yet; defaults are mirror on, glow off).

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
