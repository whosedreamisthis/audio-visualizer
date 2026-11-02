# Current Feature

File Drop Zone (see `context/features/file-drop-zone.md`): drag and drop (or pick) an audio file to load it into the engine and start playback.

## Status

In Progress

## Goals

- [ ] `src/lib/validateAudioFile.ts`: MIME/extension and size validation with a user-facing message
- [ ] `useFileDrop` hook: window-level drag and drop, drag-over state, no browser navigation to the file
- [ ] Drag-over overlay: "Release to play"
- [ ] File picker button (hidden input, keyboard accessible)
- [ ] `loadAudioFile`: validate → init engine on the gesture → load → set track → autoplay
- [ ] Error toasts for invalid files, decode failures and blocked autoplay; state returns to idle
- [ ] Loading state while metadata loads; stale loads ignored when a second file is dropped
- [ ] Multiple files: use the first valid one and say the rest were ignored
- [ ] Vitest tests for `validateAudioFile`
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- The drop or click is the user gesture that creates and resumes the `AudioContext`.
- Track name comes from the file name without its extension (done in the engine).
- Playback controls and the visualizer are not wired yet, so a dropped file plays but only the audio is observable; that comes with `player-controls` and `canvas-render-loop`.
- "Use a preset" stays inert until the preset library feature.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
- **State Stores:** Zustand playback, audio, visualizer and UI stores with sanitized persistence, store-to-engine binding and throttled engine events; key files `src/store/`, `src/audio/bindEngineToStore.ts`.
