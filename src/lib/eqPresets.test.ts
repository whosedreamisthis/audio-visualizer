import { describe, expect, it } from 'vitest'
import { EQ_BANDS, EQ_RANGE_DB } from './constants'
import { EQ_PRESETS, findMatchingPreset } from './eqPresets'

describe('EQ presets', () => {
  it('cover every band within the dB range', () => {
    for (const preset of EQ_PRESETS) {
      for (const band of EQ_BANDS) {
        const db = preset.bands[band.id]
        expect(db).toBeGreaterThanOrEqual(EQ_RANGE_DB.min)
        expect(db).toBeLessThanOrEqual(EQ_RANGE_DB.max)
      }
    }
  })

  it('have unique ids', () => {
    const ids = EQ_PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('findMatchingPreset detects presets and custom curves', () => {
    expect(findMatchingPreset({ low: 0, mid: 0, high: 0 })?.id).toBe('flat')
    expect(findMatchingPreset({ low: 6, mid: -1, high: 0 })?.id).toBe('bass-boost')
    expect(findMatchingPreset({ low: 1, mid: 2, high: 3 })).toBeUndefined()
  })
})
