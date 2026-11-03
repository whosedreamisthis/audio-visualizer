import { useEffect } from 'react'
import { readableForeground } from '@/lib/color'
import { useVisualizerStore } from '@/store/visualizerStore'
import { getTheme } from '@/visualizers/themes'
import type { ThemeId } from '@/types'

/** Point the shadcn accent/primary tokens at the theme's accent color. */
export function applyThemeToDocument(themeId: ThemeId, root: HTMLElement = document.documentElement): void {
  const { accent } = getTheme(themeId)
  const foreground = readableForeground(accent)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-foreground', foreground)
  root.style.setProperty('--primary', accent)
  root.style.setProperty('--primary-foreground', foreground)
  root.style.setProperty('--ring', accent)
}

/** Keeps the app chrome accent in sync with the selected theme. */
export function useApplyTheme(): void {
  useEffect(() => {
    applyThemeToDocument(useVisualizerStore.getState().themeId)
    return useVisualizerStore.subscribe(
      (s) => s.themeId,
      (id) => applyThemeToDocument(id),
    )
  }, [])
}
