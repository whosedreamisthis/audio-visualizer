# Visualizer Settings

## Overview

A "Visual" tab with live controls for how the visualizers analyze and draw.

## Goals

- [ ] `SettingsPanel` using `ControlRow`
- [ ] FFT size select (512 / 1024 / 2048 / 4096) applied to the engine; reallocates buffers
- [ ] Smoothing slider 0-0.99
- [ ] Sensitivity slider 0.5-3x
- [ ] Bar count slider (bars), particle count slider (particles); controls shown only for the active mode
- [ ] Line width slider (waveform)
- [ ] Glow switch, Mirror switch
- [ ] "Reset visual settings" button
- [ ] Settings stored in `visualizerStore.settings` and persisted

## Requirements

- Expensive changes (FFT size) apply on commit; cheap ones apply while dragging
- Visualizers read settings via `getState()` each frame (no loop restart)
- Defaults tuned for 60 fps on mid-range hardware; glow off by default if `prefers-reduced-motion`

## Acceptance Criteria

- Each control visibly changes the active visualizer in real time
- Changing FFT size during playback causes no audio glitch or crash
- Reset restores defaults
