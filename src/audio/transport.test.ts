import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import type { TrackMeta } from '@/types'
import { usePlaybackStore } from '@/store/playbackStore'
import { AudioEngineError } from './AudioEngine'
import { getTransportAction, seekTo, togglePlayback } from './transport'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn() } }))

const track: TrackMeta = { id: 't1', name: 'Song', source: 'file', duration: 100 }

function fakeEngine() {
  return { play: vi.fn(() => Promise.resolve()), pause: vi.fn(), seek: vi.fn() }
}

beforeEach(() => {
  usePlaybackStore.setState(usePlaybackStore.getInitialState())
})

describe('getTransportAction', () => {
  it('does nothing without a track', () => {
    expect(getTransportAction('ready', false)).toBe('none')
    expect(getTransportAction('playing', false)).toBe('none')
  })

  it('pauses while playing and plays when ready or paused', () => {
    expect(getTransportAction('playing', true)).toBe('pause')
    expect(getTransportAction('ready', true)).toBe('play')
    expect(getTransportAction('paused', true)).toBe('play')
  })

  it('does nothing while loading or after an error', () => {
    expect(getTransportAction('loading', true)).toBe('none')
    expect(getTransportAction('error', true)).toBe('none')
  })
})

describe('togglePlayback', () => {
  it('plays a ready track', async () => {
    usePlaybackStore.getState().setTrack(track)
    const engine = fakeEngine()
    await togglePlayback(engine)
    expect(engine.play).toHaveBeenCalledTimes(1)
    expect(engine.pause).not.toHaveBeenCalled()
  })

  it('pauses a playing track', async () => {
    usePlaybackStore.getState().setTrack(track)
    usePlaybackStore.getState().setStatus('playing')
    const engine = fakeEngine()
    await togglePlayback(engine)
    expect(engine.pause).toHaveBeenCalledTimes(1)
    expect(engine.play).not.toHaveBeenCalled()
  })

  it('does nothing with no track', async () => {
    const engine = fakeEngine()
    await togglePlayback(engine)
    expect(engine.play).not.toHaveBeenCalled()
    expect(engine.pause).not.toHaveBeenCalled()
  })

  it('shows the engine error message when play fails', async () => {
    usePlaybackStore.getState().setTrack(track)
    const engine = fakeEngine()
    engine.play.mockRejectedValueOnce(
      new AudioEngineError('autoplay-blocked', 'Playback was blocked.'),
    )
    await togglePlayback(engine)
    expect(toast.error).toHaveBeenCalledWith('Playback was blocked.')
  })

  it('shows a generic message for unexpected errors', async () => {
    usePlaybackStore.getState().setTrack(track)
    const engine = fakeEngine()
    engine.play.mockRejectedValueOnce(new Error('boom'))
    await togglePlayback(engine)
    expect(toast.error).toHaveBeenCalledWith('Could not start playback.')
  })
})

describe('seekTo', () => {
  it('seeks the engine and updates the displayed time', () => {
    usePlaybackStore.getState().setTrack(track)
    const engine = fakeEngine()
    seekTo(42, engine)
    expect(engine.seek).toHaveBeenCalledWith(42)
    expect(usePlaybackStore.getState().currentTime).toBe(42)
  })

  it('clamps the displayed time to the duration', () => {
    usePlaybackStore.getState().setTrack(track)
    seekTo(500, fakeEngine())
    expect(usePlaybackStore.getState().currentTime).toBe(100)
  })

  it('ignores seeks when no track is loaded', () => {
    const engine = fakeEngine()
    seekTo(10, engine)
    expect(engine.seek).not.toHaveBeenCalled()
    expect(usePlaybackStore.getState().currentTime).toBe(0)
  })
})
