/** Fewest bars ever drawn, so a tiny canvas still reads as a spectrum. */
export const MIN_BARS = 4
/** Narrowest horizontal slot (bar plus gap) per bar, in CSS px. */
const MIN_SLOT_PX = 6

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
