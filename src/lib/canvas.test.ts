import { describe, expect, it } from 'vitest'
import { MAX_DPR, computeBackingSize } from './canvas'

describe('computeBackingSize', () => {
  it('scales by the device pixel ratio', () => {
    expect(computeBackingSize(800, 400, 1)).toEqual({
      pixelWidth: 800,
      pixelHeight: 400,
      scale: 1,
    })
    expect(computeBackingSize(800, 400, 1.5)).toMatchObject({
      pixelWidth: 1200,
      pixelHeight: 600,
    })
  })

  it('caps the scale at MAX_DPR', () => {
    const result = computeBackingSize(500, 300, 3)
    expect(result.scale).toBe(MAX_DPR)
    expect(result.pixelWidth).toBe(1000)
  })

  it('never goes below a scale of 1 or a size of 1 pixel', () => {
    expect(computeBackingSize(100, 100, 0.5).scale).toBe(1)
    expect(computeBackingSize(0, 0, 2)).toMatchObject({ pixelWidth: 1, pixelHeight: 1 })
  })

  it('falls back to a scale of 1 for invalid ratios', () => {
    expect(computeBackingSize(100, 50, NaN).scale).toBe(1)
  })

  it('rounds fractional sizes', () => {
    expect(computeBackingSize(100.4, 50.6, 1)).toMatchObject({
      pixelWidth: 100,
      pixelHeight: 51,
    })
  })
})
