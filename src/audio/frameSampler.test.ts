import { describe, expect, it, vi } from 'vitest'
import { FrameSampler } from './frameSampler'

function fakeEngine(bins: number, fill = 0) {
  return {
    frequencyBinCount: bins,
    timeDomainLength: bins * 2,
    sampleRate: 48000,
    fftSize: bins * 2,
    getFrequencyData: vi.fn((out: Uint8Array) => out.fill(fill)),
    getTimeDomainData: vi.fn((out: Uint8Array) => out.fill(128)),
  }
}

describe('FrameSampler', () => {
  it('sizes buffers to the engine and fills them', () => {
    const sampler = new FrameSampler()
    const engine = fakeEngine(1024, 255)

    const frame = sampler.sample(engine, 1 / 60)

    expect(frame.freq.length).toBe(1024)
    expect(frame.wave.length).toBe(2048)
    expect(frame.freq[10]).toBe(255)
    expect(frame.bands.level).toBeCloseTo(1)
  })

  it('reuses the same frame object and buffers between samples', () => {
    const sampler = new FrameSampler()
    const engine = fakeEngine(512)

    const first = sampler.sample(engine, 1 / 60)
    const freq = first.freq
    const second = sampler.sample(engine, 1 / 60)

    expect(second).toBe(first)
    expect(second.freq).toBe(freq)
  })

  it('reallocates buffers when the FFT size changes', () => {
    const sampler = new FrameSampler()
    const frame = sampler.sample(fakeEngine(512), 1 / 60)
    const oldFreq = frame.freq

    sampler.sample(fakeEngine(2048), 1 / 60)

    expect(frame.freq).not.toBe(oldFreq)
    expect(frame.freq.length).toBe(2048)
  })

  it('returns empty buffers and zero energy before the engine starts', () => {
    const sampler = new FrameSampler()
    const frame = sampler.sample(fakeEngine(0), 1 / 60)

    expect(frame.freq.length).toBe(0)
    expect(frame.bands).toEqual({ bass: 0, mid: 0, treble: 0, level: 0 })
    expect(frame.beat).toBe(false)
  })

  it('reports a beat when bass jumps', () => {
    const sampler = new FrameSampler()
    for (let i = 0; i < 120; i++) sampler.sample(fakeEngine(1024, 40), 1 / 60)

    const frame = sampler.sample(fakeEngine(1024, 250), 1 / 60)

    expect(frame.beat).toBe(true)
    expect(frame.beatStrength).toBeGreaterThan(0)
  })
})
