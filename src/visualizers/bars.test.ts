import { describe, expect, it, vi } from 'vitest'
import type { AudioFrame, ByteBuffer, DrawArgs, VisualizerSettings } from '@/types'
import { DEFAULT_VISUALIZER_SETTINGS } from '@/lib/constants'
import { createBarsVisualizer } from './bars'
import { getVisualizer } from './index'
import { getTheme } from './themes'

function fakeContext() {
  const gradient = { addColorStop: vi.fn() }
  const calls: string[] = []
  const track = (name: string) => () => {
    calls.push(name)
  }
  return {
    calls,
    globalAlpha: 1,
    createLinearGradient: vi.fn(() => gradient),
    fillRect: track('fillRect'),
    beginPath: track('beginPath'),
    moveTo: track('moveTo'),
    arcTo: track('arcTo'),
    closePath: track('closePath'),
    fill: track('fill'),
  }
}

function frame(freq: ByteBuffer): AudioFrame {
  return {
    freq,
    wave: new Uint8Array(0),
    sampleRate: 48000,
    bands: { bass: 0, mid: 0, treble: 0, level: 0 },
    beat: false,
    beatStrength: 0,
  }
}

function drawArgs(
  ctx: ReturnType<typeof fakeContext>,
  overrides: Omit<Partial<DrawArgs>, 'settings'> & {
    settings?: Partial<VisualizerSettings>
  } = {},
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
    audio: frame(new Uint8Array(1024).fill(180)),
    ...rest,
  }
}

describe('bars visualizer', () => {
  it('is registered for the bars mode', () => {
    expect(getVisualizer('bars').id).toBe('bars')
  })

  it('draws rounded bars', () => {
    const ctx = fakeContext()
    createBarsVisualizer().draw(drawArgs(ctx))
    expect(ctx.calls).toContain('arcTo')
    expect(ctx.calls.filter((c) => c === 'fill')).toHaveLength(1)
  })

  it('rebuilds the gradient when mirror is toggled', () => {
    const ctx = fakeContext()
    const visualizer = createBarsVisualizer()
    visualizer.draw(drawArgs(ctx, { settings: { mirror: false } }))
    visualizer.draw(drawArgs(ctx, { settings: { mirror: true } }))
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(2)
  })

  it('draws each bar on both sides of the center, symmetrically', () => {
    const xs: number[] = []
    const ctx = fakeContext()
    ;(ctx as { moveTo: (x: number) => void }).moveTo = (x: number) => {
      xs.push(x)
    }
    createBarsVisualizer().draw(drawArgs(ctx, { settings: { barCount: 64 } }))

    expect(xs).toHaveLength(64)
    // moveTo sits half a bar in from the bar's left edge, i.e. at the bar center, so the
    // outermost bars should mirror each other around the middle of the canvas
    const sorted = [...xs].sort((a, b) => a - b)
    expect(sorted[0] + sorted[sorted.length - 1]).toBeCloseTo(800, 0)
  })

  it('survives changing the bar count live and tiny or empty canvases', () => {
    const visualizer = createBarsVisualizer()
    const ctx = fakeContext()
    for (const barCount of [64, 16, 128, 32]) {
      expect(() => visualizer.draw(drawArgs(ctx, { settings: { barCount } }))).not.toThrow()
    }
    expect(() => visualizer.draw(drawArgs(ctx, { width: 40 }))).not.toThrow()
    expect(() =>
      visualizer.draw(drawArgs(ctx, { playing: false, audio: frame(new Uint8Array(0)) })),
    ).not.toThrow()

    const empty = fakeContext()
    visualizer.draw(drawArgs(empty, { width: 0, height: 0 }))
    expect(empty.calls).toEqual([])
  })

  it('keeps bars standing when the bar count changes', () => {
    const visualizer = createBarsVisualizer()
    for (let i = 0; i < 60; i++) visualizer.draw(drawArgs(fakeContext(), { settings: { barCount: 64 } }))

    const ctx = fakeContext()
    visualizer.draw(drawArgs(ctx, { settings: { barCount: 48 } }))
    // Bars are drawn on the very first frame after the change instead of restarting from zero
    expect(ctx.calls.filter((c) => c === 'moveTo').length).toBeGreaterThanOrEqual(48)
  })

  it('settles to a small idle ripple when paused, without snapping or going blank', () => {
    const visualizer = createBarsVisualizer()
    const ctx = fakeContext()
    visualizer.draw(drawArgs(ctx))

    const first = fakeContext()
    visualizer.draw(drawArgs(first, { playing: false }))
    expect(first.calls.filter((c) => c === 'moveTo').length).toBeGreaterThan(0)

    let last = fakeContext()
    for (let i = 0; i < 600; i++) {
      last = fakeContext()
      visualizer.draw(drawArgs(last, { playing: false }))
    }
    expect(last.calls.filter((c) => c === 'moveTo').length).toBeGreaterThan(0)
  })

  it('brightens on a beat and relaxes afterwards', () => {
    const alphas: number[] = []
    const ctx = fakeContext()
    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => 1,
      set: (v: number) => alphas.push(v),
    })
    const visualizer = createBarsVisualizer()
    const beat = { ...frame(new Uint8Array(1024).fill(180)), beat: true, beatStrength: 1 }

    visualizer.draw(drawArgs(ctx, { audio: beat }))
    const pulsed = alphas[0]
    alphas.length = 0
    for (let i = 0; i < 120; i++) visualizer.draw(drawArgs(ctx))
    const relaxed = alphas[alphas.length - 2]

    expect(pulsed).toBeGreaterThan(relaxed)
    expect(relaxed).toBeCloseTo(0.85, 2)
  })

  it('reuses the gradient until resize or a theme change', () => {
    const ctx = fakeContext()
    const visualizer = createBarsVisualizer()
    visualizer.draw(drawArgs(ctx))
    visualizer.draw(drawArgs(ctx))
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(1)

    visualizer.resize?.({ width: 800, height: 400 })
    visualizer.draw(drawArgs(ctx))
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(2)

    visualizer.draw(drawArgs(ctx, { theme: getTheme('ocean') }))
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(3)
  })
})
