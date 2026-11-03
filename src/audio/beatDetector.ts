import { clamp } from '@/lib/math'

export interface BeatDetectorOptions {
  /** Time constant (seconds) of the rolling bass average. */
  averageSeconds: number
  /** A beat needs bass above `average * threshold`. */
  threshold: number
  /** Absolute floor so near-silence noise never triggers a beat. */
  minLevel: number
  /** Minimum seconds between beats. */
  cooldownSeconds: number
}

export const DEFAULT_BEAT_OPTIONS: BeatDetectorOptions = {
  averageSeconds: 1,
  threshold: 1.3,
  minLevel: 0.15,
  cooldownSeconds: 0.25,
}

export interface BeatResult {
  beat: boolean
  /** 0..1, how far the bass exceeds the trigger level on a beat; 0 otherwise. */
  strength: number
}

/** Detects bass onsets by comparing bass energy to its rolling (exponential) average. */
export class BeatDetector {
  private readonly options: BeatDetectorOptions
  private average = 0
  private cooldown = 0
  private readonly result: BeatResult = { beat: false, strength: 0 }

  constructor(options: Partial<BeatDetectorOptions> = {}) {
    this.options = { ...DEFAULT_BEAT_OPTIONS, ...options }
  }

  /** Feed one frame of bass energy (0..1) and the frame time `dt` in seconds. */
  update(bass: number, dt: number): BeatResult {
    const { averageSeconds, threshold, minLevel, cooldownSeconds } = this.options
    this.cooldown = Math.max(0, this.cooldown - dt)

    const trigger = Math.max(this.average * threshold, minLevel)
    const isBeat = bass > trigger && this.cooldown === 0

    this.result.beat = isBeat
    this.result.strength = isBeat
      ? clamp((bass - trigger) / Math.max(1 - trigger, 0.0001), 0, 1)
      : 0
    if (isBeat) this.cooldown = cooldownSeconds

    // Update the average after the comparison so a spike doesn't hide itself
    const alpha = 1 - Math.exp(-dt / averageSeconds)
    this.average += (bass - this.average) * alpha

    return this.result
  }

  reset(): void {
    this.average = 0
    this.cooldown = 0
    this.result.beat = false
    this.result.strength = 0
  }
}
