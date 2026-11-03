export function isFullscreenSupported(): boolean {
  return typeof document !== 'undefined' && document.fullscreenEnabled === true
}

/**
 * Fullscreens the whole page rather than only the canvas, so the player bar,
 * toasts and tooltips stay available and can auto-hide.
 */
export async function toggleFullscreen(): Promise<void> {
  if (!isFullscreenSupported()) return
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    // denied or interrupted; the fullscreenchange listener keeps state correct
  }
}
