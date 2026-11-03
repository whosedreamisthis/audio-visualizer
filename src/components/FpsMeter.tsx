import { useEffect, useRef } from 'react'

/** Dev-only frame-rate readout (enable with `?fps`). Updates the DOM directly, never React state. */
export function FpsMeter() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let frames = 0
    let windowStart = performance.now()

    const tick = (now: number) => {
      frames += 1
      const elapsed = now - windowStart
      if (elapsed >= 500) {
        const fps = Math.round((frames * 1000) / elapsed)
        const frameMs = (elapsed / frames).toFixed(1)
        if (ref.current) ref.current.textContent = `${fps} fps · ${frameMs} ms`
        frames = 0
        windowStart = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute top-2 left-2 z-20 rounded bg-black/70 px-2 py-1 font-mono text-xs text-white"
      aria-hidden
    >
      – fps
    </div>
  )
}
