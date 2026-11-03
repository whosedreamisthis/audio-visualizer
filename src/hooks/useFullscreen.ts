import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'

export const CONTROLS_HIDE_DELAY_MS = 3000

const ACTIVITY_EVENTS = ['mousemove', 'pointerdown', 'touchstart', 'keydown'] as const

/**
 * Keeps the ui store in sync with the browser's fullscreen state (including Esc)
 * and hides the controls after a few idle seconds while fullscreen.
 */
export function useFullscreen(): void {
  const fullscreen = useUiStore((s) => s.fullscreen)

  useEffect(() => {
    const sync = () => useUiStore.getState().setFullscreen(document.fullscreenElement !== null)
    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  useEffect(() => {
    const { setControlsVisible } = useUiStore.getState()
    if (!fullscreen) {
      setControlsVisible(true)
      return
    }

    let timer: ReturnType<typeof setTimeout>
    const show = () => {
      if (!useUiStore.getState().controlsVisible) setControlsVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS)
    }

    show()
    for (const type of ACTIVITY_EVENTS) window.addEventListener(type, show)
    return () => {
      clearTimeout(timer)
      for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, show)
      setControlsVisible(true)
    }
  }, [fullscreen])
}
