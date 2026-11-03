import { useEffect, type RefObject } from 'react'
import { getAudioEngine } from '@/audio/engine'
import { FrameSampler } from '@/audio/frameSampler'
import { fitCanvasToDisplay } from '@/lib/canvas'
import { FrameBudgetMonitor, reduceQuality } from '@/lib/frameBudget'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import { getVisualizer } from '@/visualizers'
import { getTheme } from '@/visualizers/themes'
import type { DrawArgs, Size, Visualizer, VisualizerSettings } from '@/types'

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

    // Reduced motion: no glow, no beat flashes, and a slower idle animation
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = motionQuery.matches
    const onMotionChange = () => (reduced = motionQuery.matches)
    motionQuery.addEventListener('change', onMotionChange)
    let calmSource: VisualizerSettings | null = null
    let calmSettings: VisualizerSettings | null = null

    const budget = new FrameBudgetMonitor()
    let lowSource: VisualizerSettings | null = null
    let lowSettings: VisualizerSettings | null = null

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

      let time = (now - startedAt) / 1000
      let drawSettings = settings
      if (reduced) {
        sampler.frame.beat = false
        sampler.frame.beatStrength = 0
        time *= 0.4
        if (calmSource !== settings) {
          calmSource = settings
          calmSettings = { ...settings, glow: false }
        }
        drawSettings = calmSettings ?? settings
      }

      // Adaptive quality: sustained slow frames drop glow and thin out particles
      const ui = useUiStore.getState()
      if (!ui.highQualityOverride) {
        if (!ui.qualityReduced && budget.push(dt * 1000)) {
          ui.setQualityReduced(true)
        }
        if (ui.qualityReduced) {
          if (lowSource !== drawSettings) {
            lowSource = drawSettings
            lowSettings = reduceQuality(drawSettings)
          }
          drawSettings = lowSettings ?? drawSettings
        }
      }

      args.width = size.width
      args.height = size.height
      args.dt = dt
      args.time = time
      args.playing = usePlaybackStore.getState().status === 'playing'
      args.theme = getTheme(themeId)
      args.settings = drawSettings
      active.draw(args)

      raf = requestAnimationFrame(frame)
    }

    // The loop runs only while the tab is visible and the canvas is on screen
    let onScreen = true
    const start = () => {
      if (raf) return
      last = performance.now()
      budget.reset() // the pause itself must not count as a slow frame
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const sync = () => (document.hidden || !onScreen ? stop() : start())

    const intersection =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            onScreen = entries[entries.length - 1].isIntersecting
            sync()
          })
        : null
    intersection?.observe(canvas)

    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', sync)
      intersection?.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
      observer.disconnect()
      active?.dispose?.()
      active = null
    }
  }, [canvasRef])
}
