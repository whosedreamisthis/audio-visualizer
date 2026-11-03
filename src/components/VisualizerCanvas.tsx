import { useRef } from 'react'
import { useVisualizerLoop } from '@/hooks/useVisualizerLoop'
import { usePlaybackStore } from '@/store/playbackStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import { VISUALIZER_LABELS } from '@/visualizers'

/**
 * The visualizer canvas. It renders once; the animation runs in
 * `useVisualizerLoop`, not through React state. It only re-renders when the
 * mode or play state changes (to keep the accessible label accurate).
 */
export function VisualizerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mode = useVisualizerStore((s) => s.mode)
  const status = usePlaybackStore((s) => s.status)

  useVisualizerLoop(canvasRef)

  const state = status === 'playing' ? 'playing' : 'idle'

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block size-full"
      role="img"
      aria-label={`${VISUALIZER_LABELS[mode]} visualizer, ${state}`}
    />
  )
}
