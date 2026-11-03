import { describe, expect, it } from 'vitest'
import { DEFAULT_VISUALIZER_SETTINGS, PARTICLE_COUNT } from '@/lib/constants'
import { FrameBudgetMonitor, reduceQuality, WINDOW_MS } from './frameBudget'

function run(monitor: FrameBudgetMonitor, frameMs: number, totalMs: number) {
  let fired = false
  for (let t = 0; t < totalMs; t += frameMs) {
    if (monitor.push(frameMs)) fired = true
  }
  return fired
}

describe('FrameBudgetMonitor', () => {
  it('stays quiet at 60 fps', () => {
    expect(run(new FrameBudgetMonitor(), 16.7, WINDOW_MS * 3)).toBe(false)
  })

  it('fires when the window averages over 20 ms', () => {
    expect(run(new FrameBudgetMonitor(), 33, WINDOW_MS + 100)).toBe(true)
  })

  it('does not fire before a full window has passed', () => {
    expect(run(new FrameBudgetMonitor(), 33, WINDOW_MS - 100)).toBe(false)
  })

  it('ignores a single long frame among fast ones', () => {
    const monitor = new FrameBudgetMonitor()
    monitor.push(120)
    expect(run(monitor, 16.7, WINDOW_MS)).toBe(false)
  })

  it('starts a fresh window after reset', () => {
    const monitor = new FrameBudgetMonitor()
    run(monitor, 33, WINDOW_MS - 100)
    monitor.reset()
    expect(run(monitor, 33, WINDOW_MS - 100)).toBe(false)
  })
})

describe('reduceQuality', () => {
  it('turns glow off and cuts particles, within the allowed range', () => {
    const reduced = reduceQuality({
      ...DEFAULT_VISUALIZER_SETTINGS,
      glow: true,
      particleCount: 2000,
    })
    expect(reduced.glow).toBe(false)
    expect(reduced.particleCount).toBe(800)
  })

  it('never goes below the minimum particle count', () => {
    const reduced = reduceQuality({
      ...DEFAULT_VISUALIZER_SETTINGS,
      particleCount: PARTICLE_COUNT.min,
    })
    expect(reduced.particleCount).toBe(PARTICLE_COUNT.min)
  })
})
