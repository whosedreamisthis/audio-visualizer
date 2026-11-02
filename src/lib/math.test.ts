import { describe, expect, it } from 'vitest'
import { clamp, lerp, mapRange } from './math'

describe('clamp', () => {
  it('returns the value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps below min and above max', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(42, 0, 10)).toBe(10)
  })

  it('returns min for NaN and Infinity', () => {
    expect(clamp(NaN, 0, 10)).toBe(0)
    expect(clamp(Infinity, 0, 10)).toBe(0)
  })
})

describe('lerp', () => {
  it('interpolates between endpoints', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(0, 10, 1)).toBe(10)
  })

  it('works with negative ranges', () => {
    expect(lerp(-10, 10, 0.25)).toBe(-5)
  })
})

describe('mapRange', () => {
  it('maps between ranges', () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50)
    expect(mapRange(0, -12, 12, 0, 1)).toBe(0.5)
  })

  it('supports inverted output ranges', () => {
    expect(mapRange(2, 0, 10, 100, 0)).toBe(80)
  })

  it('returns outMin for a zero-width input range', () => {
    expect(mapRange(3, 5, 5, 0, 100)).toBe(0)
  })
})
