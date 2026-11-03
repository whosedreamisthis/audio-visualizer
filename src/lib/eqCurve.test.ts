import { describe, expect, it } from 'vitest'
import { eqResponseDb } from './eqCurve'

describe('eqResponseDb', () => {
  it('is flat when all gains are zero', () => {
    const out = eqResponseDb({ low: 0, mid: 0, high: 0 }, [50, 1000, 10000])
    out.forEach((v) => expect(v).toBeCloseTo(0, 5))
  })

  it('boosts lows and leaves highs alone for a low boost', () => {
    const [lo, hi] = eqResponseDb({ low: 6, mid: 0, high: 0 }, [30, 15000])
    expect(lo).toBeCloseTo(6, 0)
    expect(Math.abs(hi)).toBeLessThan(0.5)
  })

  it('peaks near the mid frequency', () => {
    const [mid] = eqResponseDb({ low: 0, mid: 6, high: 0 }, [1000])
    expect(mid).toBeCloseTo(6, 1)
  })
})
