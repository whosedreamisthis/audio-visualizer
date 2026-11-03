import { useEffect, type RefObject } from 'react'
import { getAudioEngine } from '@/audio/engine'
import { FrameSampler } from '@/audio/frameSampler'
import { fitCanvasToDisplay } from '@/lib/canvas'
import { usePlaybackStore } from '@/store/playbackStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import { getVisualizer } from '@/visualizers'
import { getTheme } from '@/visualizers/themes'
import type { DrawArgs, Size, Visualizer } from '@/types'

/** Longest frame step passed to visualizers, so a tab switch doesn't cause a jump. */
const MAX_DT = 0.05

/**
 * Runs the single requestAnimationFrame render loop for the canvas.
 * Everything per-frame (settings, theme, audio) is read imperatively, so
 * nothing here triggers a React render and changing a setting never restarts the loop.
 */
export function useVisualizerLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const engine = getAudioEngine()
    const sampler = new FrameSampler()
    const size: Size = { width: 0, height: 0 }
    let active: Visualizer | null = null
    let raf = 0
    let last = 0
    const startedAt = performance.now()

    // One args object reused every frame to avoid per-frame allocation
    const args: DrawArgs = {
      ctx,
      width: 0,
      height: 0,
      dt: 0,
      time: 0,
      playing: false,
      theme: getTheme(useVisualizerStore.getState().themeId),
      settings: useVisualizerStore.getState().settings,
      audio: sampler.frame,
    }

    const applySize = () => {
      const fitted = fitCanvasToDisplay(canvas, ctx)
      size.width = fitted.width
      size.height = fitted.height
      active?.resize?.(size)
    }
    const observer = new ResizeObserver(applySize)
    observer.observe(canvas)
    applySize()

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT)
      last = now

      const { mode, themeId, settings } = useVisualizerStore.getState()
      const next = getVisualizer(mode)
      if (next !== active) {
        active?.dispose?.()
        active = next
        active.init?.(size)
      }

      sampler.sample(engine, dt)

      args.width = size.width
      args.height = size.height
      args.dt = dt
      args.time = (now - startedAt) / 1000
      args.playing = usePlaybackStore.getState().status === 'playing'
      args.theme = getTheme(themeId)
      args.settings = settings
      active.draw(args)

      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onVisibilityChange = () => (document.hidden ? stop() : start())

    document.addEventListener('visibilitychange', onVisibilityChange)
    if (!document.hidden) start()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      observer.disconnect()
      active?.dispose?.()
      active = null
    }
  }, [canvasRef])
}
