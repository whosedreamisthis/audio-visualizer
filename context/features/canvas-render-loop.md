# Canvas Render Loop

## Overview

The `VisualizerCanvas` component and `useVisualizerLoop` hook: a single `requestAnimationFrame` loop that samples the analyser and calls the active visualizer, entirely outside React state.

## Goals

- [ ] `VisualizerCanvas.tsx`: renders once, `role="img"` with a descriptive `aria-label` (updates with the mode), fills its container
- [ ] `useCanvasSize` / `fitCanvasToDisplay`: `ResizeObserver`, DPR-aware (`min(devicePixelRatio, 2)`), re-scales the context
- [ ] `useVisualizerLoop(canvasRef)`: starts once; each frame reads `useVisualizerStore.getState()` and samples the engine into reused buffers
- [ ] Clamp `dt` (max 0.05 s) and pause the loop on `document.hidden`; resume on visible
- [ ] Visualizer registry `src/visualizers/index.ts` + `Visualizer` interface (`init`, `resize`, `draw`, `dispose`)
- [ ] Idle behavior: with no track or when paused, ease the visual to rest and show a subtle ambient animation
- [ ] Beat detector `src/audio/beatDetector.ts` (rolling bass average, threshold, cooldown) exposed as `frame.beat` / `frame.beatStrength`
- [ ] Dev-only FPS meter (toggle with a query param or key)

## Requirements

- Zero `setState`/store writes inside the frame callback
- Buffers (`Uint8Array`, `AudioFrame`) allocated once and reused; reallocated only on FFT change
- Loop cleanup cancels rAF and disconnects the observer; survives StrictMode double-mount
- Changing mode/theme/settings never restarts the loop

## Tests (Vitest)

- `beatDetector`: no beat on silence/steady tone, beat on a sudden bass spike, cooldown respected

## Acceptance Criteria

- React DevTools Profiler shows no re-renders of `VisualizerCanvas` while audio plays
- Canvas is crisp on high-DPI screens and resizes without flicker
- Switching browser tabs and back does not cause a visual jump
