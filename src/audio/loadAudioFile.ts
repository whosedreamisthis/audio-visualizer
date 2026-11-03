import { toast } from 'sonner'
import { validateAudioFile } from '@/lib/validateAudioFile'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'
import { AudioEngineError } from './AudioEngine'
import { getAudioEngine } from './engine'
import { isCurrentSource, nextSourceToken } from './sourceToken'

/** Load a validated audio file into the engine and start playing it. */
export async function loadAudioFile(file: File): Promise<void> {
  const validation = validateAudioFile(file)
  if (!validation.ok) {
    toast.error(validation.message)
    return
  }

  const token = nextSourceToken()
  useUiStore.getState().setSourcePickerOpen(false)
  const engine = getAudioEngine()
  const playback = () => usePlaybackStore.getState()

  playback().setStatus('loading')

  try {
    // Runs inside the drop/click gesture, so the context may be created and resumed
    engine.init()
    const track = await engine.loadFile(file)
    if (!isCurrentSource(token)) return

    playback().setTrack(track)
    await engine.play()
  } catch (error) {
    if (!isCurrentSource(token)) return
    // Cancelled by a newer source (e.g. the microphone), which owns the UI now
    if (error instanceof AudioEngineError && error.code === 'aborted') return

    if (error instanceof AudioEngineError && error.code === 'autoplay-blocked') {
      toast.info('Press play to start the track.')
      return
    }

    const message =
      error instanceof AudioEngineError
        ? error.message
        : 'Something went wrong loading that file.'
    playback().setTrack(null)
    playback().setError(message)
    toast.error(message)
  }
}

/** Handle files from a drop or the picker: load the first valid one. */
export async function handleAudioFiles(files: File[]): Promise<void> {
  if (files.length === 0) return

  const valid = files.find((file) => validateAudioFile(file).ok)
  if (!valid) {
    await loadAudioFile(files[0]) // reports why it was rejected
    return
  }

  if (files.length > 1) {
    toast.info(
      `Loaded "${valid.name}". The other ${files.length - 1} file${files.length > 2 ? 's were' : ' was'} ignored.`,
    )
  }
  await loadAudioFile(valid)
}
