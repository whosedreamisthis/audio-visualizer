# Current Feature

Canvas Render Loop (see `context/features/canvas-render-loop.md`): the real `<canvas>`, a single `requestAnimationFrame` loop outside React state, the visualizer registry, themes data and beat detection.

## Status

In Progress

## Goals

- [ ] `AudioFrame`/`DrawArgs` buffer types and `time`/`playing` fields in `DrawArgs`
- [ ] `src/lib/canvas.ts`: DPR-aware sizing (`computeBackingSize`, `fitCanvasToDisplay`), DPR capped at 2
- [ ] `src/audio/beatDetector.ts`: rolling bass average, threshold, cooldown (with tests)
- [ ] `src/audio/frameSampler.ts`: reused buffers and frame object, band energy and beat per frame
- [ ] `src/visualizers/themes.ts` (theme data) and `src/visualizers/index.ts` registry with a basic fallback visualizer
- [ ] `useVisualizerLoop`: starts once, reads settings with `getState()`, clamps `dt`, pauses when the tab is hidden, restarts visualizers on mode change
- [ ] `VisualizerCanvas`: renders once, `role="img"` with a mode-aware `aria-label`; replaces the mock bars in `CanvasStage`
- [ ] Idle behavior: ease to rest and a subtle ambient animation when no track or paused
- [ ] Dev-only FPS meter (`?fps`)
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- No store writes or `setState` inside the frame callback; buffers and the draw args object are allocated once.
- Waveform, bars and particles each get a proper visualizer in the next features; until then every mode uses the basic fallback spectrum.
- Theme data lands here because `DrawArgs` needs it; the picker UI and `--accent` wiring come with the themes feature.
- Verify by eye: the canvas should react to a playing track and settle to a calm idle when paused.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
- **State Stores:** Zustand playback, audio, visualizer and UI stores with sanitized persistence, store-to-engine binding and throttled engine events; key files `src/store/`, `src/audio/bindEngineToStore.ts`.
- **File Drop Zone:** Drag and drop or pick an audio file to load and autoplay it, with validation, drag-over overlay and error toasts; key files `src/lib/validateAudioFile.ts`, `src/audio/loadAudioFile.ts`, `src/hooks/useFileDrop.ts`, `src/components/CanvasStage.tsx`.
- **Player Controls:** Working player bar with play/pause, seek, time, volume/mute, loop, restart and track info; key files `src/audio/transport.ts`, `src/components/PlayerBar.tsx`, `SeekBar.tsx`, `VolumeControl.tsx`.
