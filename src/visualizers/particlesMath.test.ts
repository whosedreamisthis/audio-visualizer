import { describe, expect, it } from 'vitest'
import { aliveCount, createPool, spawn, stepPool } from './particlesMath'

const alive = (pool: ReturnType<typeof createPool>) => (i: number) => {
  pool.life[i] = 1
}

describe('particle pool', () => {
  it('fills free slots only and reports how many were spawned', () => {
    const pool = createPool(5)
    expect(spawn(pool, 3, alive(pool))).toBe(3)
    expect(aliveCount(pool)).toBe(3)
    expect(spawn(pool, 1, alive(pool))).toBe(1)
    expect(aliveCount(pool)).toBe(4)
  })

  it('never exceeds capacity and never overwrites live particles', () => {
    const pool = createPool(4)
    pool.life[1] = 5
    pool.x[1] = 42
    const spawned = spawn(pool, 100, (i) => {
      pool.life[i] = 1
      pool.x[i] = 0
    })
    expect(spawned).toBe(3)
    expect(aliveCount(pool)).toBe(4)
    expect(pool.x[1]).toBe(42)
    expect(spawn(pool, 10, alive(pool))).toBe(0)
  })

  it('recycles dead particles', () => {
    const pool = createPool(3)
    spawn(pool, 3, alive(pool))
    stepPool(pool, 2, 0, 0, 0, 0)
    expect(aliveCount(pool)).toBe(0)
    expect(spawn(pool, 3, alive(pool))).toBe(3)
  })

  it('handles empty pools and non-positive counts', () => {
    expect(spawn(createPool(0), 5, () => {})).toBe(0)
    expect(spawn(createPool(3), 0, () => {})).toBe(0)
  })

  it('moves live particles by velocity scaled with dt', () => {
    const pool = createPool(1)
    spawn(pool, 1, (i) => {
      pool.life[i] = 1
      pool.vx[i] = 10
    })
    stepPool(pool, 0.5, 0, 0, 0, 0)
    expect(pool.x[0]).toBeCloseTo(5)
  })
})
