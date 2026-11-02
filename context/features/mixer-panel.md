# Mixer Panel

## Overview

Live controls for master gain, playback speed and pitch behavior, in the "Mixer" tab of the sidebar.

## Goals

- [ ] `MixerPanel` inside shadcn Tabs/Card
- [ ] Master gain slider 0-200% (default 100%), with a numeric readout and double-click/reset button to return to default
- [ ] Playback speed slider 0.5x-2x (step 0.05) with preset chips (0.75x, 1x, 1.25x, 1.5x)
- [ ] "Preserve pitch" switch (on by default); off gives tape-style pitch shift
- [ ] Warn visually when gain is above 100% (possible clipping): readout turns to a warning style and shows an icon, not color alone
- [ ] All values stored in `audioStore` and applied through `bindEngineToStore`
- [ ] Reusable `ControlRow` component (label + value + control + reset) used by the mixer, EQ and settings panels

## Requirements

- Sliders have labels and `aria-valuetext` ("Gain 120%", "Speed 1.25x")
- Dragging is smooth: audio param ramps, no zipper noise
- Values clamp to the constants

## Acceptance Criteria

- Gain is audibly louder/quieter in real time
- Speed changes while playing without restarting the track; pitch behavior follows the switch
- Reload restores the settings
