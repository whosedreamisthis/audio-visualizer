# Equalizer

## Overview

A 3-band EQ (low shelf, mid peaking, high shelf) with presets, in the "EQ" tab. Designed so it can later widen to 10 bands.

## Goals

- [ ] `EqPanel` with three vertical sliders (Low 200 Hz, Mid 1 kHz, High 4 kHz), range ±12 dB, step 0.5
- [ ] Live dB readouts with sign (`+4 dB`) and `aria-valuetext`
- [ ] Reset-to-flat button
- [ ] Presets (ToggleGroup or Select): Flat, Bass Boost, Vocal, Treble, Lo-Fi; selecting one sets all bands; moving a slider switches the preset label to "Custom"
- [ ] Optional mini frequency-response curve drawn on a small canvas (computed with `BiquadFilterNode.getFrequencyResponse` or math)
- [ ] Bands defined from `EQ_BANDS` constants so adding bands only needs new entries
- [ ] Bypass switch (flat sound without losing the settings)

## Requirements

- Changes ramp smoothly in the engine
- Presets are typed data in `src/lib/eqPresets.ts`
- Persisted in `audioStore`

## Tests (Vitest)

- Each preset's values are within ±12 dB and cover every band
- Matching a preset's values is detected; any other combination is "Custom"

## Acceptance Criteria

- Boosting Low audibly adds bass; cutting High dulls the sound
- Bypass toggles instantly with no click
- The visualizer reflects the EQ since the analyser sits after the filters
