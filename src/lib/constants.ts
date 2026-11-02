import type {
  EqBandId,
  FftSize,
  ThemeId,
  VisualizerMode,
  VisualizerSettings,
} from '@/types'

export const GAIN = { min: 0, max: 2, default: 1 } as const
export const VOLUME = { min: 0, max: 1, default: 0.7 } as const
export const SPEED = { min: 0.5, max: 2, step: 0.05, default: 1 } as const

export const EQ_RANGE_DB = { min: -12, max: 12, step: 0.5 } as const

export interface EqBandDefinition {
  id: EqBandId
  label: string
  type: BiquadFilterType
  frequency: number
  q: number
}

export const EQ_BANDS: readonly EqBandDefinition[] = [
  { id: 'low', label: 'Low', type: 'lowshelf', frequency: 200, q: 1 },
  { id: 'mid', label: 'Mid', type: 'peaking', frequency: 1000, q: 1 },
  { id: 'high', label: 'High', type: 'highshelf', frequency: 4000, q: 1 },
]

export const FFT_SIZES: readonly FftSize[] = [512, 1024, 2048, 4096]
export const DEFAULT_FFT_SIZE: FftSize = 2048
export const SMOOTHING = { min: 0, max: 0.99, default: 0.8 } as const
export const SENSITIVITY = { min: 0.5, max: 3, default: 1 } as const

/** Frequency ranges in Hz used to compute band energy. */
export const BAND_RANGES_HZ = {
  bass: [20, 250],
  mid: [250, 4000],
  treble: [4000, 16000],
} as const

export const VISUALIZER_MODES: readonly VisualizerMode[] = [
  'waveform',
  'bars',
  'particles',
]
export const THEME_IDS: readonly ThemeId[] = [
  'neon',
  'sunset',
  'ocean',
  'mono',
  'aurora',
]

export const BAR_COUNT = { min: 16, max: 128 } as const
export const PARTICLE_COUNT = { min: 100, max: 3000 } as const
export const LINE_WIDTH = { min: 1, max: 6 } as const

export const DEFAULT_VISUALIZER_SETTINGS: VisualizerSettings = {
  fftSize: DEFAULT_FFT_SIZE,
  smoothing: SMOOTHING.default,
  sensitivity: SENSITIVITY.default,
  barCount: 64,
  particleCount: 800,
  lineWidth: 2,
  glow: false,
  mirror: true,
}

export const EQ_FLAT: Record<EqBandId, number> = { low: 0, mid: 0, high: 0 }

export const ACCEPTED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.ogg',
  '.flac',
  '.m4a',
] as const
export const MAX_AUDIO_FILE_BYTES = 100 * 1024 * 1024
