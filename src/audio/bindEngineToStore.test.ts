import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAudioStore } from '@/store/audioStore'
import { useMicStore } from '@/store/micStore'
import { usePlaybackStore } from '@/store/playbackStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { AudioEngine } from './AudioEngine'
import { bindEngineToStore } from './bindEngineToStore'

function createFakeEngine(initialized: boolean) {
  const handlers = new Set<() => void>()
  const engine = {
    isInitialized: initialized,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setGain: vi.fn(),
    setPlaybackRate: vi.fn(),
    setPreservePitch: vi.fn(),
    setEqBand: vi.fn(),
    setFftSize: vi.fn(),
    setSmoothing: vi.fn(),
    setLoop: vi.fn(),
    setMonitor: vi.fn(),
    on: vi.fn((event: string, handler: () => void) => {
      if (event === 'initialized') handlers.add(handler)
      return () => handlers.delete(handler)
    }),
  }
  return {
    engine,
    asEngine: engine as unknown as AudioEngine,
    fireInitialized: () => {
      engine.isInitialized = true
      for (const handler of handlers) handler()
    },
  }
}

let unbind: (() => void) | undefined

beforeEach(() => {
  useAudioStore.setState(useAudioStore.getInitialState())
  useVisualizerStore.setState(useVisualizerStore.getInitialState())
  usePlaybackStore.setState(usePlaybackStore.getInitialState())
  useMicStore.setState(useMicStore.getInitialState())
})

afterEach(() => {
  unbind?.()
  unbind = undefined
})

describe('bindEngineToStore', () => {
  it('does not touch the engine before it is initialized', () => {
    const { engine, asEngine } = createFakeEngine(false)
    unbind = bindEngineToStore(asEngine)

    useAudioStore.getState().setGain(1.5)

    expect(engine.setGain).not.toHaveBeenCalled()
  })

  it('applies all current store values when the engine initializes', () => {
    const { engine, asEngine, fireInitialized } = createFakeEngine(false)
    unbind = bindEngineToStore(asEngine)
    useAudioStore.getState().setGain(1.5)
    useAudioStore.getState().setSpeed(1.25)
    useAudioStore.getState().setEqBand('low', 4)

    fireInitialized()

    expect(engine.setGain).toHaveBeenCalledWith(1.5)
    expect(engine.setPlaybackRate).toHaveBeenCalledWith(1.25)
    expect(engine.setEqBand).toHaveBeenCalledWith('low', 4)
    expect(engine.setFftSize).toHaveBeenCalledWith(2048)
    expect(engine.setLoop).toHaveBeenCalledWith(false)
  })

  it('applies values immediately when bound to an initialized engine', () => {
    const { engine, asEngine } = createFakeEngine(true)
    useAudioStore.getState().setVolume(0.2)
    unbind = bindEngineToStore(asEngine)

    expect(engine.setVolume).toHaveBeenCalledWith(0.2)
  })

  it('forwards later store changes to the engine', () => {
    const { engine, asEngine } = createFakeEngine(true)
    unbind = bindEngineToStore(asEngine)
    vi.clearAllMocks()

    useAudioStore.getState().setGain(0.5)
    useAudioStore.getState().toggleMute()
    useAudioStore.getState().setPreservePitch(false)
    useVisualizerStore.getState().updateSettings({ fftSize: 1024, smoothing: 0.5 })
    usePlaybackStore.getState().setLoop(true)

    expect(engine.setGain).toHaveBeenCalledWith(0.5)
    expect(engine.setMuted).toHaveBeenCalledWith(true)
    expect(engine.setPreservePitch).toHaveBeenCalledWith(false)
    expect(engine.setFftSize).toHaveBeenCalledWith(1024)
    expect(engine.setSmoothing).toHaveBeenCalledWith(0.5)
    expect(engine.setLoop).toHaveBeenCalledWith(true)
  })

  it('starts with monitoring off and forwards the monitor switch', () => {
    const { engine, asEngine } = createFakeEngine(true)
    unbind = bindEngineToStore(asEngine)
    expect(engine.setMonitor).toHaveBeenCalledWith(false)

    useMicStore.getState().setMonitor(true)
    expect(engine.setMonitor).toHaveBeenLastCalledWith(true)
  })

  it('only updates what changed', () => {
    const { engine, asEngine } = createFakeEngine(true)
    unbind = bindEngineToStore(asEngine)
    vi.clearAllMocks()

    useAudioStore.getState().setGain(1.2)

    expect(engine.setGain).toHaveBeenCalledTimes(1)
    expect(engine.setVolume).not.toHaveBeenCalled()
    expect(engine.setEqBand).not.toHaveBeenCalled()
  })

  it('sends flat EQ while bypassed and restores bands afterwards', () => {
    const { engine, asEngine } = createFakeEngine(true)
    useAudioStore.getState().setEqBand('low', 6)
    unbind = bindEngineToStore(asEngine)
    vi.clearAllMocks()

    useAudioStore.getState().setEqBypass(true)
    expect(engine.setEqBand).toHaveBeenCalledWith('low', 0)

    vi.clearAllMocks()
    useAudioStore.getState().setEqBypass(false)
    expect(engine.setEqBand).toHaveBeenCalledWith('low', 6)
  })

  it('stops forwarding after unbinding', () => {
    const { engine, asEngine } = createFakeEngine(true)
    const stop = bindEngineToStore(asEngine)
    stop()
    vi.clearAllMocks()

    useAudioStore.getState().setGain(1.9)

    expect(engine.setGain).not.toHaveBeenCalled()
  })
})
