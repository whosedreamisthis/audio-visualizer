import { describe, expect, it, vi } from 'vitest'
import type { AudioFrame, DrawArgs, VisualizerSettings } from '@/types'
import { DEFAULT_VISUALIZER_SETTINGS } from '@/lib/constants'
import { getVisualizer } from './index'
import { getTheme } from './themes'
import { createWaveformVisualizer } from './waveform'

function fakeContext() {
  const gradient = { addColorStop: vi.fn() }
  const calls: string[] = []
  const track =
    (name: string) =>
    (..._args: unknown[]) => {
      calls.push(name)
    }
  const ctx = {
    calls,
    globalAlpha: 1,
    lineWidth: 1,
    shadowBlur: 0,
    createLinearGradient: vi.fn(() => gradient),
    fillRect: track('fillRect'),
    beginPath: track('beginPath'),
    moveTo: track('moveTo'),
    lineTo: track('lineTo'),
    quadraticCurveTo: track('quadraticCurveTo'),
    stroke: track('stroke'),
  }
  return ctx
}

function frame(wave: Uint8Array): AudioFrame {
  return {
    freq: new Uint8Array(0),
    wave,
    sampleRate: 48000,
    bands: { bass: 0, mid: 0, treble: 0, level: 0 },
    beat: false,
    beatStrength: 0,
  }
}

function drawArgs(
  ctx: ReturnType<typeof fakeContext>,
  overrides: Partial<DrawArgs> & { settings?: Partial<VisualizerSettings> } = {},
): DrawArgs {
  const { settings, ...rest } = overrides
  return {
    ctx: ctx as unknown as CanvasRenderingContext2D,
    width: 800,
    height: 400,
    dt: 1 / 60,
    time: 1,
    playing: true,
    theme: getTheme('neon'),
    settings: { ...DEFAULT_VISUALIZER_SETTINGS, ...settings },
    audio: frame(new Uint8Array(2048).fill(128)),
    ...rest,
  }
}

describe('waveform visualizer', () => {
  it('is the visualizer registered for the waveform mode', () => {
    expect(getVisualizer('waveform').id).toBe('waveform')
    expect(getVisualizer('waveform').label).toBe('Waveform')
  })

  it('draws a stroked curve without throwing', () => {
    const ctx = fakeContext()
    const visualizer = createWaveformVisualizer()
    visualizer.init?.({ width: 800, height: 400 })

    const wave = Uint8Array.from({ length: 2048 }, (_, i) => 128 + Math.round(Math.sin(i / 20) * 100))
    expect(() =>
      visualizer.draw(drawArgs(ctx, { audio: frame(wave) })),
    ).not.toThrow()

    expect(ctx.calls).toContain('fillRect') // trail
    expect(ctx.calls).toContain('quadraticCurveTo')
    expect(ctx.calls).toContain('stroke')
  })

  it('draws the mirrored line only when mirror is on', () => {
    const on = fakeContext()
    createWaveformVisualizer().draw(drawArgs(on, { settings: { mirror: true } }))
    const off = fakeContext()
    createWaveformVisualizer().draw(drawArgs(off, { settings: { mirror: false } }))

    expect(on.calls.filter((c) => c === 'stroke')).toHaveLength(2)
    expect(off.calls.filter((c) => c === 'stroke')).toHaveLength(1)
  })

  it('only applies glow when the setting is on', () => {
    const blurs: number[] = []
    const ctx = fakeContext()
    Object.defineProperty(ctx, 'shadowBlur', {
      get: () => 0,
      set: (v: number) => blurs.push(v),
    })

    createWaveformVisualizer().draw(drawArgs(ctx, { settings: { glow: false } }))
    expect(blurs.every((b) => b === 0)).toBe(true)

    blurs.length = 0
    createWaveformVisualizer().draw(drawArgs(ctx, { settings: { glow: true } }))
    expect(blurs.some((b) => b > 0)).toBe(true)
  })

  it('handles no audio data and a zero-size canvas', () => {
    const ctx = fakeContext()
    const visualizer = createWaveformVisualizer()

    expect(() => visualizer.draw(drawArgs(ctx, { playing: false, audio: frame(new Uint8Array(0)) }))).not.toThrow()
    expect(ctx.calls).toContain('stroke')

    const empty = fakeContext()
    visualizer.draw(drawArgs(empty, { width: 0, height: 0 }))
    expect(empty.calls).toEqual([])
  })

  it('reuses the gradient for the same theme and width', () => {
    const ctx = fakeContext()
    const visualizer = createWaveformVisualizer()
    visualizer.draw(drawArgs(ctx))
    visualizer.draw(drawArgs(ctx))
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(1)

    visualizer.resize?.({ width: 800, height: 400 })
    visualizer.draw(drawArgs(ctx))
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(2)
  })
})
