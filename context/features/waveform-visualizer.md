# Waveform Visualizer

## Overview

An oscilloscope-style visualizer drawing the time-domain signal as a glowing line with a fading trail.

## Goals

- [ ] `src/visualizers/waveform.ts` implementing `Visualizer`
- [ ] Draw the time-domain samples as a smooth path across the canvas width, centered vertically, amplitude scaled by `settings.sensitivity`
- [ ] Trail effect: fill the canvas with the theme background at low alpha each frame instead of a hard clear
- [ ] Line gradient from the theme colors, line width from settings
- [ ] Optional `mirror` mode (reflected second line)
- [ ] Optional glow via `shadowBlur`, only when `settings.glow` is on
- [ ] Gentle pulse of line width/brightness on beat
- [ ] Idle: flat line with a slight breathing motion
- [ ] Register in the visualizer registry as `"waveform"`

## Requirements

- Downsample so the path has at most about one point per 2 px of width
- Gradient created once per resize/theme change, not per frame
- No allocation in `draw`

## Acceptance Criteria

- A sine-like or music signal renders as a continuous, smooth line
- Silence renders a stable centered line
- Glow off by default on low-power/reduced-motion settings
