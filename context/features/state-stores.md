# State Stores

## Overview

Create the Zustand stores and the binding that connects them to the audio engine. Stores are the source of truth for UI-visible state; the engine is a subscriber.

## Goals

- [ ] `src/store/playbackStore.ts`: `status`, `track`, `currentTime`, `duration`, `loop`, `error` + actions (`setTrack`, `setStatus`, `setTime`, `setDuration`, `toggleLoop`, `setError`)
- [ ] `src/store/audioStore.ts` (persisted): `volume`, `muted`, `gain`, `speed`, `preservePitch`, `eq` + actions (`setGain`, `setSpeed`, `setEqBand`, `resetEq`, `applyEqPreset`, `toggleMute`)
- [ ] `src/store/visualizerStore.ts` (persisted): `mode`, `themeId`, `settings` + `setMode`, `setTheme`, `updateSettings`, `resetSettings`
- [ ] `src/store/uiStore.ts`: sidebar open, active tab, fullscreen, controls visible
- [ ] `src/audio/bindEngineToStore.ts`: `subscribeWithSelector` subscriptions that apply gain, volume/mute, speed, pitch, EQ bands, FFT size, smoothing to the engine with `fireImmediately: true`
- [ ] `src/hooks/useAudioEvents.ts`: engine events → throttled playback store updates (4-10 Hz for time)
- [ ] Persist middleware with `partialize`, `version: 1` and `migrate`

## Requirements

- All setters clamp values using the shared constants and `clamp`
- Persisted stores exclude transient fields (`status`, `track`, `currentTime`, `error`)
- Corrupted or old `localStorage` data falls back to defaults without crashing
- Components use narrow selectors; no component subscribes to the whole store

## Tests (Vitest)

- Each setter clamps out-of-range values
- `applyEqPreset` / `resetEq` produce the expected bands
- `migrate` handles an older version and garbage input
- `partialize` output contains no transient fields

## Acceptance Criteria

- Changing a store value updates the engine (verified through a mocked engine in tests)
- Reloading the page restores gain, speed, EQ, mode and theme
