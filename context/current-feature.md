# Current Feature

<!-- Feature name and short description -->

## Status

Completed

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
- **State Stores:** Zustand playback, audio, visualizer and UI stores with sanitized persistence, store-to-engine binding and throttled engine events; key files `src/store/`, `src/audio/bindEngineToStore.ts`.
- **File Drop Zone:** Drag and drop or pick an audio file to load and autoplay it, with validation, drag-over overlay and error toasts; key files `src/lib/validateAudioFile.ts`, `src/audio/loadAudioFile.ts`, `src/hooks/useFileDrop.ts`, `src/components/CanvasStage.tsx`.
- **Player Controls:** Working player bar with play/pause, seek, time, volume/mute, loop, restart and track info; key files `src/audio/transport.ts`, `src/components/PlayerBar.tsx`, `SeekBar.tsx`, `VolumeControl.tsx`.
