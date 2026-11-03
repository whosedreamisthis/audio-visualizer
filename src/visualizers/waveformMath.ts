/** Pixels of canvas width per plotted point; about one point per 2 px is smooth enough. */
const PX_PER_POINT = 2
const MIN_POINTS = 8

/** Number of points to plot for a canvas `width` CSS pixels wide. */
export function waveformPointCount(width: number): number {
  if (!Number.isFinite(width) || width <= 0) return MIN_POINTS
  return Math.max(MIN_POINTS, Math.ceil(width / PX_PER_POINT))
}

/** Convert a time-domain byte (128 = silence) to -1..1. */
export function byteToUnit(byte: number): number {
  return (byte - 128) / 128
}

/**
 * Fill `out` with y positions by sampling `wave` at evenly spaced positions,
 * linearly interpolating between neighbouring samples so upsampled data has no steps.
 * Silence (or no data) maps to `mid`; full scale reaches `mid ± amp`.
 */
export function fillWaveformPoints(
  out: Float32Array,
  wave: Uint8Array,
  mid: number,
  amp: number,
): void {
  const count = out.length
  const length = wave.length

  for (let i = 0; i < count; i++) {
    if (length === 0) {
      out[i] = mid
      continue
    }
    const pos = count > 1 ? (i * (length - 1)) / (count - 1) : 0
    const lo = Math.floor(pos)
    const hi = Math.min(length - 1, lo + 1)
    const frac = pos - lo
    const unit = byteToUnit(wave[lo]) * (1 - frac) + byteToUnit(wave[hi]) * frac
    out[i] = mid + unit * amp
  }
}

/** Soften corners with repeated [1 2 1] / 4 passes, keeping the end points fixed. */
export function smoothPoints(ys: Float32Array, passes: number): void {
  const n = ys.length
  if (n < 3) return
  for (let p = 0; p < passes; p++) {
    let prev = ys[0]
    for (let i = 1; i < n - 1; i++) {
      const cur = ys[i]
      ys[i] = (prev + 2 * cur + ys[i + 1]) / 4
      prev = cur
    }
  }
}

/** Largest absolute sample (0..1) in time-domain byte data; 0 for silence or no data. */
export function peakAmplitude(wave: Uint8Array): number {
  let peak = 0
  for (let i = 0; i < wave.length; i++) {
    const v = Math.abs(wave[i] - 128)
    if (v > peak) peak = v
  }
  return peak / 128
}

/** Seconds for the remembered peak to fall to about a third. */
const PEAK_DECAY_SECONDS = 1.5
/** Quiet material never needs more than this much lift. */
const MAX_GAIN = 8
/** Fraction of full swing the recent peak is scaled to. */
const TARGET_FILL = 0.85
/** Peaks below this are treated as this, so near-silence isn't amplified. */
const MIN_PEAK = 0.1

/** Recent peak: rises instantly, decays over a second or two. */
export function trackWavePeak(previous: number, value: number, dt: number): number {
  return Math.max(value, previous * Math.exp(-Math.max(dt, 0) / PEAK_DECAY_SECONDS))
}

/** Gain (1..MAX_GAIN) that scales a quiet signal's recent peak up to a fixed share of the swing. */
export function waveformGain(peak: number): number {
  return Math.min(MAX_GAIN, Math.max(1, TARGET_FILL / Math.max(peak, MIN_PEAK)))
}
