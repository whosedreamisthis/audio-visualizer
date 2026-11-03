import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AudioFrame, DrawArgs, VisualizerSettings } from '@/types'
import { DEFAULT_VISUALIZER_SETTINGS } from '@/lib/constants'
import { createParticlesVisualizer } from './particles'
import { getVisualizer } from './index'
import { getTheme } from './themes'

function fakeContext() {
  const ops: string[] = []
  return {
    ops,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    fillRect: () => {
      ops.push('fillRect')
    },
    drawImage: () => {
      ops.push('drawImage')
    },
  }
}

function frame(overrides: Partial<AudioFrame> = {}): AudioFrame {
  return {
    freq: new Uint8Array(1024).fill(180),
    wave: new Uint8Array(0),
    sampleRate: 48000,
    bands: { bass: 0.8, mid: 0.5, treble: 0.4, level: 0.6 },
    beat: false,
    beatStrength: 0,
    ...overrides,
  }
}

function drawArgs(
  ctx: ReturnType<typeof fakeContext>,
  overrides: Omit<Partial<DrawArgs>, 'settings'> & { settings?: Partial<VisualizerSettings> } = {},
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
    audio: frame(),
    ...rest,
  }
}

const count = (ctx: ReturnType<typeof fakeContext>) =>
  ctx.ops.filter((o) => o === 'drawImage').length

beforeEach(() => {
  // Sprites are built from offscreen canvases, which the node test environment lacks
  const g = {
    fillRect: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    fillStyle: '',
    globalCompositeOperation: '',
  }
  vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => g }) })
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('particles visualizer', () => {
  it('is registered for the particles mode', () => {
    expect(getVisualizer('particles').id).toBe('particles')
  })

  it('draws nothing on an empty canvas', () => {
    const ctx = fakeContext()
    createParticlesVisualizer().draw(drawArgs(ctx, { width: 0, height: 0 }))
    expect(ctx.ops).toEqual([])
  })

  it('stays quiet at first, then a beat bursts out particles', () => {
    const visualizer = createParticlesVisualizer()
    const quiet = fakeContext()
    visualizer.draw(drawArgs(quiet, { playing: false }))
    const before = count(quiet)

    const burst = fakeContext()
    visualizer.draw(drawArgs(burst, { audio: frame({ beat: true, beatStrength: 1 }) }))
    expect(count(burst)).toBeGreaterThan(before + 10)
  })

  it('keeps emitting between beats while playing', () => {
    const visualizer = createParticlesVisualizer()
    let last = fakeContext()
    // Far longer than any particle lives, with no beats at all
    for (let i = 0; i < 600; i++) {
      last = fakeContext()
      visualizer.draw(drawArgs(last))
    }
    expect(count(last)).toBeGreaterThan(50)
  })

  it('calms down when playback stops but keeps a few drifting particles', () => {
    const visualizer = createParticlesVisualizer()
    for (let i = 0; i < 300; i++) visualizer.draw(drawArgs(fakeContext()))
    const busy = fakeContext()
    visualizer.draw(drawArgs(busy))

    let idle = fakeContext()
    for (let i = 0; i < 900; i++) {
      idle = fakeContext()
      visualizer.draw(
        drawArgs(idle, {
          playing: false,
          audio: frame({ bands: { bass: 0, mid: 0, treble: 0, level: 0 } }),
        }),
      )
    }
    expect(count(idle)).toBeGreaterThan(0)
    expect(count(idle)).toBeLessThan(count(busy) / 4)
  })

  it('never draws more particles than the pool holds, and follows count changes', () => {
    const visualizer = createParticlesVisualizer()
    const beat = frame({ beat: true, beatStrength: 1.5 })
    let ctx = fakeContext()
    for (let i = 0; i < 200; i++) {
      ctx = fakeContext()
      visualizer.draw(drawArgs(ctx, { audio: beat, settings: { particleCount: 100 } }))
    }
    expect(count(ctx)).toBeLessThanOrEqual(100)

    for (let i = 0; i < 200; i++) {
      ctx = fakeContext()
      visualizer.draw(drawArgs(ctx, { audio: beat, settings: { particleCount: 3000 } }))
    }
    expect(count(ctx)).toBeGreaterThan(100)
    expect(count(ctx)).toBeLessThanOrEqual(3000)
  })

  it('uses additive blending only when glow is on, restoring normal blending after', () => {
    const modes: string[] = []
    const ctx = fakeContext()
    Object.defineProperty(ctx, 'globalCompositeOperation', {
      get: () => 'source-over',
      set: (v: string) => modes.push(v),
    })
    const visualizer = createParticlesVisualizer()
    visualizer.draw(drawArgs(ctx, { settings: { glow: true } }))
    expect(modes).toContain('lighter')
    expect(modes[modes.length - 1]).toBe('source-over')

    modes.length = 0
    visualizer.draw(drawArgs(ctx, { settings: { glow: false } }))
    expect(modes).not.toContain('lighter')
  })

  it('caps particles and drops additive blending with reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const modes: string[] = []
    const ctx = fakeContext()
    Object.defineProperty(ctx, 'globalCompositeOperation', {
      get: () => 'source-over',
      set: (v: string) => modes.push(v),
    })
    const visualizer = createParticlesVisualizer()
    visualizer.init?.({ width: 800, height: 400 })
    const beat = frame({ beat: true, beatStrength: 1.5 })
    let last = fakeContext()
    for (let i = 0; i < 200; i++) {
      last = fakeContext()
      visualizer.draw(
        drawArgs(last, { audio: beat, settings: { particleCount: 3000, glow: true } }),
      )
    }
    visualizer.draw(drawArgs(ctx, { settings: { glow: true } }))

    expect(count(last)).toBeLessThanOrEqual(300)
    expect(modes).not.toContain('lighter')
  })

  it('survives dispose, re-init and unusual settings', () => {
    const visualizer = createParticlesVisualizer()
    visualizer.draw(drawArgs(fakeContext()))
    visualizer.dispose?.()
    visualizer.init?.({ width: 800, height: 400 })
    expect(() =>
      visualizer.draw(drawArgs(fakeContext(), { settings: { particleCount: Number.NaN } })),
    ).not.toThrow()
  })
})
