# Current Feature

Player Controls (see `context/features/player-controls.md`): the bottom player bar wired to the playback and audio stores and the engine.

## Status

In Progress

## Goals

- [ ] `src/audio/transport.ts`: `togglePlayback` and `seekTo` using the engine and playback store
- [ ] Play/pause button reflecting `status`, disabled with no track or while loading
- [ ] `SeekBar` (Slider): progress from the store, seeks on commit, local value while dragging
- [ ] `TimeDisplay`: `formatTime` for current and duration; only it and the seek bar read `currentTime`
- [ ] Volume slider and mute button (mute keeps the previous volume)
- [ ] Loop toggle and restart button; speed readout from the audio store
- [ ] Track title, artist and source badge
- [ ] Icon-only buttons have `aria-label` and tooltips; sliders have `aria-valuetext` ("1:05 of 3:18", "Volume 70%")
- [ ] Controls disabled gracefully with no track; track end returns to 0:00 paused (loop keeps playing)
- [ ] Vitest tests for transport logic
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- Previous/next are removed: there is no playlist, so they would be dead buttons. Restart replaces them.
- The shadcn Slider wrapper now forwards `aria-label` and `getAriaValueText` to the thumbs.
- Time updates come from the throttled store writes (about 10 Hz); no per-frame work.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
- **State Stores:** Zustand playback, audio, visualizer and UI stores with sanitized persistence, store-to-engine binding and throttled engine events; key files `src/store/`, `src/audio/bindEngineToStore.ts`.
- **File Drop Zone:** Drag and drop or pick an audio file to load and autoplay it, with validation, drag-over overlay and error toasts; key files `src/lib/validateAudioFile.ts`, `src/audio/loadAudioFile.ts`, `src/hooks/useFileDrop.ts`, `src/components/CanvasStage.tsx`.
