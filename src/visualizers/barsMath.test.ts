import { describe, expect, it } from 'vitest'
import {
  MIN_BARS,
  barLayout,
  effectiveBarCount,
} from './barsMath'
import { computeBarEdges } from './spectrum'

describe('log-spaced bin grouping', () => {
  it('has monotonic edges that cover the range and give every bar a bin', () => {
    for (const count of [4, 32, 64, 128]) {
      const edges = computeBarEdges(count, 1024, 48000)
      expect(edges).toHaveLength(count + 1)
      for (let i = 1; i <= count; i++) expect(edges[i]).toBeGreaterThan(edges[i - 1])
      expect(edges[count]).toBeLessThanOrEqual(1024)
    }
  })

  it('gives bass fewer bins per bar than treble', () => {
    const edges = computeBarEdges(32, 1024, 48000)
    expect(edges[1] - edges[0]).toBeLessThan(edges[32] - edges[31])
  })
})

describe('effectiveBarCount', () => {
  it('keeps the requested count on wide canvases', () => {
    expect(effectiveBarCount(64, 1200)).toBe(64)
  })

  it('reduces the count on narrow canvases but never below the minimum', () => {
    expect(effectiveBarCount(128, 240)).toBe(40)
    expect(effectiveBarCount(128, 10)).toBe(MIN_BARS)
    expect(effectiveBarCount(64, 0)).toBe(MIN_BARS)
  })

  it('handles invalid input', () => {
    expect(effectiveBarCount(Number.NaN, 800)).toBe(MIN_BARS)
    expect(effectiveBarCount(0, 800)).toBe(MIN_BARS)
    expect(effectiveBarCount(64, Number.NaN)).toBe(MIN_BARS)
  })
})

describe('barLayout', () => {
  it('scales the gap with the bar slot and fills the width', () => {
    const wide = barLayout(32, 960)
    const narrow = barLayout(32, 480)
    expect(wide.gap).toBeGreaterThan(narrow.gap)
    expect((wide.barWidth + wide.gap) * 32).toBeCloseTo(960)
  })
})
