# Particle Spectrum Visualizer

## Overview

A particle system driven by the audio: bass spawns radial bursts, mids shift color, treble adds sparkle.

## Goals

- [ ] `src/visualizers/particles.ts` implementing `Visualizer`
- [ ] Fixed-size particle pool (`settings.particleCount`) using struct-of-arrays (`Float32Array`s); no per-frame object creation
- [ ] Emit from the center (or ring) on beats, with count and speed scaled by bass energy
- [ ] Particle properties: position, velocity, life, size, hue offset; drag and slight swirl
- [ ] Mid energy modulates hue/color from the theme; treble adds small bright sparkles
- [ ] Additive blending (`globalCompositeOperation = "lighter"`) when glow is on
- [ ] Trail effect with low-alpha fade fill
- [ ] Recycle dead particles; wrap/respawn instead of growing
- [ ] Idle: a few slow drifting particles
- [ ] Register as `"particles"`; `resize`/`init` reallocate the pool when count changes
- [ ] Reduced-motion: cap the particle count and disable additive blending

## Requirements

- Simulation uses `dt` so speed is frame-rate independent
- Particle count slider range 100-3000 with sensible default (about 800)
- Keeps 60 fps at 1080p with the default count

## Tests (Vitest)

- Pool helper: spawn fills free slots only, dead particles are recycled, never exceeds capacity

## Acceptance Criteria

- Kicks produce visible radial bursts; quiet passages calm down
- No memory growth over several minutes of playback
