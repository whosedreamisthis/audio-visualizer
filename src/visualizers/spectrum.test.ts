import { describe, expect, it } from 'vitest'
import {
  adaptiveGain,
  averageBins,
  compressLevel,
  computeBarEdges,
  shapeLevel,
  trackPeak,
  trebleTilt,
} from './spectrum'

const SAMPLE_RATE = 48000
const BINS = 1024

describe('computeBarEdges', () => {
  it('returns count + 1 edges within the bin range', () => {
    const edges = computeBarEdges(64, BINS, SAMPLE_RATE)
    expect(edges.length).toBe(65)
    expect(edges[0]).toBeGreaterThanOrEqual(0)
    expect(edges[64]).toBeLessThanOrEqual(BINS)
  })

  it('is strictly increasing so every bar owns at least one bin', () => {
    for (const count of [16, 64, 128]) {
      const edges = computeBarEdges(count, BINS, SAMPLE_RATE)
      for (let i = 1; i < edges.length; i++) {
        expect(edges[i]).toBeGreaterThan(edges[i - 1])
      }
    }
  })

  it('spaces bars on a log scale (high bars span more bins than low bars)', () => {
    const edges = computeBarEdges(64, BINS, SAMPLE_RATE)
    const lowSpan = edges[8] - edges[0]
    const highSpan = edges[64] - edges[56]
    expect(highSpan).toBeGreaterThan(lowSpan)
  })

  it('covers the upper treble instead of stopping at the midrange', () => {
    const edges = computeBarEdges(64, BINS, SAMPLE_RATE)
    // 12 kHz at 48 kHz / 2048 FFT is bin ~512
    expect(edges[64]).toBeGreaterThan(450)
  })

  it('stays valid with very few bins or many bars', () => {
    const edges = computeBarEdges(128, 64, SAMPLE_RATE)
    for (let i = 1; i < edges.length; i++) {
      expect(edges[i]).toBeGreaterThanOrEqual(edges[i - 1])
    }
    expect(edges[128]).toBeLessThanOrEqual(64)
  })

  it('returns zeros for invalid input', () => {
    expect(Array.from(computeBarEdges(4, 0, SAMPLE_RATE))).toEqual([0, 0, 0, 0, 0])
    expect(Array.from(computeBarEdges(0, BINS, SAMPLE_RATE))).toEqual([0])
    expect(Array.from(computeBarEdges(4, BINS, 0))).toEqual([0, 0, 0, 0, 0])
  })
})

describe('averageBins', () => {
  it('averages a range as a 0..1 value', () => {
    const data = Uint8Array.from([0, 255, 255, 0])
    expect(averageBins(data, 1, 3)).toBe(1)
    expect(averageBins(data, 0, 4)).toBe(0.5)
  })

  it('returns 0 for empty or out-of-range spans', () => {
    const data = new Uint8Array(4).fill(255)
    expect(averageBins(data, 2, 2)).toBe(0)
    expect(averageBins(data, 10, 12)).toBe(0)
    expect(averageBins(new Uint8Array(0), 0, 4)).toBe(0)
  })

  it('clamps the end to the data length', () => {
    expect(averageBins(new Uint8Array(4).fill(255), 2, 100)).toBe(1)
  })
})

describe('compressLevel', () => {
  it('lifts quiet values and leaves 0 and 1 alone', () => {
    expect(compressLevel(0.1)).toBeGreaterThan(0.2)
    expect(compressLevel(0)).toBe(0)
    expect(compressLevel(1)).toBe(1)
  })

  it('treats negative input as silence', () => {
    expect(compressLevel(-0.5)).toBe(0)
  })
})

describe('trackPeak', () => {
  it('rises instantly to a new maximum', () => {
    expect(trackPeak(0.2, 0.9, 1 / 60)).toBe(0.9)
  })

  it('decays slowly when the signal drops', () => {
    const after1s = trackPeak(0.8, 0, 1)
    expect(after1s).toBeLessThan(0.8)
    expect(after1s).toBeGreaterThan(0.6)
  })

  it('keeps decaying toward zero over time', () => {
    let peak = 1
    for (let i = 0; i < 60 * 30; i++) peak = trackPeak(peak, 0, 1 / 60)
    expect(peak).toBeLessThan(0.01)
  })

  it('does not grow when dt is negative or zero', () => {
    expect(trackPeak(0.5, 0, -1)).toBe(0.5)
    expect(trackPeak(0.5, 0, 0)).toBe(0.5)
  })
})

describe('adaptiveGain', () => {
  it('boosts quiet bars more than loud ones', () => {
    expect(adaptiveGain(0.2)).toBeGreaterThan(adaptiveGain(0.8))
    expect(adaptiveGain(1)).toBe(1)
  })

  it('caps the boost for near-silent bars', () => {
    expect(adaptiveGain(0)).toBe(adaptiveGain(0.15))
    expect(adaptiveGain(0)).toBeLessThan(4)
  })
})

describe('shapeLevel', () => {
  it('keeps silence at zero and never exceeds 1', () => {
    expect(shapeLevel(0, 0.5, 0.5, 1)).toBe(0)
    expect(shapeLevel(1, 1, 1, 3)).toBe(1)
  })

  it('lets a quiet range reach a comparable height to a loud one', () => {
    const quiet = shapeLevel(0.15, 0.15, 0.9, 1) // quiet treble at its own peak
    const loud = shapeLevel(0.9, 0.9, 0.1, 1) // loud bass at its own peak
    expect(quiet).toBeGreaterThan(0.4)
    expect(quiet).toBeLessThan(loud)
  })

  it('increases with sensitivity and bar position', () => {
    expect(shapeLevel(0.2, 0.5, 0.5, 2)).toBeGreaterThan(shapeLevel(0.2, 0.5, 0.5, 1))
    expect(shapeLevel(0.2, 0.5, 0.9, 1)).toBeGreaterThan(shapeLevel(0.2, 0.5, 0.1, 1))
  })
})

describe('trebleTilt', () => {
  it('increases toward the high end', () => {
    expect(trebleTilt(1)).toBeGreaterThan(trebleTilt(0.5))
    expect(trebleTilt(0.5)).toBeGreaterThan(trebleTilt(0))
  })
})
