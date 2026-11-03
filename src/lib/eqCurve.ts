import { EQ_BANDS } from './constants'
import type { EqBandId } from '@/types'

/** Magnitude (dB) of one RBJ biquad band at `freq`, matching Web Audio's shelf/peaking filters. */
function bandResponseDb(
  type: BiquadFilterType,
  f0: number,
  q: number,
  gainDb: number,
  freq: number,
  sampleRate: number,
): number {
  if (gainDb === 0) return 0
  const A = 10 ** (gainDb / 40)
  const w0 = (2 * Math.PI * f0) / sampleRate
  const cos = Math.cos(w0)
  const sin = Math.sin(w0)
  let b: [number, number, number]
  let a: [number, number, number]
  if (type === 'peaking') {
    const alpha = sin / (2 * q)
    b = [1 + alpha * A, -2 * cos, 1 - alpha * A]
    a = [1 + alpha / A, -2 * cos, 1 - alpha / A]
  } else {
    const k = 2 * Math.sqrt(A) * (sin / 2) * Math.SQRT2
    if (type === 'lowshelf') {
      b = [
        A * (A + 1 - (A - 1) * cos + k),
        2 * A * (A - 1 - (A + 1) * cos),
        A * (A + 1 - (A - 1) * cos - k),
      ]
      a = [A + 1 + (A - 1) * cos + k, -2 * (A - 1 + (A + 1) * cos), A + 1 + (A - 1) * cos - k]
    } else {
      b = [
        A * (A + 1 + (A - 1) * cos + k),
        -2 * A * (A - 1 + (A + 1) * cos),
        A * (A + 1 + (A - 1) * cos - k),
      ]
      a = [A + 1 - (A - 1) * cos + k, 2 * (A - 1 - (A + 1) * cos), A + 1 - (A - 1) * cos - k]
    }
  }
  const w = (2 * Math.PI * freq) / sampleRate
  const mag = (c: [number, number, number]) =>
    Math.hypot(
      c[0] + c[1] * Math.cos(w) + c[2] * Math.cos(2 * w),
      c[1] * Math.sin(w) + c[2] * Math.sin(2 * w),
    )
  return 20 * Math.log10(mag(b) / mag(a))
}

/** Combined EQ response in dB at each frequency in `freqs`. */
export function eqResponseDb(
  gains: Record<EqBandId, number>,
  freqs: readonly number[],
  sampleRate = 48000,
): number[] {
  return freqs.map((f) =>
    EQ_BANDS.reduce(
      (sum, band) =>
        sum + bandResponseDb(band.type, band.frequency, band.q, gains[band.id], f, sampleRate),
      0,
    ),
  )
}
