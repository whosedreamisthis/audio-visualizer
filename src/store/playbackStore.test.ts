import { beforeEach, describe, expect, it } from 'vitest'
import type { TrackMeta } from '@/types'
import { usePlaybackStore } from './playbackStore'

const track: TrackMeta = { id: 't1', name: 'Song', source: 'file', duration: 120 }

beforeEach(() => {
  usePlaybackStore.setState(usePlaybackStore.getInitialState())
})

describe('playback store', () => {
  it('setTrack moves to ready, resets time and clears errors', () => {
    usePlaybackStore.setState({ currentTime: 50, error: 'old', status: 'error' })
    usePlaybackStore.getState().setTrack(track)
    expect(usePlaybackStore.getState()).toMatchObject({
      status: 'ready',
      track,
      currentTime: 0,
      duration: 120,
      error: null,
    })
  })

  it('setTrack(null) returns to idle', () => {
    usePlaybackStore.getState().setTrack(track)
    usePlaybackStore.getState().setTrack(null)
    expect(usePlaybackStore.getState()).toMatchObject({
      status: 'idle',
      track: null,
      duration: 0,
    })
  })

  it('clamps time to the duration and ignores bad durations', () => {
    usePlaybackStore.getState().setDuration(100)
    usePlaybackStore.getState().setTime(500)
    expect(usePlaybackStore.getState().currentTime).toBe(100)
    usePlaybackStore.getState().setTime(-5)
    expect(usePlaybackStore.getState().currentTime).toBe(0)

    usePlaybackStore.getState().setDuration(Number.NaN)
    expect(usePlaybackStore.getState().duration).toBe(0)
    usePlaybackStore.getState().setDuration(Infinity)
    expect(usePlaybackStore.getState().duration).toBe(0)
  })

  it('setError sets the error status and null clears only the message', () => {
    usePlaybackStore.getState().setError('boom')
    expect(usePlaybackStore.getState()).toMatchObject({ error: 'boom', status: 'error' })
    usePlaybackStore.getState().setError(null)
    expect(usePlaybackStore.getState()).toMatchObject({ error: null, status: 'error' })
  })

  it('toggles loop and keeps it across reset', () => {
    usePlaybackStore.getState().toggleLoop()
    expect(usePlaybackStore.getState().loop).toBe(true)
    usePlaybackStore.getState().setTrack(track)
    usePlaybackStore.getState().reset()
    expect(usePlaybackStore.getState()).toMatchObject({
      loop: true,
      status: 'idle',
      track: null,
    })
  })
})
