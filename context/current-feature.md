# Current Feature

Audio Engine (see `context/features/audio-engine.md`): a React-free `AudioEngine` that owns the `<audio>` element and the Web Audio graph, plus band-energy helpers.

## Status

In Progress

## Goals

- [ ] `src/audio/AudioEngine.ts`: graph `<audio>` → source → low shelf → mid peaking → high shelf → gain → analyser → destination
- [ ] Lazy, idempotent `init()`; `AudioContext` resumed on user gesture
- [ ] `loadFile`, `loadUrl` resolving with `TrackMeta`, rejecting with a typed error
- [ ] `play` (typed autoplay-blocked error), `pause`, `seek`, `setPlaybackRate`, `setPreservePitch`, `setGain`, `setVolume`, `setMuted`, `setEqBand`
- [ ] `setFftSize`, `setSmoothing`, `getFrequencyData`, `getTimeDomainData`, `getBands`
- [ ] `src/audio/bands.ts`: `getBandEnergy` and helpers
- [ ] Typed event subscription (`timeupdate`, `loadedmetadata`, `play`, `pause`, `ended`, `error`)
- [ ] `dispose()` and an HMR-safe singleton accessor in `src/audio/engine.ts`
- [ ] Vitest tests for `bands.ts` and engine logic with a mocked `AudioContext`
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- No React or Zustand imports in the engine; store binding comes in `state-stores`.
- `erasableSyntaxOnly` is on: no constructor parameter properties or enums.
- Real audio output can only be verified by ear in the browser; nothing in the UI calls the engine yet.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
