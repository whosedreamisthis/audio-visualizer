import { lerp } from '@/lib/math'
import type { DrawArgs, Theme, Visualizer, VisualizerMode } from '@/types'
import {
  averageBins,
  compressLevel,
  computeBarEdges,
  shapeLevel,
  trackPeak,
} from './spectrum'

/**
 * Basic spectrum bars used for every mode until its dedicated visualizer exists.
 * Also shows the idle behavior: a calm ambient wave when nothing is playing.
 */
export function createFallbackVisualizer(
  id: VisualizerMode,
  label: string,
): Visualizer {
  let heights = new Float32Array(0)
  let peaks = new Float32Array(0)
  let edges: Uint16Array = new Uint16Array(0)
  let edgesKey = ''
  let gradient: CanvasGradient | null = null
  let gradientKey = ''

  const ensureHeights = (count: number) => {
    if (heights.length !== count) {
      heights = new Float32Array(count)
      peaks = new Float32Array(count)
    }
  }

  // Recompute log-spaced bin edges only when the bar count or spectrum layout changes
  const ensureEdges = (count: number, binCount: number, sampleRate: number) => {
    const key = `${count}:${binCount}:${sampleRate}`
    if (key !== edgesKey) {
      edges = computeBarEdges(count, binCount, sampleRate || 44100)
      edgesKey = key
    }
  }

  const getGradient = (
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    height: number,
  ): CanvasGradient => {
    const key = `${theme.id}:${height}`
    if (!gradient || key !== gradientKey) {
      const g = ctx.createLinearGradient(0, height, 0, 0)
      theme.colors.forEach((color, i) =>
        g.addColorStop(i / Math.max(1, theme.colors.length - 1), color),
      )
      gradient = g
      gradientKey = key
    }
    return gradient
  }

  return {
    id,
    label,
    init() {
      heights = new Float32Array(0)
      peaks = new Float32Array(0)
      edges = new Uint16Array(0)
      edgesKey = ''
      gradient = null
      gradientKey = ''
    },
    resize() {
      gradient = null
    },
    draw({ ctx, width, height, dt, time, theme, settings, audio }: DrawArgs) {
      ctx.fillStyle = theme.background
      ctx.fillRect(0, 0, width, height)

      const count = settings.barCount
      ensureHeights(count)

      const bins = audio.freq.length
      ensureEdges(count, bins, audio.sampleRate)
      const ease = 1 - Math.exp(-dt * 14)
      const gap = Math.max(1, width / count / 5)
      const barWidth = Math.max(1, (width - gap * (count - 1)) / count)
      const baseline = height * 0.92
      const maxBar = height * 0.8

      ctx.fillStyle = getGradient(ctx, theme, height)

      for (let i = 0; i < count; i++) {
        const t = i / count
        const compressed =
          bins > 0 ? compressLevel(averageBins(audio.freq, edges[i], edges[i + 1])) : 0
        peaks[i] = trackPeak(peaks[i], compressed, dt)
        const level = shapeLevel(compressed, peaks[i], t, settings.sensitivity)
        const ambient = 0.05 + 0.035 * Math.sin(time * 1.4 + i * 0.35)
        const target = Math.min(1, Math.max(level, ambient))

        heights[i] = lerp(heights[i], target, ease)

        const barHeight = Math.max(2, heights[i] * maxBar)
        ctx.fillRect(i * (barWidth + gap), baseline - barHeight, barWidth, barHeight)
      }
    },
    dispose() {
      gradient = null
      gradientKey = ''
    },
  }
}
