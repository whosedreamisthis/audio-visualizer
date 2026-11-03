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
 * Fill `out` with y positions by sampling `wave` at evenly spaced indices.
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
    const index = Math.min(length - 1, Math.floor((i * length) / count))
    out[i] = mid + byteToUnit(wave[index]) * amp
  }
}
