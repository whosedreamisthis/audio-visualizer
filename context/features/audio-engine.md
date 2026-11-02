# Audio Engine

## Overview

A framework-agnostic `AudioEngine` singleton that owns the `<audio>` element and the Web Audio graph. React never touches audio nodes; the engine exposes a small API and sampling methods for the render loop.

## Goals

- [ ] `src/audio/AudioEngine.ts` with the graph: `<audio>` → `MediaElementSource` → low shelf → mid peaking → high shelf → `GainNode` → `AnalyserNode` → destination
- [ ] Lazy, idempotent `init()` (safe under StrictMode); `AudioContext` created on first user gesture and `resume()`d
- [ ] `loadFile(file)` and `loadUrl(url)`: set `src`, resolve with `TrackMeta` after `loadedmetadata`, reject on error
- [ ] `play()`, `pause()`, `seek()`, `setPlaybackRate()` (with `preservesPitch`), `setGain()`, `setEqBand()`
- [ ] `setFftSize()` and `setSmoothing()`; reallocate buffers only when FFT size changes
- [ ] `getFrequencyData(out)` / `getTimeDomainData(out)` fill reused `Uint8Array`s
- [ ] `src/audio/bands.ts`: `getBandEnergy(freqData, sampleRate, fftSize)` → `{ bass, mid, treble, level }` (0..1)
- [ ] `dispose()`: stop playback, disconnect nodes, revoke object URLs, close context
- [ ] Call `engine.dispose()` via `import.meta.hot?.dispose` for HMR
- [ ] Emit events (`ended`, `timeupdate`, `error`, `loadedmetadata`) through a small typed subscribe API

## Requirements

- No React or Zustand imports in `src/audio/AudioEngine.ts` (store binding lives in `bindEngineToStore.ts`)
- `createMediaElementSource` called exactly once per element
- Param changes use `setTargetAtTime(value, ctx.currentTime, 0.015)` to avoid zipper noise
- Previous object URL revoked on every track change
- `audio.play()` rejection (autoplay blocked) surfaces as a typed error, not an unhandled promise

## Tests (Vitest)

- `bands.ts`: bin → frequency mapping, energy averaging on synthetic data (silence → 0, full-scale bass bins → bass ≈ 1, others ≈ 0)
- Engine logic with a mocked `AudioContext`: `init()` is idempotent, `dispose()` revokes URLs

## Acceptance Criteria

- Loading a file and calling `play()` produces sound and fills the analyser buffers
- Calling `init()` twice does not create a second graph
- No console errors on unmount/HMR

## Notes

- Real audio output can only be verified by ear in the browser.
