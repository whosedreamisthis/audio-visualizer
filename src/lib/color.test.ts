import { describe, expect, it } from 'vitest'
import { THEMES } from '@/visualizers/themes'
import { contrastRatio, readableForeground } from './color'

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for identical colors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5)
  })
})

describe('readableForeground', () => {
  it('picks dark text on light backgrounds and light text on dark ones', () => {
    expect(readableForeground('#ffffff')).toBe('#0a0a0a')
    expect(readableForeground('#000000')).toBe('#fafafa')
  })

  it('meets WCAG AA (4.5:1) on every theme accent', () => {
    for (const theme of Object.values(THEMES)) {
      expect(contrastRatio(theme.accent, readableForeground(theme.accent))).toBeGreaterThanOrEqual(4.5)
    }
  })
})
