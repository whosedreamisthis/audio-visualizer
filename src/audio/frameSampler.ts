import type { AudioFrame } from '@/types'
import type { AudioEngine } from './AudioEngine'
import { writeBandEnergy } from './bands'
import { BeatDetector } from './beatDetector'

type SamplerEngine = Pick<
  AudioEngine,
  | 'frequencyBinCount'
  | 'timeDomainLength'
  | 'sampleRate'
  | 'fftSize'
  | 'getFrequencyData'
  | 'getTimeDomainData'
>

/**
 * Fills one reused `AudioFrame` per animation frame: analyser data, band energy and beat.
 * Buffers are reallocated only when the engine's FFT size changes.
 */
export class FrameSampler {
  readonly frame: AudioFrame = {
    freq: new Uint8Array(0),
    wave: new Uint8Array(0),
    sampleRate: 0,
    bands: { bass: 0, mid: 0, treble: 0, level: 0 },
    beat: false,
    beatStrength: 0,
  }

  private readonly beatDetector = new BeatDetector()

  sample(engine: SamplerEngine, dt: number): AudioFrame {
    const { frame } = this
    const bins = engine.frequencyBinCount
    const samples = engine.timeDomainLength

    if (frame.freq.length !== bins) frame.freq = new Uint8Array(bins)
    if (frame.wave.length !== samples) frame.wave = new Uint8Array(samples)

    engine.getFrequencyData(frame.freq)
    engine.getTimeDomainData(frame.wave)
    frame.sampleRate = engine.sampleRate
    writeBandEnergy(frame.bands, frame.freq, engine.sampleRate, engine.fftSize)

    const beat = this.beatDetector.update(frame.bands.bass, dt)
    frame.beat = beat.beat
    frame.beatStrength = beat.strength

    return frame
  }
}
