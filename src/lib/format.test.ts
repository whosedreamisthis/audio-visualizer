import { describe, expect, it } from 'vitest'
import { formatDb, formatPercent, formatSpeed, formatTime } from './format'

describe('formatTime', () => {
  it('formats common values', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(59.9)).toBe('0:59')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(198)).toBe('3:18')
    expect(formatTime(3599)).toBe('59:59')
  })

  it('handles invalid and negative input', () => {
    expect(formatTime(NaN)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
    expect(formatTime(-5)).toBe('0:00')
  })
})

describe('formatDb', () => {
  it('adds a sign for positive and negative values', () => {
    expect(formatDb(4)).toBe('+4 dB')
    expect(formatDb(-3.5)).toBe('-3.5 dB')
  })

  it('shows zero without a sign', () => {
    expect(formatDb(0)).toBe('0 dB')
    expect(formatDb(0.04)).toBe('0 dB')
  })

  it('handles non-finite input', () => {
    expect(formatDb(NaN)).toBe('0 dB')
  })
})

describe('formatPercent', () => {
  it('converts ratios to percentages', () => {
    expect(formatPercent(0.7)).toBe('70%')
    expect(formatPercent(2)).toBe('200%')
    expect(formatPercent(NaN)).toBe('0%')
  })
})

describe('formatSpeed', () => {
  it('drops trailing zeros', () => {
    expect(formatSpeed(1)).toBe('1x')
    expect(formatSpeed(1.25)).toBe('1.25x')
    expect(formatSpeed(0.5)).toBe('0.5x')
  })

  it('handles non-finite input', () => {
    expect(formatSpeed(NaN)).toBe('1x')
  })
})
