# Visualizer Picker and Themes

## Overview

UI and data for switching visualizers live and choosing a color theme that styles both the canvas and the app chrome.

## Goals

- [ ] `src/visualizers/themes.ts`: five themes (Neon, Sunset, Ocean, Mono, Aurora), each with `background`, gradient `colors`, and `accent`
- [ ] `VisualizerPicker` (shadcn ToggleGroup): Waveform / Bars / Particles with icons and tooltips
- [ ] `ThemePicker`: swatch buttons (or Select) showing each theme's gradient; active theme indicated by a ring, not color alone
- [ ] Applying a theme sets `--accent` (and a derived foreground) on `document.documentElement` so shadcn controls match
- [ ] Switching visualizer mid-playback calls the old visualizer's `dispose` and the new one's `init` with no audio glitch
- [ ] Keyboard shortcuts `1/2/3` switch modes (wired in the shortcuts feature)
- [ ] Persist `mode` and `themeId`

## Requirements

- Theme contrast: text on `--accent` meets WCAG AA
- Themes defined as typed data; adding a theme requires only a new entry
- Respect `prefers-color-scheme`-independent dark UI (themes affect accents and canvas only)

## Acceptance Criteria

- Changing theme updates canvas colors and slider/button accents instantly
- Reload restores the last mode and theme
