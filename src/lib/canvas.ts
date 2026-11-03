import type { Size } from '@/types'

/** Cap the device pixel ratio to bound fill cost on very dense screens. */
export const MAX_DPR = 2

export interface BackingSize {
  /** Backing store size in device pixels. */
  pixelWidth: number
  pixelHeight: number
  /** Effective scale (capped DPR). */
  scale: number
}

/** Backing-store dimensions for a canvas displayed at `cssWidth` x `cssHeight`. */
export function computeBackingSize(
  cssWidth: number,
  cssHeight: number,
  dpr: number,
): BackingSize {
  const scale = Number.isFinite(dpr) ? Math.min(Math.max(dpr, 1), MAX_DPR) : 1
  return {
    pixelWidth: Math.max(1, Math.round(cssWidth * scale)),
    pixelHeight: Math.max(1, Math.round(cssHeight * scale)),
    scale,
  }
}

/**
 * Match the canvas backing store to its displayed size and pre-scale the context,
 * so drawing code works in CSS pixels. Returns the CSS size.
 */
export function fitCanvasToDisplay(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): Size {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const { pixelWidth, pixelHeight, scale } = computeBackingSize(
    width,
    height,
    window.devicePixelRatio,
  )

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }
  ctx.setTransform(scale, 0, 0, scale, 0, 0)

  return { width, height }
}
