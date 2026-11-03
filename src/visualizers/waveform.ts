import { lerp } from '@/lib/math'
import type { DrawArgs, Theme, Visualizer } from '@/types'
import {
  fillWaveformPoints,
  peakAmplitude,
  trackWavePeak,
  waveformGain,
  waveformPointCount,
} from './waveformMath'

/** Fraction of the canvas height the line can swing above and below center at sensitivity 1. */
const AMPLITUDE = 0.32
/** Trail fade per frame: low while playing (long trail), higher when idle (quick settle). */
const TRAIL_PLAYING = 0.2
const TRAIL_IDLE_EXTRA = 0.4
/** Distance kept free at the top and bottom edges, in px. */
const EDGE_PAD = 4

function pointY(ys: Float32Array, i: number, mid: number, mirror: boolean): number {
  return mirror ? 2 * mid - ys[i] : ys[i]
}

/** Trace a smooth curve through the points using quadratic segments between midpoints. */
function tracePath(
  ctx: CanvasRenderingContext2D,
  ys: Float32Array,
  width: number,
  mid: number,
  mirror: boolean,
): void {
  const last = ys.length - 1
  const stepX = width / last

  ctx.beginPath()
  ctx.moveTo(0, pointY(ys, 0, mid, mirror))
  for (let i = 1; i < last; i++) {
    const x = i * stepX
    const y = pointY(ys, i, mid, mirror)
    const nextX = (i + 1) * stepX
    const nextY = pointY(ys, i + 1, mid, mirror)
    ctx.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2)
  }
  ctx.lineTo(width, pointY(ys, last, mid, mirror))
}

/** Oscilloscope-style line with a fading trail, optional mirror and glow, and a beat pulse. */
export function createWaveformVisualizer(): Visualizer {
  let ys = new Float32Array(0)
  let gradient: CanvasGradient | null = null
  let gradientKey = ''
  /** 0..1, eases toward 1 while playing and 0 when idle. */
  let activity = 0
  /** 0..1, jumps on a beat and decays quickly. */
  let pulse = 0
  /** Slowly decaying recent peak of the signal, used to scale quiet audio up. */
  let wavePeak = 0

  const getGradient = (
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    width: number,
  ): CanvasGradient => {
    const key = `${theme.id}:${width}`
    if (!gradient || key !== gradientKey) {
      const g = ctx.createLinearGradient(0, 0, width, 0)
      theme.colors.forEach((color, i) =>
        g.addColorStop(i / Math.max(1, theme.colors.length - 1), color),
      )
      gradient = g
      gradientKey = key
    }
    return gradient
  }

  const reset = () => {
    ys = new Float32Array(0)
    gradient = null
    gradientKey = ''
    activity = 0
    pulse = 0
    wavePeak = 0
  }

  return {
    id: 'waveform',
    label: 'Waveform',
    init: reset,
    resize() {
      gradient = null
      gradientKey = ''
    },
    dispose: reset,
    draw({ ctx, width, height, dt, time, theme, settings, audio, playing }: DrawArgs) {
      if (width <= 0 || height <= 0) return

      activity = lerp(activity, playing ? 1 : 0, 1 - Math.exp(-dt * 4))
      if (audio.beat) pulse = Math.max(pulse, audio.beatStrength)
      pulse *= Math.exp(-dt * 6)

      // Trail: fade the previous frame toward the background instead of clearing it
      ctx.globalAlpha = TRAIL_PLAYING + TRAIL_IDLE_EXTRA * (1 - activity)
      ctx.fillStyle = theme.background
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      const count = waveformPointCount(width)
      if (ys.length !== count) ys = new Float32Array(count)

      const mid = height / 2
      wavePeak = trackWavePeak(wavePeak, playing ? peakAmplitude(audio.wave) : 0, dt)
      const gain = playing ? waveformGain(wavePeak) : 1
      fillWaveformPoints(ys, audio.wave, mid, height * AMPLITUDE * settings.sensitivity * gain)

      // Idle breathing fades out as playback starts; also keep the line inside the canvas
      const idleAmp = height * 0.08 * (1 - activity)
      const phase = time * 1.6
      const phase2 = time * 0.7
      const minY = EDGE_PAD
      const maxY = height - EDGE_PAD
      for (let i = 0; i < count; i++) {
        let y = ys[i]
        if (idleAmp > 0.01) {
          // Two travelling sines of different speed and length, softened toward the edges
          const t = i / count
          const envelope = Math.sin(t * Math.PI)
          const ripple =
            Math.sin(t * Math.PI * 4 - phase) * 0.65 + Math.sin(t * Math.PI * 7 + phase2) * 0.35
          y += ripple * envelope * idleAmp
        }
        ys[i] = y < minY ? minY : y > maxY ? maxY : y
      }

      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.lineWidth = settings.lineWidth * (1 + pulse * 0.8)
      ctx.strokeStyle = getGradient(ctx, theme, width)
      if (settings.glow) {
        ctx.shadowColor = theme.accent
        ctx.shadowBlur = 10 + pulse * 18
      }

      tracePath(ctx, ys, width, mid, false)
      ctx.stroke()

      if (settings.mirror) {
        ctx.globalAlpha = 0.35
        tracePath(ctx, ys, width, mid, true)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      ctx.shadowBlur = 0
    },
  }
}
