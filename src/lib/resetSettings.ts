import { DEFAULT_AUDIO_SETTINGS, useAudioStore } from '@/store/audioStore'
import { DEFAULT_VISUALIZER_PREFS, useVisualizerStore } from '@/store/visualizerStore'

/** Restore audio mixer, EQ and visualizer preferences to their defaults. Saved presets are kept. */
export function resetAllSettings() {
  useAudioStore.setState({
    ...DEFAULT_AUDIO_SETTINGS,
    eq: { ...DEFAULT_AUDIO_SETTINGS.eq },
  })
  useVisualizerStore.setState({
    ...DEFAULT_VISUALIZER_PREFS,
    settings: { ...DEFAULT_VISUALIZER_PREFS.settings },
  })
}
