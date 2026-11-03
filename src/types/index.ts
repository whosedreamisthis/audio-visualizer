export type VisualizerMode = 'waveform' | 'bars' | 'particles'

export type ThemeId = 'neon' | 'sunset' | 'ocean' | 'mono' | 'aurora'

export type EqBandId = 'low' | 'mid' | 'high'

export type FftSize = 512 | 1024 | 2048 | 4096

export type TrackSource = 'file' | 'preset' | 'mic'

/** Byte buffer type accepted by the Web Audio analyser methods. */
export type ByteBuffer = Uint8Array<ArrayBuffer>

export interface Size {
  width: number
  height: number
}

export interface TrackMeta {
  id: string
  name: string
  artist?: string
  source: TrackSource
  duration: number
}

export interface PresetTrack {
  id: string
  title: string
  artist: string
  url: string
  license: string
  sourceUrl?: string
  bpm?: number
  suggestedTheme?: ThemeId
}

/** Normalized (0..1) energy per frequency range. */
export interface BandEnergy {
  bass: number
  mid: number
  treble: number
  level: number
}

export interface AudioFrame {
  /** Byte frequency data (0..255 per bin); empty before the engine starts. */
  freq: ByteBuffer
  /** Byte time-domain data (128 is silence); empty before the engine starts. */
  wave: ByteBuffer
  /** Audio context sample rate in Hz (0 before the engine starts). */
  sampleRate: number
  bands: BandEnergy
  beat: boolean
  beatStrength: number
}

export interface Theme {
  id: ThemeId
  label: string
  background: string
  /** Gradient stops, from low to high. */
  colors: string[]
  accent: string
}

export interface VisualizerSettings {
  fftSize: FftSize
  smoothing: number
  sensitivity: number
  barCount: number
  particleCount: number
  lineWidth: number
  glow: boolean
  mirror: boolean
}

export interface DrawArgs {
  ctx: CanvasRenderingContext2D
  /** CSS pixels; the context is pre-scaled by the device pixel ratio. */
  width: number
  height: number
  /** Seconds since the previous frame, clamped. */
  dt: number
  /** Seconds since the loop started; drives idle animation. */
  time: number
  /** True while a track is playing. */
  playing: boolean
  theme: Theme
  settings: VisualizerSettings
  audio: AudioFrame
}

export interface Visualizer {
  id: VisualizerMode
  label: string
  init?(size: Size): void
  resize?(size: Size): void
  draw(args: DrawArgs): void
  dispose?(): void
}
