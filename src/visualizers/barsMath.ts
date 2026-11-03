/** Fewest bars ever drawn, so a tiny canvas still reads as a spectrum. */
export const MIN_BARS = 4
/** Narrowest horizontal slot (bar plus gap) per bar, in CSS px. */
const MIN_SLOT_PX = 6

/** Seconds a peak cap hovers at its high point before it starts to fall. */
export const PEAK_HOLD_SECONDS = 0.35
/** Downward acceleration of a falling peak cap, in bar-heights per second squared. */
export const PEAK_GRAVITY = 2.4

/** Bar count to draw: the requested count, reduced so each bar keeps a usable slot. */
export function effectiveBarCount(requested: number, width: number): number {
  const wanted = Number.isFinite(requested) ? Math.max(1, Math.round(requested)) : MIN_BARS
  if (!Number.isFinite(width) || width <= 0) return Math.max(MIN_BARS, Math.min(wanted, MIN_BARS))
  const fit = Math.floor(width / MIN_SLOT_PX)
  return Math.max(MIN_BARS, Math.min(wanted, fit))
}

/** Horizontal layout: gap is a fixed fraction of the slot so it scales with bar width. */
export function barLayout(
  count: number,
  width: number,
): { barWidth: number; gap: number } {
  const slot = width / count
  const gap = slot * 0.22
  return { barWidth: Math.max(1, slot - gap), gap }
}

/**
 * Advance one peak cap. It snaps up to `height`, holds briefly, then falls with
 * growing speed (gravity) but never below the bar itself. Mutates the arrays.
 */
export function updatePeakCap(
  peaks: Float32Array,
  velocities: Float32Array,
  holds: Float32Array,
  i: number,
  height: number,
  dt: number,
): void {
  if (height >= peaks[i]) {
    peaks[i] = height
    velocities[i] = 0
    holds[i] = PEAK_HOLD_SECONDS
    return
  }
  if (holds[i] > 0) {
    holds[i] -= dt
    return
  }
  velocities[i] += PEAK_GRAVITY * dt
  peaks[i] = Math.max(height, peaks[i] - velocities[i] * dt)
}
