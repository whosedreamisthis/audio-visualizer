import type { EqBandId } from '@/types'

export interface EqPreset {
  id: string
  label: string
  bands: Record<EqBandId, number>
}

export const EQ_PRESETS: readonly EqPreset[] = [
  { id: 'flat', label: 'Flat', bands: { low: 0, mid: 0, high: 0 } },
  { id: 'bass-boost', label: 'Bass Boost', bands: { low: 6, mid: -1, high: 0 } },
  { id: 'vocal', label: 'Vocal', bands: { low: -2, mid: 4, high: 1 } },
  { id: 'treble', label: 'Treble', bands: { low: -1, mid: 0, high: 6 } },
  { id: 'lo-fi', label: 'Lo-Fi', bands: { low: -4, mid: 3, high: -6 } },
]

/** The preset whose bands exactly match `bands`, or undefined for a custom curve. */
export function findMatchingPreset(
  bands: Record<EqBandId, number>,
): EqPreset | undefined {
  return EQ_PRESETS.find(
    (p) =>
      p.bands.low === bands.low &&
      p.bands.mid === bands.mid &&
      p.bands.high === bands.high,
  )
}
