import { toast } from 'sonner'
import { usePlaybackStore, type PlaybackStatus } from '@/store/playbackStore'
import { AudioEngineError, type AudioEngine } from './AudioEngine'
import { getAudioEngine } from './engine'

export type TransportAction = 'play' | 'pause' | 'none'

type TransportEngine = Pick<AudioEngine, 'play' | 'pause' | 'seek'>

/** What the play/pause button should do for the current state. */
export function getTransportAction(
  status: PlaybackStatus,
  hasTrack: boolean,
): TransportAction {
  if (!hasTrack) return 'none'
  switch (status) {
    case 'playing':
      return 'pause'
    case 'ready':
    case 'paused':
      return 'play'
    default:
      return 'none'
  }
}

export async function togglePlayback(
  engine: TransportEngine = getAudioEngine(),
): Promise<void> {
  const { status, track } = usePlaybackStore.getState()
  const action = getTransportAction(status, track !== null)

  if (action === 'pause') {
    engine.pause()
  } else if (action === 'play') {
    try {
      await engine.play()
    } catch (error) {
      toast.error(
        error instanceof AudioEngineError
          ? error.message
          : 'Could not start playback.',
      )
    }
  }
}

/** Seek the engine and update the displayed time immediately. */
export function seekTo(
  seconds: number,
  engine: TransportEngine = getAudioEngine(),
): void {
  if (usePlaybackStore.getState().track === null) return
  engine.seek(seconds)
  usePlaybackStore.getState().setTime(seconds)
}
