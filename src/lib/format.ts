/** Format seconds as m:ss. Invalid or negative input returns `0:00`. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Format decibels with an explicit sign, e.g. `+4 dB`, `-3.5 dB`, `0 dB`. */
export function formatDb(db: number): string {
  if (!Number.isFinite(db)) return '0 dB'
  const rounded = Math.round(db * 10) / 10
  if (rounded === 0) return '0 dB'
  return `${rounded > 0 ? '+' : ''}${rounded} dB`
}

/** Format a 0..1 ratio as a percentage, e.g. `0.7` → `70%`. */
export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return '0%'
  return `${Math.round(ratio * 100)}%`
}

/** Format a playback rate, e.g. `1` → `1x`, `1.25` → `1.25x`. */
export function formatSpeed(rate: number): string {
  if (!Number.isFinite(rate)) return '1x'
  return `${Number(rate.toFixed(2))}x`
}
