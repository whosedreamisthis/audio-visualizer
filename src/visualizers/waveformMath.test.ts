import { describe, expect, it } from 'vitest'
import {
  byteToUnit,
  fillWaveformPoints,
  waveformPointCount,
} from './waveformMath'

describe('waveformPointCount', () => {
  it('uses about one point per 2 px', () => {
    expect(waveformPointCount(1000)).toBe(500)
    expect(waveformPointCount(801)).toBe(401)
  })

  it('keeps a minimum for tiny or invalid widths', () => {
    expect(waveformPointCount(0)).toBe(8)
    expect(waveformPointCount(-50)).toBe(8)
    expect(waveformPointCount(NaN)).toBe(8)
    expect(waveformPointCount(4)).toBe(8)
  })
})

describe('byteToUnit', () => {
  it('maps bytes to -1..1 with 128 as silence', () => {
    expect(byteToUnit(128)).toBe(0)
    expect(byteToUnit(0)).toBe(-1)
    expect(byteToUnit(255)).toBeCloseTo(0.992, 2)
  })
})

describe('fillWaveformPoints', () => {
  it('maps silence to the vertical center', () => {
    const out = new Float32Array(10)
    fillWaveformPoints(out, new Uint8Array(64).fill(128), 100, 50)
    expect(Array.from(out)).toEqual(new Array(10).fill(100))
  })

  it('reaches mid ± amp at full scale', () => {
    const top = new Float32Array(4)
    fillWaveformPoints(top, new Uint8Array(16).fill(0), 100, 50)
    expect(top[0]).toBe(50)

    const bottom = new Float32Array(4)
    fillWaveformPoints(bottom, new Uint8Array(16).fill(255), 100, 50)
    expect(bottom[0]).toBeCloseTo(149.6, 1)
  })

  it('samples evenly across the data when downsampling', () => {
    // 8 samples ramping 128 → 128+7*16; 4 points pick indices 0, 2, 4, 6
    const wave = Uint8Array.from({ length: 8 }, (_, i) => 128 + i * 16)
    const out = new Float32Array(4)
    fillWaveformPoints(out, wave, 0, 128)
    expect(Array.from(out)).toEqual([0, 32, 64, 96])
  })

  it('repeats samples when there are more points than data', () => {
    const out = new Float32Array(4)
    fillWaveformPoints(out, Uint8Array.from([0, 255]), 0, 1)
    expect(out[0]).toBe(out[1])
    expect(out[2]).toBe(out[3])
    expect(out[0]).toBeLessThan(out[2])
  })

  it('falls back to the center when there is no data', () => {
    const out = new Float32Array(5).fill(999)
    fillWaveformPoints(out, new Uint8Array(0), 40, 20)
    expect(Array.from(out)).toEqual([40, 40, 40, 40, 40])
  })
})
