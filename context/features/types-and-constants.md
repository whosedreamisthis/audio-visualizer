# Types and Constants

## Overview

Define the shared TypeScript types and constants that the audio engine, stores, visualizers and UI all depend on, in one place, so ranges and defaults can never drift between modules.

## Goals

- [ ] `src/types/index.ts`: `VisualizerMode`, `ThemeId`, `EqBandId`, `FftSize`, `TrackMeta`, `PresetTrack`, `BandEnergy`, `AudioFrame`, `Theme`, `DrawArgs`, `Visualizer`, `Size`
- [ ] `src/lib/constants.ts`: single source of truth for limits and defaults
  - Gain range 0-2 (default 1), speed 0.5-2 (default 1), EQ ±12 dB
  - EQ band definitions: low shelf 200 Hz, mid peaking 1 kHz (Q 1), high shelf 4 kHz
  - FFT sizes `[512, 1024, 2048, 4096]`, default 2048; smoothing default 0.8
  - Band ranges: bass 20-250 Hz, mid 250-4000 Hz, treble 4000-16000 Hz
  - Accepted audio types/extensions and max file size
- [ ] `src/lib/math.ts`: `clamp`, `lerp`, `mapRange`
- [ ] `src/lib/format.ts`: `formatTime(seconds)` (m:ss), `formatDb(db)` (`+4 dB`), `formatPercent`, `formatSpeed` (`1.25x`)

## Requirements

- No React imports in `src/types`, `src/lib/constants.ts`, `math.ts` or `format.ts`
- Constants are `as const` where it helps inference
- Formatters handle `NaN`, `Infinity` and negative values safely (`formatTime(NaN)` → `0:00`)

## Tests (Vitest)

- `clamp`, `lerp`, `mapRange` edge cases
- `formatTime`: 0, 59.9, 60, 3599, `NaN`; `formatDb`: positive, negative, zero

## Acceptance Criteria

- Other features import constants instead of hardcoding numbers
- Tests pass; build has no type errors
