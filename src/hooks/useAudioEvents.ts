import { useEffect } from 'react'
import { getAudioEngine } from '@/audio/engine'
import { throttle } from '@/lib/throttle'
import { usePlaybackStore } from '@/store/playbackStore'

/** Playback position writes to the store are limited to about 10 Hz. */
const TIME_UPDATE_INTERVAL_MS = 100

/** Mirror engine events into the playback store (low frequency only). */
export function useAudioEvents(): void {
  useEffect(() => {
    const engine = getAudioEngine()
    const playback = () => usePlaybackStore.getState()

    const setTime = throttle(
      (seconds: number) => playback().setTime(seconds),
      TIME_UPDATE_INTERVAL_MS,
    )

    const unsubscribers = [
      engine.on('timeupdate', setTime),
      engine.on('loadedmetadata', (duration) => playback().setDuration(duration)),
      engine.on('play', () => playback().setStatus('playing')),
      engine.on('pause', () => {
        playback().setTime(engine.currentTime)
        // pause also fires while loading a new track; only a playing track becomes paused
        if (playback().status === 'playing') playback().setStatus('paused')
      }),
      engine.on('ended', () => {
        playback().setStatus('paused')
        playback().setTime(0)
        engine.seek(0)
      }),
      engine.on('error', (error) => playback().setError(error.message)),
    ]

    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe()
    }
  }, [])
}
