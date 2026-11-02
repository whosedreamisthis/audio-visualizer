# Current Feature

State Stores (see `context/features/state-stores.md`): Zustand stores for playback, audio, visualizer and UI state, the store → engine binding, and throttled engine → store events.

## Status

In Progress

## Goals

- [ ] `playbackStore`: status, track, currentTime, duration, loop, error + actions
- [ ] `audioStore` (persisted): volume, muted, gain, speed, preservePitch, eq, eqBypass + actions, EQ presets
- [ ] `visualizerStore` (persisted): mode, themeId, settings + actions
- [ ] `uiStore`: sidebar open, active tab, fullscreen, controls visible
- [ ] Persist with `partialize`, `version`, `migrate` and a `merge` that sanitizes corrupted data; safe storage fallback
- [ ] `src/audio/bindEngineToStore.ts`: selector subscriptions that apply store values to the engine once it is initialized
- [ ] Engine `initialized` event and `isInitialized` getter
- [ ] `src/hooks/useAudioEvents.ts`: engine events → throttled playback store updates (about 10 Hz)
- [ ] Mount the binding and events hook in `App`
- [ ] Vitest tests: clamping, presets, sanitize/migrate, binding with a mocked engine, throttle
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- Setters clamp using the shared constants and `clamp`.
- Persisted stores exclude transient fields; corrupted `localStorage` falls back to defaults.
- The UI controls are still static; wiring them to these stores happens in the feature specs that follow.
- `erasableSyntaxOnly` is on: no enums or constructor parameter properties.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
