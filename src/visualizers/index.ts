import type { Visualizer, VisualizerMode } from '@/types'
import { createFallbackVisualizer } from './fallback'

/**
 * Registry of visualizers by mode. Each dedicated visualizer replaces its
 * fallback entry as it is built; nothing else needs to change.
 */
const registry: Record<VisualizerMode, Visualizer> = {
  waveform: createFallbackVisualizer('waveform', 'Waveform'),
  bars: createFallbackVisualizer('bars', 'Bars'),
  particles: createFallbackVisualizer('particles', 'Particles'),
}

export function getVisualizer(mode: VisualizerMode): Visualizer {
  return registry[mode]
}

export const VISUALIZER_LABELS: Record<VisualizerMode, string> = {
  waveform: 'Waveform',
  bars: 'Frequency bars',
  particles: 'Particle spectrum',
}
