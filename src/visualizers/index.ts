import type { Visualizer, VisualizerMode } from '@/types'
import { createBarsVisualizer } from './bars'
import { createParticlesVisualizer } from './particles'
import { createWaveformVisualizer } from './waveform'

/**
 * Registry of visualizers by mode. Each dedicated visualizer replaces its
 * fallback entry as it is built; nothing else needs to change.
 */
const registry: Record<VisualizerMode, Visualizer> = {
  waveform: createWaveformVisualizer(),
  bars: createBarsVisualizer(),
  particles: createParticlesVisualizer(),
}

export function getVisualizer(mode: VisualizerMode): Visualizer {
  return registry[mode]
}

export const VISUALIZER_LABELS: Record<VisualizerMode, string> = {
  waveform: 'Waveform',
  bars: 'Frequency bars',
  particles: 'Particle spectrum',
}
