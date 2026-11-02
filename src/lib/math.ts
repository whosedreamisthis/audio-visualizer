/** Clamp `value` into [min, max]. Non-finite input returns `min`. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

/** Linear interpolation between `a` and `b` by `t` (not clamped). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Map `value` from [inMin, inMax] to [outMin, outMax]. A zero-width input range returns `outMin`. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}
