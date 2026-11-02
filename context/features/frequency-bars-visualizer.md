# Frequency Bars Visualizer

## Overview

A classic spectrum analyzer: vertical bars whose heights follow the frequency data, with smooth easing and falling peak caps.

## Goals

- [ ] `src/visualizers/bars.ts` implementing `Visualizer`
- [ ] Group FFT bins into `settings.barCount` bands using a logarithmic frequency scale (bass is not squashed into a few bars)
- [ ] Smooth bar heights with lerp (fast attack, slower release)
- [ ] Peak caps that hold briefly then fall with gravity
- [ ] Theme gradient fill built once per resize/theme change
- [ ] `mirror` option (bars grow from the center or mirrored left/right)
- [ ] Rounded bar tops, gap proportional to bar width
- [ ] Scale heights by `settings.sensitivity`
- [ ] Beat pulse: slight global scale/brightness boost
- [ ] Register as `"bars"`

## Requirements

- State arrays (current heights, peaks, velocities) sized to `barCount` and reallocated only when `barCount` changes
- No per-frame allocation
- Handles very small canvases (mobile) by reducing bar count automatically

## Tests (Vitest)

- Bin grouping helper: log-spaced edges are monotonic, cover the range, and each bar gets at least one bin

## Acceptance Criteria

- Bass-heavy music visibly moves the left bars; hi-hats move the right bars
- Bars settle to zero when paused without snapping
- Changing bar count live does not crash or flicker
