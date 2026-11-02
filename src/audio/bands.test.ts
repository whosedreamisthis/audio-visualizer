import { describe, expect, it } from 'vitest'
import {
  binToFrequency,
  frequencyToBin,
  getBandEnergy,
  rangeEnergy,
} from './bands'

const SAMPLE_RATE = 48000
const FFT_SIZE = 2048
const BIN_COUNT = FFT_SIZE / 2

function spectrum(fill: (bin: number) => number): Uint8Array {
  return Uint8Array.from({ length: BIN_COUNT }, (_, i) => fill(i))
}

describe('bin / frequency conversion', () => {
  it('maps bins to frequencies', () => {
    expect(binToFrequency(0, SAMPLE_RATE, FFT_SIZE)).toBe(0)
    expect(binToFrequency(1, SAMPLE_RATE, FFT_SIZE)).toBeCloseTo(23.4375)
    expect(binToFrequency(BIN_COUNT, SAMPLE_RATE, FFT_SIZE)).toBe(24000)
  })

  it('maps frequencies back to bins', () => {
    expect(frequencyToBin(0, SAMPLE_RATE, FFT_SIZE)).toBe(0)
    expect(frequencyToBin(1000, SAMPLE_RATE, FFT_SIZE)).toBe(42)
  })
})

describe('getBandEnergy', () => {
  it('returns zero energy for silence', () => {
    const bands = getBandEnergy(spectrum(() => 0), SAMPLE_RATE, FFT_SIZE)
    expect(bands).toEqual({ bass: 0, mid: 0, treble: 0, level: 0 })
  })

  it('returns full energy for a full-scale spectrum', () => {
    const bands = getBandEnergy(spectrum(() => 255), SAMPLE_RATE, FFT_SIZE)
    expect(bands.bass).toBeCloseTo(1)
    expect(bands.mid).toBeCloseTo(1)
    expect(bands.treble).toBeCloseTo(1)
    expect(bands.level).toBeCloseTo(1)
  })

  it('attributes low-frequency energy to bass only', () => {
    // Bins 0-9 are below 250 Hz at this sample rate / FFT size (23.4 Hz per bin)
    const bands = getBandEnergy(
      spectrum((bin) => (bin < 10 ? 255 : 0)),
      SAMPLE_RATE,
      FFT_SIZE,
    )
    expect(bands.bass).toBeGreaterThan(0.8)
    expect(bands.mid).toBe(0)
    expect(bands.treble).toBe(0)
    expect(bands.level).toBeGreaterThan(0)
    expect(bands.level).toBeLessThan(bands.bass)
  })

  it('attributes mid-range energy to mid only', () => {
    const bands = getBandEnergy(
      spectrum((bin) => (bin >= 20 && bin <= 60 ? 255 : 0)),
      SAMPLE_RATE,
      FFT_SIZE,
    )
    expect(bands.bass).toBe(0)
    expect(bands.mid).toBeGreaterThan(0)
    expect(bands.treble).toBe(0)
  })

  it('attributes high-frequency energy to treble only', () => {
    const bands = getBandEnergy(
      spectrum((bin) => (bin >= 200 && bin <= 300 ? 255 : 0)),
      SAMPLE_RATE,
      FFT_SIZE,
    )
    expect(bands.bass).toBe(0)
    expect(bands.mid).toBe(0)
    expect(bands.treble).toBeGreaterThan(0)
  })

  it('keeps every value within 0..1', () => {
    const bands = getBandEnergy(
      spectrum((bin) => (bin * 37) % 256),
      SAMPLE_RATE,
      FFT_SIZE,
    )
    for (const value of Object.values(bands)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})

describe('rangeEnergy edge cases', () => {
  it('returns 0 for empty data or invalid parameters', () => {
    expect(rangeEnergy(new Uint8Array(0), SAMPLE_RATE, FFT_SIZE, 20, 250)).toBe(0)
    expect(rangeEnergy(spectrum(() => 255), 0, FFT_SIZE, 20, 250)).toBe(0)
    expect(rangeEnergy(spectrum(() => 255), SAMPLE_RATE, 0, 20, 250)).toBe(0)
  })

  it('uses at least one bin and clamps ranges beyond the spectrum', () => {
    const data = spectrum(() => 255)
    expect(rangeEnergy(data, SAMPLE_RATE, FFT_SIZE, 100, 100)).toBe(1)
    expect(rangeEnergy(data, SAMPLE_RATE, FFT_SIZE, 30000, 40000)).toBe(1)
  })
})
