const DARK_TEXT = '#0a0a0a'
const LIGHT_TEXT = '#fafafa'

/** WCAG relative luminance of a `#rrggbb` color. */
export function relativeLuminance(hex: string): number {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const channel = (shift: number) => {
    const c = ((n >> shift) & 255) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

/** WCAG contrast ratio between two `#rrggbb` colors, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Near-black or near-white, whichever reads better on `background`. */
export function readableForeground(background: string): string {
  return contrastRatio(background, DARK_TEXT) >= contrastRatio(background, LIGHT_TEXT)
    ? DARK_TEXT
    : LIGHT_TEXT
}
