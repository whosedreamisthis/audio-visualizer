import { shallow } from 'zustand/shallow'
import { EQ_BANDS, EQ_FLAT } from '@/lib/constants'
import { useAudioStore, type AudioState } from '@/store/audioStore'
import { useMicStore } from '@/store/micStore'
import { usePlaybackStore } from '@/store/playbackStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { AudioEngine } from './AudioEngine'

/** EQ gains the engine should use: flat while bypassed. */
const selectEffectiveEq = (s: AudioState) => (s.eqBypass ? EQ_FLAT : s.eq)

/**
 * Apply store values to the engine and keep them in sync.
 * Changes made before the engine exists are applied when it fires `initialized`.
 * Returns an unsubscribe function.
 */
export function bindEngineToStore(engine: AudioEngine): () => void {
  const whenReady = (apply: () => void) => {
    if (engine.isInitialized) apply()
  }

  const applyEq = (eq: Record<string, number>) => {
    for (const band of EQ_BANDS) engine.setEqBand(band.id, eq[band.id])
  }

  const applyAll = () => {
    const audio = useAudioStore.getState()
    const { settings } = useVisualizerStore.getState()
    engine.setVolume(audio.volume)
    engine.setMuted(audio.muted)
    engine.setGain(audio.gain)
    engine.setPlaybackRate(audio.speed)
    engine.setPreservePitch(audio.preservePitch)
    applyEq(selectEffectiveEq(audio))
    engine.setFftSize(settings.fftSize)
    engine.setSmoothing(settings.smoothing)
    engine.setLoop(usePlaybackStore.getState().loop)
    engine.setMonitor(useMicStore.getState().monitor)
  }

  const unsubscribers = [
    engine.on('initialized', applyAll),
    useAudioStore.subscribe(
      (s) => s.volume,
      (v) => whenReady(() => engine.setVolume(v)),
    ),
    useAudioStore.subscribe(
      (s) => s.muted,
      (m) => whenReady(() => engine.setMuted(m)),
    ),
    useAudioStore.subscribe(
      (s) => s.gain,
      (g) => whenReady(() => engine.setGain(g)),
    ),
    useAudioStore.subscribe(
      (s) => s.speed,
      (r) => whenReady(() => engine.setPlaybackRate(r)),
    ),
    useAudioStore.subscribe(
      (s) => s.preservePitch,
      (p) => whenReady(() => engine.setPreservePitch(p)),
    ),
    useAudioStore.subscribe(selectEffectiveEq, (eq) => whenReady(() => applyEq(eq)), {
      equalityFn: shallow,
    }),
    useVisualizerStore.subscribe(
      (s) => s.settings.fftSize,
      (size) => whenReady(() => engine.setFftSize(size)),
    ),
    useVisualizerStore.subscribe(
      (s) => s.settings.smoothing,
      (v) => whenReady(() => engine.setSmoothing(v)),
    ),
    usePlaybackStore.subscribe(
      (s) => s.loop,
      (loop) => whenReady(() => engine.setLoop(loop)),
    ),
    useMicStore.subscribe(
      (s) => s.monitor,
      (monitor) => whenReady(() => engine.setMonitor(monitor)),
    ),
  ]

  if (engine.isInitialized) applyAll()

  return () => {
    for (const unsubscribe of unsubscribers) unsubscribe()
  }
}
