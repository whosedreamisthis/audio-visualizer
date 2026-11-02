# Current Feature

Types and Constants (see `context/features/types-and-constants.md`): shared types, constants, math and format helpers used by the engine, stores, visualizers and UI.

## Status

In Progress

## Goals

- [ ] `src/types/index.ts`: `VisualizerMode`, `ThemeId`, `EqBandId`, `FftSize`, `TrackMeta`, `PresetTrack`, `BandEnergy`, `AudioFrame`, `Theme`, `DrawArgs`, `Visualizer`, `Size`, `VisualizerSettings`
- [ ] `src/lib/constants.ts`: gain, speed, EQ ranges and bands, FFT sizes and default, smoothing default, band frequency ranges, accepted audio types and max file size
- [ ] `src/lib/math.ts`: `clamp`, `lerp`, `mapRange`
- [ ] `src/lib/format.ts`: `formatTime`, `formatDb`, `formatPercent`, `formatSpeed`
- [ ] Vitest tests for math and format helpers
- [ ] `npm test`, `npm run lint` and `npm run build` pass

## Notes

- No React imports in types, constants, math or format.
- Formatters must handle `NaN`, `Infinity` and negative values safely.
- Other features import these constants instead of hardcoding numbers.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
