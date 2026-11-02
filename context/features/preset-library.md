# Preset Library (TanStack Query)

## Overview

Bundled royalty-free preset tracks, listed from a manifest and loaded on demand through TanStack Query. This is the app's main use of server state.

## Goals

- [ ] Add 3-5 royalty-free tracks to `public/presets/` (about 128 kbps MP3, 30-90 s, under 2 MB each) and a `manifest.json` (`id`, `title`, `artist`, `url`, `license`, `sourceUrl`, `bpm`, `suggestedTheme`)
- [ ] `src/api/queryKeys.ts`: `presetKeys.all`, `presetKeys.audio(id)`
- [ ] `src/api/presets.ts`: `fetchManifest()` and `fetchPresetAudio(url)` using `import.meta.env.BASE_URL`, checking `response.ok`, validating the manifest shape (Zod or a type guard)
- [ ] `src/api/hooks.ts`: `usePresetTracks()` (`staleTime: Infinity`), `useLoadPreset()` mutation (fetch blob → object URL → `engine.loadUrl` → autoplay → apply `suggestedTheme`)
- [ ] `PresetLibrary` component: list of cards (title, artist, license badge), active preset highlighted
- [ ] Loading skeletons for the manifest; per-track loading state while audio downloads; error state with Retry
- [ ] Attribution text for each track visible in the UI
- [ ] Revoke the previous object URL when switching presets

## Requirements

- Preset audio is fetched only when selected, not at startup
- Query data is never copied into Zustand
- Same-origin files so `AnalyserNode` is not silenced by CORS
- Failures show a toast and set playback `error`; the app stays usable

## Tests (Vitest)

- Manifest validator accepts valid data and rejects missing/invalid fields
- URL builder respects `BASE_URL`

## Acceptance Criteria

- Clicking a preset loads and plays it, applying its suggested theme
- With the network blocked, the library shows an error with Retry
- Re-selecting a previously loaded preset is served from cache
