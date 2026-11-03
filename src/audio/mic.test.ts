import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { useMicStore } from '@/store/micStore'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'
import type { TrackMeta } from '@/types'
import { AudioEngineError } from './AudioEngine'
import { startMicrophone, stopMicrophone } from './mic'

const engine = vi.hoisted(() => ({ useMicrophone: vi.fn(), stopMicrophone: vi.fn() }))

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn() } }))
vi.mock('./engine', () => ({ getAudioEngine: () => engine }))

const micTrack: TrackMeta = {
  id: 'track-1',
  name: 'Microphone',
  artist: 'Live input',
  source: 'mic',
  duration: 0,
}
const fileTrack: TrackMeta = { id: 'track-2', name: 'Song', source: 'file', duration: 90 }

beforeEach(() => {
  vi.clearAllMocks()
  usePlaybackStore.setState(usePlaybackStore.getInitialState())
  useMicStore.setState(useMicStore.getInitialState())
  useUiStore.setState(useUiStore.getInitialState())
})

describe('startMicrophone', () => {
  it('loads the live track as playing and records that access was granted', async () => {
    engine.useMicrophone.mockResolvedValueOnce(micTrack)
    useUiStore.getState().setSourcePickerOpen(true)

    await startMicrophone()

    const playback = usePlaybackStore.getState()
    expect(playback.track).toEqual(micTrack)
    expect(playback.status).toBe('playing')
    expect(useMicStore.getState().status).toBe('granted')
    expect(useUiStore.getState().sourcePickerOpen).toBe(false)
  })

  it('passes the input processing choice to the engine', async () => {
    engine.useMicrophone.mockResolvedValue(micTrack)
    await startMicrophone()
    expect(engine.useMicrophone).toHaveBeenLastCalledWith({ processing: false })

    useMicStore.getState().setProcessing(true)
    await startMicrophone()
    expect(engine.useMicrophone).toHaveBeenLastCalledWith({ processing: true })
  })

  it.each([
    ['mic-denied', 'denied'],
    ['mic-no-device', 'no-device'],
    ['mic-unsupported', 'unsupported'],
    ['mic-failed', 'failed'],
  ] as const)('records %s as %s, explains it and leaves the app usable', async (code, status) => {
    usePlaybackStore.getState().setTrack(fileTrack)
    engine.useMicrophone.mockRejectedValueOnce(new AudioEngineError(code, 'Explained.'))

    await startMicrophone()

    expect(useMicStore.getState().status).toBe(status)
    expect(toast.error).toHaveBeenCalledWith('Explained.')
    expect(usePlaybackStore.getState().track).toEqual(fileTrack)
    expect(usePlaybackStore.getState().error).toBeNull()
  })

  it('stays quiet when a newer source replaced the request', async () => {
    engine.useMicrophone.mockRejectedValueOnce(new AudioEngineError('aborted', 'Replaced.'))

    await startMicrophone()

    expect(toast.error).not.toHaveBeenCalled()
    expect(useMicStore.getState().status).toBe('prompt')
  })

  it('reports an unexpected failure generically', async () => {
    engine.useMicrophone.mockRejectedValueOnce(new Error('boom'))

    await startMicrophone()

    expect(useMicStore.getState().status).toBe('failed')
    expect(toast.error).toHaveBeenCalledWith('The microphone could not be started.')
  })
})

describe('stopMicrophone', () => {
  it('stops the engine input and clears the live track', () => {
    usePlaybackStore.getState().setTrack(micTrack)

    stopMicrophone()

    expect(engine.stopMicrophone).toHaveBeenCalledTimes(1)
    expect(usePlaybackStore.getState().track).toBeNull()
  })

  it('keeps a file track that is not the microphone', () => {
    usePlaybackStore.getState().setTrack(fileTrack)

    stopMicrophone()

    expect(usePlaybackStore.getState().track).toEqual(fileTrack)
  })
})

describe('micStore', () => {
  it('starts with speaker monitoring and input processing off', () => {
    const state = useMicStore.getInitialState()
    expect(state.monitor).toBe(false)
    expect(state.processing).toBe(false)
    expect(state.status).toBe('prompt')
  })
})
