import { toast } from 'sonner'
import { useMicStore, type MicStatus } from '@/store/micStore'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'
import {
  AudioEngineError,
  type AudioEngine,
  type AudioEngineErrorCode,
} from './AudioEngine'
import { getAudioEngine } from './engine'
import { nextSourceToken } from './sourceToken'

const STATUS_BY_CODE: Partial<Record<AudioEngineErrorCode, MicStatus>> = {
  'mic-denied': 'denied',
  'mic-no-device': 'no-device',
  'mic-unsupported': 'unsupported',
  'mic-failed': 'failed',
}

/** Switch the input to the microphone and start visualizing it. Call from a click. */
export async function startMicrophone(): Promise<void> {
  const engine = getAudioEngine()
  try {
    const track = await engine.useMicrophone({
      processing: useMicStore.getState().processing,
    })
    // The mic is the newest source: ignore any file or preset still loading
    nextSourceToken()

    const playback = usePlaybackStore.getState()
    playback.setTrack(track)
    playback.setStatus('playing')
    useMicStore.getState().setStatus('granted')
    useUiStore.getState().setSourcePickerOpen(false)
  } catch (error) {
    if (error instanceof AudioEngineError) {
      if (error.code === 'aborted') return // replaced by a newer source
      useMicStore.getState().setStatus(STATUS_BY_CODE[error.code] ?? 'failed')
      toast.error(error.message)
      return
    }
    useMicStore.getState().setStatus('failed')
    toast.error('The microphone could not be started.')
  }
}

/** Stop the microphone and return to the empty state. */
export function stopMicrophone(
  engine: Pick<AudioEngine, 'stopMicrophone'> = getAudioEngine(),
): void {
  nextSourceToken()
  engine.stopMicrophone()
  const playback = usePlaybackStore.getState()
  if (playback.track?.source === 'mic') playback.setTrack(null)
}
