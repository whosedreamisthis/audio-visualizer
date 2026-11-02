# Saved Presets and Persistence

## Overview

Let users save named combinations of EQ, theme, mode and visualizer settings, and make sure all preferences survive reloads.

## Goals

- [ ] `src/store/savedPresetsStore.ts` (persisted): `{ id, name, eq, gain, speed, themeId, mode, settings, createdAt }[]`
- [ ] Actions: `add`, `rename`, `remove`, `apply`
- [ ] `SavedPresets` component in the "Presets" tab: save dialog (shadcn Dialog/Sheet with name input), list with apply / rename / delete
- [ ] Duplicate/empty name handling; max 20 presets
- [ ] Confirm before deleting (undo toast as an alternative)
- [ ] Export/import presets as JSON (stretch)
- [ ] Verify persisted stores: versioned keys (`av-audio`, `av-visualizer`, `av-presets`), `migrate`, safe fallback on bad data
- [ ] "Reset all settings" action

## Requirements

- Applying a preset updates audio, visualizer and theme stores in one batch so the engine receives consistent values
- Imported JSON is validated before use

## Tests (Vitest)

- add/rename/remove/apply behavior, max limit, name validation
- Import validator rejects malformed data

## Acceptance Criteria

- Save a preset, change settings, apply the preset: everything returns
- Presets persist across reloads
