import { PARTICLE_COUNT } from '@/lib/constants'
import type { VisualizerSettings } from '@/types'

/** Average frame time above this (ms) for `WINDOW_MS` counts as struggling. */
export const SLOW_FRAME_MS = 20
export const WINDOW_MS = 2000

/** Share of the requested particle count kept in reduced quality. */
const REDUCED_PARTICLE_SHARE = 0.4

/**
 * Tracks frame times over a fixed window and reports once when the average
 * stays above the budget. Allocation-free, so it is safe to call every frame.
 */
export class FrameBudgetMonitor {
  private elapsed = 0
  private frames = 0

  /** Add one frame (ms). Returns true when a full window averaged over budget. */
  push(frameMs: number): boolean {
    this.elapsed += frameMs
    this.frames += 1
    if (this.elapsed < WINDOW_MS) return false
    const slow = this.elapsed / this.frames > SLOW_FRAME_MS
    this.reset()
    return slow
  }

  reset(): void {
    this.elapsed = 0
    this.frames = 0
  }
}

/** Cheaper settings for struggling devices: no glow, fewer particles. */
export function reduceQuality(settings: VisualizerSettings): VisualizerSettings {
  return {
    ...settings,
    glow: false,
    particleCount: Math.max(
      PARTICLE_COUNT.min,
      Math.round(settings.particleCount * REDUCED_PARTICLE_SHARE),
    ),
  }
}
