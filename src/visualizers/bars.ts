import { lerp } from '@/lib/math'
import type { DrawArgs, Theme, Visualizer } from '@/types'
import { barLayout, effectiveBarCount } from './barsMath'
import {
  averageBins,
  compressLevel,
  computeBarEdges,
  shapeLevel,
  trackPeak,
} from './spectrum'

/** Easing rates (per second): bars jump up fast and fall back slower. */
const ATTACK = 32
const RELEASE = 9
/** Fraction of the canvas height used by the tallest bar (per side when mirrored). */
const MAX_BAR = 0.8
const MAX_BAR_MIRROR = 0.42
const BASELINE = 0.92

/** Add a rounded rectangle (radius capped to fit) to the current path. */
function addRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const r = Math.min(w / 2, h / 2)
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Classic spectrum analyzer: log-spaced bars with eased heights. */
/** Height (0..1) of bar `i` of `count` while nothing is playing. */
function idleLevel(i: number, count: number, time: number): number {
  const t = i / count
  const wave = 0.5 + 0.5 * Math.sin(time * 1.6 - i * 0.35)
  return 0.04 + 0.09 * wave * (1 - 0.7 * t)
}

export function createBarsVisualizer(): Visualizer {
  let count = 0
  let heights = new Float32Array(0)
  let peaks = new Float32Array(0)

  let edges: Uint16Array = new Uint16Array(0)
  let edgesCount = -1
  let edgesBins = -1
  let edgesRate = -1

  let gradient: CanvasGradient | null = null
  let gradientTheme = ''
  let gradientHeight = -1
  let gradientMirror = false

  /** 0..1, jumps on a beat and decays quickly. */
  let pulse = 0

  /** Spread `old` across `next` slots by position, so a new bar starts near where its neighbor was. */
  const resample = (old: Float32Array, next: number) => {
    const out = new Float32Array(next)
    if (old.length === 0) return out
    for (let i = 0; i < next; i++) out[i] = old[Math.floor((i * old.length) / next)]
    return out
  }

  // Keep the current heights across a count change so bars don't drop to zero and flicker
  const allocate = (next: number) => {
    count = next
    heights = resample(heights, next)
    peaks = resample(peaks, next)
  }

  const getGradient = (
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    height: number,
    mirror: boolean,
  ): CanvasGradient => {
    if (
      !gradient ||
      gradientTheme !== theme.id ||
      gradientHeight !== height ||
      gradientMirror !== mirror
    ) {
      const g = ctx.createLinearGradient(0, 0, 0, height)
      const colors = theme.colors
      const last = Math.max(1, colors.length - 1)
      if (mirror) {
        // Symmetric about the center: high color at both outer edges, low color in the middle
        colors.forEach((color, i) => {
          g.addColorStop(0.5 - (i / last) * 0.5, color)
          g.addColorStop(0.5 + (i / last) * 0.5, color)
        })
      } else {
        colors.forEach((color, i) => g.addColorStop(1 - i / last, color))
      }
      gradient = g
      gradientTheme = theme.id
      gradientHeight = height
      gradientMirror = mirror
    }
    return gradient
  }

  const reset = () => {
    count = 0
    heights = new Float32Array(0)
    peaks = new Float32Array(0)
    edges = new Uint16Array(0)
    edgesCount = edgesBins = edgesRate = -1
    gradient = null
    gradientTheme = ''
    gradientHeight = -1
    pulse = 0
  }

  return {
    id: 'bars',
    label: 'Frequency bars',
    init: reset,
    resize() {
      gradient = null
    },
    dispose: reset,
    draw({ ctx, width, height, dt, time, theme, settings, audio, playing }: DrawArgs) {
      if (width <= 0 || height <= 0) return

      // Each frequency bar is drawn twice, left and right of center, so the layout stays
      // centered: lowest frequencies in the middle, highest at both edges
      const total = effectiveBarCount(settings.barCount, width)
      const wanted = Math.ceil(total / 2)
      if (wanted !== count) allocate(wanted)

      const bins = audio.freq.length
      const rate = audio.sampleRate || 44100
      if (edgesCount !== count || edgesBins !== bins || edgesRate !== rate) {
        edges = computeBarEdges(count, bins, rate)
        edgesCount = count
        edgesBins = bins
        edgesRate = rate
      }

      if (audio.beat) pulse = Math.max(pulse, audio.beatStrength)
      pulse *= Math.exp(-dt * 7)

      const mirror = settings.mirror
      const attack = 1 - Math.exp(-dt * ATTACK)
      const release = 1 - Math.exp(-dt * RELEASE)
      const { barWidth, gap } = barLayout(count * 2, width)
      const slot = barWidth + gap
      const offsetX = gap / 2
      const mid = height / 2
      const baseline = height * BASELINE
      const maxBar = height * (mirror ? MAX_BAR_MIRROR : MAX_BAR)
      const scale = 1 + pulse * 0.12

      ctx.fillStyle = theme.background
      ctx.fillRect(0, 0, width, height)

      ctx.globalAlpha = 0.85 + 0.15 * pulse
      ctx.fillStyle = getGradient(ctx, theme, height, mirror)
      ctx.beginPath()
      if (settings.glow) {
        ctx.shadowColor = theme.accent
        ctx.shadowBlur = 12 + pulse * 18
      }

      for (let i = 0; i < count; i++) {
        // Idle: a slow ripple travelling outward from the center, fading toward the edges
        let target = playing ? 0 : idleLevel(i, count, time)
        if (playing && bins > 0) {
          const compressed = compressLevel(averageBins(audio.freq, edges[i], edges[i + 1]))
          peaks[i] = trackPeak(peaks[i], compressed, dt)
          target = shapeLevel(compressed, peaks[i], i / count, settings.sensitivity)
        }

        heights[i] = lerp(heights[i], target, target > heights[i] ? attack : release)

        const barHeight = Math.min(heights[i] * maxBar * scale, maxBar * 1.1)
        if (barHeight < 1) continue
        const right = offsetX + (count + i) * slot
        const left = offsetX + (count - 1 - i) * slot
        if (mirror) {
          addRoundedRect(ctx, right, mid - barHeight, barWidth, barHeight * 2)
          addRoundedRect(ctx, left, mid - barHeight, barWidth, barHeight * 2)
        } else {
          addRoundedRect(ctx, right, baseline - barHeight, barWidth, barHeight)
          addRoundedRect(ctx, left, baseline - barHeight, barWidth, barHeight)
        }
      }
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    },
  }
}
