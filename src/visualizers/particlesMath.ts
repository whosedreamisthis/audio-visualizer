/** Hue marker for sparkle particles, which are drawn bright instead of from the theme. */
export const SPARKLE_HUE = -1

/** Struct-of-arrays particle pool; a slot is free when its `life` is 0 or less. */
export interface ParticlePool {
  capacity: number
  x: Float32Array
  y: Float32Array
  vx: Float32Array
  vy: Float32Array
  /** Remaining life in seconds. */
  life: Float32Array
  /** Total life in seconds, so `life / maxLife` gives the fade. */
  maxLife: Float32Array
  size: Float32Array
  /** 0..1 offset into the theme colors, or SPARKLE_HUE. */
  hue: Float32Array
  /** Where the next free-slot search starts, so spawning stays cheap. */
  cursor: number
}

export function createPool(capacity: number): ParticlePool {
  const n = Math.max(0, Math.floor(capacity))
  return {
    capacity: n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    life: new Float32Array(n),
    maxLife: new Float32Array(n),
    size: new Float32Array(n),
    hue: new Float32Array(n),
    cursor: 0,
  }
}

/** Number of live particles. */
export function aliveCount(pool: ParticlePool): number {
  let n = 0
  for (let i = 0; i < pool.capacity; i++) if (pool.life[i] > 0) n++
  return n
}

/**
 * Claim up to `count` free slots, calling `init(index)` to fill each. Live particles are never
 * touched and the pool never grows; returns how many were actually spawned.
 */
export function spawn(pool: ParticlePool, count: number, init: (i: number) => void): number {
  const { capacity, life } = pool
  if (capacity === 0 || count <= 0) return 0
  let spawned = 0
  let i = pool.cursor % capacity
  for (let scanned = 0; scanned < capacity && spawned < count; scanned++) {
    if (life[i] <= 0) {
      init(i)
      spawned++
    }
    i = i + 1 === capacity ? 0 : i + 1
  }
  pool.cursor = i
  return spawned
}

/** Advance live particles: drag, a slight swirl around (cx, cy), and aging. Dead slots are freed. */
export function stepPool(
  pool: ParticlePool,
  dt: number,
  cx: number,
  cy: number,
  drag: number,
  swirl: number,
): void {
  const { x, y, vx, vy, life, capacity } = pool
  const damp = Math.exp(-drag * dt)
  for (let i = 0; i < capacity; i++) {
    if (life[i] <= 0) continue
    life[i] -= dt
    if (life[i] <= 0) {
      life[i] = 0
      continue
    }
    // Tangential push around the center bends bursts into gentle spirals
    const dx = x[i] - cx
    const dy = y[i] - cy
    vx[i] = (vx[i] - dy * swirl * dt) * damp
    vy[i] = (vy[i] + dx * swirl * dt) * damp
    x[i] += vx[i] * dt
    y[i] += vy[i] * dt
  }
}
