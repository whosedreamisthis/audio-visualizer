import { toast } from 'sonner'
import { usePlaybackStore, type PlaybackStatus } from '@/store/playbackStore'
import { AudioEngineError, type AudioEngine } from './AudioEngine'
import { getAudioEngine } from './engine'
import { stopMicrophone } from './mic'

/** `stop` ends a live input; there is nothing to pause or resume. */
export type TransportAction = 'play' | 'pause' | 'stop' | 'none'

type TransportEngine = Pick<AudioEngine, 'play' | 'pause' | 'seek' | 'stopMicrophone'>

/** What the play/pause button should do for the current state. */
export function getTransportAction(
  status: PlaybackStatus,
  hasTrack: boolean,
  live = false,
): TransportAction {
  if (!hasTrack) return 'none'
  switch (status) {
    case 'playing':
      return live ? 'stop' : 'pause'
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
  const action = getTransportAction(status, track !== null, track?.source === 'mic')

  if (action === 'stop') {
    stopMicrophone(engine)
  } else if (action === 'pause') {
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
  const { track } = usePlaybackStore.getState()
  if (track === null || track.source === 'mic') return // a live input can't be seeked
  engine.seek(seconds)
  usePlaybackStore.getState().setTime(seconds)
}
