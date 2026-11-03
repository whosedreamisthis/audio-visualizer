import { describe, expect, it } from 'vitest'
import { BeatDetector } from './beatDetector'

const DT = 1 / 60

function run(detector: BeatDetector, bass: number, frames: number): number {
  let beats = 0
  for (let i = 0; i < frames; i++) {
    if (detector.update(bass, DT).beat) beats++
  }
  return beats
}

describe('BeatDetector', () => {
  it('reports no beats for silence', () => {
    expect(run(new BeatDetector(), 0, 300)).toBe(0)
  })

  it('ignores very quiet noise below the minimum level', () => {
    const detector = new BeatDetector()
    run(detector, 0.01, 60)
    expect(run(detector, 0.1, 10)).toBe(0)
  })

  it('reports no beats for a steady tone once the average settles', () => {
    const detector = new BeatDetector()
    run(detector, 0.5, 120) // let the average catch up (any early beat is fine)
    expect(run(detector, 0.5, 300)).toBe(0)
  })

  it('detects a sudden bass spike and reports its strength', () => {
    const detector = new BeatDetector()
    run(detector, 0.3, 120)
    const result = detector.update(0.95, DT)
    expect(result.beat).toBe(true)
    expect(result.strength).toBeGreaterThan(0)
    expect(result.strength).toBeLessThanOrEqual(1)
  })

  it('respects the cooldown between beats', () => {
    const detector = new BeatDetector({ cooldownSeconds: 0.25 })
    run(detector, 0.2, 120)

    // Spike held for 0.2 s (12 frames) is shorter than the cooldown: one beat only
    expect(run(detector, 0.95, 12)).toBe(1)
  })

  it('can beat again after the cooldown', () => {
    const detector = new BeatDetector({ cooldownSeconds: 0.1 })
    run(detector, 0.2, 120)
    let beats = 0
    for (let i = 0; i < 4; i++) {
      beats += run(detector, 0.95, 1) // spike
      beats += run(detector, 0.2, 12) // 0.2 s of quiet, longer than the cooldown
    }
    expect(beats).toBe(4)
  })

  it('never exceeds 3 beats per second by default', () => {
    const detector = new BeatDetector()
    run(detector, 0.2, 120)
    let beats = 0
    for (let i = 0; i < 60; i++) {
      beats += run(detector, i % 2 ? 0.2 : 0.95, 1) // spike every other frame for 1 s
    }
    expect(beats).toBeLessThanOrEqual(3)
  })

  it('reset clears the average and cooldown', () => {
    const detector = new BeatDetector()
    run(detector, 0.9, 200)
    detector.reset()
    expect(detector.update(0.9, DT).beat).toBe(true)
  })

  it('reports zero strength when there is no beat', () => {
    const result = new BeatDetector().update(0, DT)
    expect(result).toEqual({ beat: false, strength: 0 })
  })
})
