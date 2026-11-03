import type { Theme, ThemeId } from '@/types'

export const THEMES: Record<ThemeId, Theme> = {
  neon: {
    id: 'neon',
    label: 'Neon',
    background: '#05060f',
    colors: ['#22d3ee', '#a855f7', '#ec4899'],
    accent: '#22d3ee',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    background: '#12060a',
    colors: ['#fb923c', '#ef4444', '#a21caf'],
    accent: '#fb923c',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    background: '#03111a',
    colors: ['#0ea5e9', '#14b8a6', '#6ee7b7'],
    accent: '#38bdf8',
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    background: '#050505',
    colors: ['#525252', '#d4d4d4', '#ffffff'],
    accent: '#e5e5e5',
  },
  aurora: {
    id: 'aurora',
    label: 'Aurora',
    background: '#040d0b',
    colors: ['#34d399', '#2dd4bf', '#8b5cf6'],
    accent: '#34d399',
  },
}

export function getTheme(id: ThemeId): Theme {
  return THEMES[id]
}
