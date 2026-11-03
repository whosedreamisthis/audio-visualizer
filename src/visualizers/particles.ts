import { clamp, lerp } from '@/lib/math'
import { PARTICLE_COUNT } from '@/lib/constants'
import type { DrawArgs, Visualizer } from '@/types'
import { createPool, spawn, SPARKLE_HUE, stepPool, type ParticlePool } from './particlesMath'

/** Pool cap when the user prefers reduced motion. */
const REDUCED_MOTION_CAP = 300
/** Trail fade per frame while playing / idle. */
const TRAIL_PLAYING = 0.35
const TRAIL_IDLE = 0.5
/** Velocity damping per second, and swirl strength (rad/s-ish) around the center. */
const DRAG = 0.9
const SWIRL = 0.35
/** Burst speed in px/s: base plus bass-scaled extra. */
const BURST_SPEED = 110
const BURST_SPEED_BASS = 380
const IDLE_RATE = 14

function prefersReducedMotion(): boolean {
  try {
    return (
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  } catch {
    return false
  }
}

const SPRITE_SIZE = 48

/** Soft round sprite in `color`: solid core fading to transparent at the edge. */
function makeSprite(color: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = SPRITE_SIZE
  const g = c.getContext('2d')
  if (!g) return c
  const r = SPRITE_SIZE / 2
  g.fillStyle = color
  g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  // Shape the alpha with a radial mask instead of parsing the color
  const mask = g.createRadialGradient(r, r, 0, r, r, r)
  mask.addColorStop(0, 'rgba(0,0,0,1)')
  mask.addColorStop(0.3, 'rgba(0,0,0,0.75)')
  mask.addColorStop(1, 'rgba(0,0,0,0)')
  g.globalCompositeOperation = 'destination-in'
  g.fillStyle = mask
  g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  return c
}

let spriteKey = ''
let spriteSet: HTMLCanvasElement[] = []

/** One sprite per theme color plus a white one for sparkles (last), cached per theme. */
function getSprites(themeId: string, colors: string[]): HTMLCanvasElement[] {
  if (themeId !== spriteKey || spriteSet.length !== colors.length + 1) {
    spriteSet = [...colors, '#ffffff'].map(makeSprite)
    spriteKey = themeId
  }
  return spriteSet
}

/** Particle system: bass spawns radial bursts, mids shift color, treble adds sparkle. */
export function createParticlesVisualizer(): Visualizer {
  let pool: ParticlePool = createPool(0)
  let reduced = false
  let activity = 0
  let pulse = 0
  /** Fractional particles owed to the idle / sparkle emitters between frames. */
  let idleDebt = 0
  let sparkleDebt = 0
  let streamDebt = 0
  /** Smoothed mid energy used to slide color along the theme. */
  let midShift = 0
  let hueDrift = 0

  const desiredCapacity = (requested: number) => {
    const count = Number.isFinite(requested)
      ? clamp(Math.round(requested), PARTICLE_COUNT.min, PARTICLE_COUNT.max)
      : PARTICLE_COUNT.min
    return reduced ? Math.min(count, REDUCED_MOTION_CAP) : count
  }

  const ensurePool = (requested: number) => {
    const next = desiredCapacity(requested)
    if (next !== pool.capacity) pool = createPool(next)
  }

  const reset = () => {
    pool = createPool(0)
    activity = pulse = idleDebt = sparkleDebt = streamDebt = midShift = hueDrift = 0
  }

  return {
    id: 'particles',
    label: 'Particle spectrum',
    init() {
      reset()
      reduced = prefersReducedMotion()
    },
    resize() {
      reduced = prefersReducedMotion()
    },
    dispose: reset,
    draw({ ctx, width, height, dt, theme, settings, audio, playing }: DrawArgs) {
      if (width <= 0 || height <= 0) return
      ensurePool(settings.particleCount)

      const cx = width / 2
      const cy = height / 2
      const scale = Math.min(width, height) / 720
      const { bass, mid, treble } = audio.bands
      const colors = theme.colors
      const n = colors.length

      activity = lerp(activity, playing ? 1 : 0, 1 - Math.exp(-dt * 4))
      midShift = lerp(midShift, playing ? mid : 0, 1 - Math.exp(-dt * 5))
      hueDrift = (hueDrift + dt * 0.03) % 1
      if (audio.beat) pulse = Math.max(pulse, audio.beatStrength)
      pulse *= Math.exp(-dt * 6)

      // Trail: fade the previous frame toward the background
      ctx.globalAlpha = lerp(TRAIL_IDLE, TRAIL_PLAYING, activity)
      ctx.fillStyle = theme.background
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // Beat: a radial burst whose size and speed scale with bass
      if (playing && audio.beat) {
        const strength = clamp(audio.beatStrength, 0, 1.5)
        const burst = Math.round(pool.capacity * 0.04 * (0.6 + bass + strength * 0.5))
        const speed = (BURST_SPEED + BURST_SPEED_BASS * bass) * scale
        const ring = (12 + 40 * bass) * scale
        spawn(pool, burst, (i) => {
          const angle = Math.random() * Math.PI * 2
          const s = speed * (0.55 + Math.random() * 0.75)
          pool.x[i] = cx + Math.cos(angle) * ring
          pool.y[i] = cy + Math.sin(angle) * ring
          pool.vx[i] = Math.cos(angle) * s
          pool.vy[i] = Math.sin(angle) * s
          pool.maxLife[i] = pool.life[i] = 1.2 + Math.random() * 1.6
          pool.size[i] = (1.6 + Math.random() * 2.2) * Math.max(0.6, scale)
          pool.hue[i] = Math.random()
        })
      }

      // Steady stream while playing, scaled by overall level, so the field stays alive between beats
      if (playing) {
        const level = clamp(audio.bands.level, 0, 1)
        streamDebt += pool.capacity * (0.08 + 0.4 * level) * dt
        const stream = Math.floor(streamDebt)
        if (stream > 0) {
          streamDebt -= stream
          const speed = (40 + 180 * Math.max(bass, level)) * scale
          spawn(pool, stream, (i) => {
            const angle = Math.random() * Math.PI * 2
            const r = (10 + Math.random() * 60) * scale
            const s = speed * (0.4 + Math.random() * 0.8)
            pool.x[i] = cx + Math.cos(angle) * r
            pool.y[i] = cy + Math.sin(angle) * r
            pool.vx[i] = Math.cos(angle) * s
            pool.vy[i] = Math.sin(angle) * s
            pool.maxLife[i] = pool.life[i] = 1.5 + Math.random() * 2
            pool.size[i] = (1.2 + Math.random() * 1.8) * Math.max(0.6, scale)
            pool.hue[i] = Math.random()
          })
        }
      } else {
        streamDebt = 0
      }

      // Treble: small bright sparkles scattered around the burst area
      if (playing) {
        sparkleDebt += treble * treble * 90 * dt * (pool.capacity / 800)
        const sparkles = Math.floor(sparkleDebt)
        if (sparkles > 0) {
          sparkleDebt -= sparkles
          spawn(pool, sparkles, (i) => {
            const angle = Math.random() * Math.PI * 2
            const r = (30 + Math.random() * 0.45 * Math.min(width, height)) * 1
            pool.x[i] = cx + Math.cos(angle) * r
            pool.y[i] = cy + Math.sin(angle) * r
            pool.vx[i] = Math.cos(angle) * 30 * scale
            pool.vy[i] = Math.sin(angle) * 30 * scale
            pool.maxLife[i] = pool.life[i] = 0.35 + Math.random() * 0.5
            pool.size[i] = 1 + Math.random() * 1.2
            pool.hue[i] = SPARKLE_HUE
          })
        }
      } else {
        sparkleDebt = 0
      }

      // Idle: a few slow particles drifting out from the center
      idleDebt += (1 - activity) * IDLE_RATE * dt
      const idle = Math.floor(idleDebt)
      if (idle > 0) {
        idleDebt -= idle
        spawn(pool, idle, (i) => {
          const angle = Math.random() * Math.PI * 2
          const r = Math.random() * 0.25 * Math.min(width, height)
          const s = (10 + Math.random() * 20) * scale
          pool.x[i] = cx + Math.cos(angle) * r
          pool.y[i] = cy + Math.sin(angle) * r
          pool.vx[i] = Math.cos(angle + 1.2) * s
          pool.vy[i] = Math.sin(angle + 1.2) * s
          pool.maxLife[i] = pool.life[i] = 4 + Math.random() * 4
          pool.size[i] = 1.2 + Math.random() * 1.5
          pool.hue[i] = Math.random()
        })
      }

      stepPool(pool, dt, cx, cy, DRAG, SWIRL)

      // Respawn instead of growing: anything that wanders far off canvas is retired
      const margin = 80
      const { x, y, life, maxLife, size, hue, capacity } = pool
      for (let i = 0; i < capacity; i++) {
        if (
          life[i] > 0 &&
          (x[i] < -margin || x[i] > width + margin || y[i] < -margin || y[i] > height + margin)
        ) {
          life[i] = 0
        }
      }

      const additive = settings.glow && !reduced
      ctx.globalCompositeOperation = additive ? 'lighter' : 'source-over'
      const shift = midShift * 0.9 + hueDrift

      const sprites = getSprites(theme.id, colors)

      for (let b = 0; b <= n; b++) {
        const sparkle = b === n
        const sprite = sprites[b]
        for (let i = 0; i < capacity; i++) {
          const l = life[i]
          if (l <= 0) continue
          const h = hue[i]
          if (
            sparkle
              ? h !== SPARKLE_HUE
              : h === SPARKLE_HUE || Math.floor(((h + shift) % 1) * n) !== b
          ) {
            continue
          }
          const fade = l / maxLife[i]
          ctx.globalAlpha = sparkle ? Math.min(1, fade * 1.6) : Math.min(1, fade * 1.4) * 0.85
          // Soft orbs shrink as they die; the sprite is a blurred disc so it reads as glow
          const d = size[i] * (sparkle ? 4 : 5) * (0.5 + 0.5 * fade) * (1 + pulse * 0.3)
          ctx.drawImage(sprite, x[i] - d / 2, y[i] - d / 2, d, d)
        }
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}
