/** Lowest and highest frequencies (Hz) shown across the bars. */
export const SPECTRUM_MIN_HZ = 40
export const SPECTRUM_MAX_HZ = 12000

/**
 * Bin boundaries for `count` bars spaced evenly on a log frequency scale, so
 * bass doesn't get squashed into a few bars. Returns `count + 1` edges; bar `i`
 * covers bins [edges[i], edges[i + 1]) and always gets at least one bin.
 */
export function computeBarEdges(
  count: number,
  binCount: number,
  sampleRate: number,
  minHz = SPECTRUM_MIN_HZ,
  maxHz = SPECTRUM_MAX_HZ,
): Uint16Array {
  const edges = new Uint16Array(count + 1)
  if (count <= 0 || binCount <= 0 || sampleRate <= 0) return edges

  const fftSize = binCount * 2
  const ratio = maxHz / minHz

  for (let i = 0; i <= count; i++) {
    const hz = minHz * Math.pow(ratio, i / count)
    const bin = Math.round((hz * fftSize) / sampleRate)
    edges[i] = Math.min(Math.max(bin, 0), binCount)
  }

  // Keep edges strictly increasing so every bar owns at least one bin
  for (let i = 1; i <= count; i++) {
    if (edges[i] <= edges[i - 1]) edges[i] = Math.min(edges[i - 1] + 1, binCount)
  }
  // If we ran out of bins at the top, push earlier edges back down
  for (let i = count - 1; i >= 0; i--) {
    if (edges[i] >= edges[i + 1]) edges[i] = Math.max(edges[i + 1] - 1, 0)
  }

  return edges
}

/** Average energy (0..1) of bins [start, end) of byte frequency data. */
export function averageBins(freq: Uint8Array, start: number, end: number): number {
  const last = Math.min(end, freq.length)
  if (last <= start) return 0
  let sum = 0
  for (let i = start; i < last; i++) sum += freq[i]
  return sum / ((last - start) * 255)
}

/**
 * Gain that lifts higher bars, since music has far less energy at high
 * frequencies. `t` is the bar position from 0 (lowest) to 1 (highest).
 */
export function trebleTilt(t: number): number {
  return 0.9 + 0.9 * t
}

/** Exponent that lifts quiet values: 0.1 becomes about 0.22. */
const LEVEL_CURVE = 0.65

/** Compress a raw average energy (0..1) so quiet ranges stay visible. */
export function compressLevel(average: number): number {
  return Math.pow(Math.max(average, 0), LEVEL_CURVE)
}

/** How long (seconds) a bar's remembered peak takes to fade to about a third. */
const PEAK_DECAY_SECONDS = 6
/** Peaks below this are treated as this, so near-silence isn't amplified endlessly. */
const MIN_PEAK = 0.15
/** 0 = no adaptive scaling, 1 = every bar normalized to its own peak. */
const ADAPT_STRENGTH = 0.6

/** A bar's slowly decaying recent peak: rises instantly, falls over a few seconds. */
export function trackPeak(previous: number, value: number, dt: number): number {
  return Math.max(value, previous * Math.exp(-Math.max(dt, 0) / PEAK_DECAY_SECONDS))
}

/** Gain that evens out bars: quiet ranges (small peaks) are lifted more than loud ones. */
export function adaptiveGain(peak: number): number {
  return 1 / Math.pow(Math.max(peak, MIN_PEAK), ADAPT_STRENGTH)
}

/**
 * Final display level (0..1) for a bar from its compressed energy and recent
 * peak: adaptive gain, a mild treble tilt, sensitivity, and a clamp.
 */
export function shapeLevel(
  compressed: number,
  peak: number,
  t: number,
  sensitivity: number,
): number {
  return Math.min(1, compressed * adaptiveGain(peak) * trebleTilt(t) * sensitivity)
}
