import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AudioEngineError } from '@/audio/AudioEngine'
import { getAudioEngine } from '@/audio/engine'
import { isCurrentSource, nextSourceToken } from '@/audio/sourceToken'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { PresetTrack } from '@/types'
import { fetchManifest, fetchPresetAudio } from './presets'
import { presetKeys } from './queryKeys'

export function usePresetTracks() {
  return useQuery({
    queryKey: presetKeys.all,
    queryFn: fetchManifest,
    staleTime: Infinity,
  })
}

/** Fetch (or reuse the cached) preset audio, load it into the engine, play and apply its theme. */
export function useLoadPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (track: PresetTrack) => {
      const token = nextSourceToken()
      const engine = getAudioEngine()
      const playback = () => usePlaybackStore.getState()

      // Still inside the click gesture, so the context may be created and resumed
      engine.init()
      useUiStore.getState().setSourcePickerOpen(false)
      playback().setStatus('loading')

      const blob = await queryClient.fetchQuery({
        queryKey: presetKeys.audio(track.id),
        queryFn: () => fetchPresetAudio(track.url),
        staleTime: Infinity,
        gcTime: Infinity,
      })
      if (!isCurrentSource(token)) return

      // The engine owns this URL and revokes it when the next track replaces it
      const objectUrl = URL.createObjectURL(blob)
      let meta
      try {
        meta = await engine.loadUrl(
          objectUrl,
          { name: track.title, artist: track.artist, source: 'preset' },
          true,
        )
      } catch (error) {
        if (!isCurrentSource(token)) return
        throw error
      }
      if (!isCurrentSource(token)) return

      playback().setTrack(meta)
      if (track.suggestedTheme) useVisualizerStore.getState().setTheme(track.suggestedTheme)
      await engine.play()
    },
    onError: (error) => {
      if (error instanceof AudioEngineError) {
        if (error.code === 'aborted') return
        if (error.code === 'autoplay-blocked') {
          toast.info('Press play to start the track.')
          return
        }
      }
      const message =
        error instanceof AudioEngineError ? error.message : 'Could not load that preset.'
      const playback = usePlaybackStore.getState()
      playback.setTrack(null)
      playback.setError(message)
      toast.error(message)
    },
  })
}
