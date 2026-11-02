import {
  DEFAULT_FFT_SIZE,
  EQ_BANDS,
  EQ_RANGE_DB,
  GAIN,
  SMOOTHING,
  SPEED,
} from '@/lib/constants'
import { clamp } from '@/lib/math'
import type { BandEnergy, EqBandId, FftSize, TrackMeta, TrackSource } from '@/types'
import { getBandEnergy } from './bands'

/** Smoothing time constant (seconds) for audio parameter changes. */
const PARAM_TIME_CONSTANT = 0.015

export type ByteBuffer = Uint8Array<ArrayBuffer>

export type AudioEngineErrorCode =
  | 'not-initialized'
  | 'autoplay-blocked'
  | 'unsupported-format'
  | 'load-failed'

export class AudioEngineError extends Error {
  readonly code: AudioEngineErrorCode

  constructor(code: AudioEngineErrorCode, message: string) {
    super(message)
    this.name = 'AudioEngineError'
    this.code = code
  }
}

export interface EngineEventMap {
  /** Fired once the context and graph exist and parameters can be applied. */
  initialized: void
  /** Current playback position in seconds. */
  timeupdate: number
  /** Track duration in seconds. */
  loadedmetadata: number
  play: void
  pause: void
  ended: void
  error: AudioEngineError
}

type EngineHandler<K extends keyof EngineEventMap> = (
  payload: EngineEventMap[K],
) => void

/** Browser dependencies, injectable so the engine can be tested without a browser. */
export interface EngineEnv {
  createAudio(): HTMLAudioElement
  createContext(): AudioContext
  createObjectURL(blob: Blob): string
  revokeObjectURL(url: string): void
}

const browserEnv: EngineEnv = {
  createAudio: () => new Audio(),
  createContext: () => new AudioContext(),
  createObjectURL: (blob) => URL.createObjectURL(blob),
  revokeObjectURL: (url) => URL.revokeObjectURL(url),
}

export interface LoadInfo {
  name: string
  artist?: string
  source?: TrackSource
}

/**
 * Owns the <audio> element and the Web Audio graph:
 * source → low shelf → mid peaking → high shelf → gain → analyser → destination.
 * Framework-agnostic: no React or store imports.
 */
export class AudioEngine {
  private readonly env: EngineEnv
  private ctx: AudioContext | null = null
  private audio: HTMLAudioElement | null = null
  private source: MediaElementAudioSourceNode | null = null
  private filters = new Map<EqBandId, BiquadFilterNode>()
  private gainNode: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private objectUrl: string | null = null
  private trackCounter = 0
  private freqBuffer: ByteBuffer = new Uint8Array(0)

  private readonly listeners: {
    [K in keyof EngineEventMap]: Set<EngineHandler<K>>
  } = {
    initialized: new Set(),
    timeupdate: new Set(),
    loadedmetadata: new Set(),
    play: new Set(),
    pause: new Set(),
    ended: new Set(),
    error: new Set(),
  }

  constructor(env: EngineEnv = browserEnv) {
    this.env = env
  }

  /** Create the context and graph once. Safe to call repeatedly (StrictMode). */
  init(): void {
    if (this.ctx) return

    const ctx = this.env.createContext()
    const audio = this.env.createAudio()
    audio.preload = 'metadata'

    const source = ctx.createMediaElementSource(audio)

    let previous: AudioNode = source
    for (const band of EQ_BANDS) {
      const filter = ctx.createBiquadFilter()
      filter.type = band.type
      filter.frequency.value = band.frequency
      filter.Q.value = band.q
      filter.gain.value = 0
      previous.connect(filter)
      previous = filter
      this.filters.set(band.id, filter)
    }

    const gainNode = ctx.createGain()
    gainNode.gain.value = GAIN.default

    const analyser = ctx.createAnalyser()
    analyser.fftSize = DEFAULT_FFT_SIZE
    analyser.smoothingTimeConstant = SMOOTHING.default

    previous.connect(gainNode)
    gainNode.connect(analyser)
    analyser.connect(ctx.destination)

    audio.addEventListener('timeupdate', this.onTimeUpdate)
    audio.addEventListener('loadedmetadata', this.onLoadedMetadata)
    audio.addEventListener('play', this.onPlay)
    audio.addEventListener('pause', this.onPause)
    audio.addEventListener('ended', this.onEnded)
    audio.addEventListener('error', this.onError)

    this.ctx = ctx
    this.audio = audio
    this.source = source
    this.gainNode = gainNode
    this.analyser = analyser
    this.freqBuffer = new Uint8Array(analyser.frequencyBinCount)
    this.emit('initialized', undefined)
  }

  get isInitialized(): boolean {
    return this.ctx !== null
  }

  // --- Loading -----------------------------------------------------------

  loadFile(file: File): Promise<TrackMeta> {
    this.init()
    this.revokeObjectUrl()
    const url = this.env.createObjectURL(file)
    this.objectUrl = url
    return this.load(url, { name: file.name.replace(/\.[^.]+$/, ''), source: 'file' })
  }

  loadUrl(url: string, info: LoadInfo): Promise<TrackMeta> {
    this.init()
    this.revokeObjectUrl()
    return this.load(url, { source: 'preset', ...info })
  }

  private load(src: string, info: LoadInfo): Promise<TrackMeta> {
    const audio = this.requireAudio()
    audio.pause()

    return new Promise<TrackMeta>((resolve, reject) => {
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onReady)
        audio.removeEventListener('error', onFail)
      }
      const onReady = () => {
        cleanup()
        this.trackCounter += 1
        resolve({
          id: `track-${this.trackCounter}`,
          name: info.name,
          artist: info.artist,
          source: info.source ?? 'file',
          duration: audio.duration,
        })
      }
      const onFail = () => {
        cleanup()
        reject(this.toError(audio))
      }
      audio.addEventListener('loadedmetadata', onReady)
      audio.addEventListener('error', onFail)
      audio.src = src
      audio.load()
    })
  }

  // --- Transport ---------------------------------------------------------

  /** Resume the context (needs a user gesture) and start playback. */
  async play(): Promise<void> {
    const audio = this.requireAudio()
    try {
      await this.ctx?.resume()
      await audio.play()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        throw new AudioEngineError(
          'autoplay-blocked',
          'Playback was blocked by the browser. Click play to start.',
        )
      }
      throw new AudioEngineError('load-failed', 'Could not start playback.')
    }
  }

  pause(): void {
    this.audio?.pause()
  }

  seek(seconds: number): void {
    const audio = this.requireAudio()
    const max = Number.isFinite(audio.duration) ? audio.duration : Infinity
    audio.currentTime = clamp(seconds, 0, max)
  }

  setLoop(loop: boolean): void {
    this.requireAudio().loop = loop
  }

  get currentTime(): number {
    return this.audio?.currentTime ?? 0
  }

  get duration(): number {
    return this.audio?.duration ?? 0
  }

  get paused(): boolean {
    return this.audio?.paused ?? true
  }

  // --- Parameters --------------------------------------------------------

  setPlaybackRate(rate: number): void {
    this.requireAudio().playbackRate = clamp(rate, SPEED.min, SPEED.max)
  }

  setPreservePitch(preserve: boolean): void {
    this.requireAudio().preservesPitch = preserve
  }

  setVolume(volume: number): void {
    this.requireAudio().volume = clamp(volume, 0, 1)
  }

  setMuted(muted: boolean): void {
    this.requireAudio().muted = muted
  }

  setGain(value: number): void {
    this.rampParam(this.requireGain().gain, clamp(value, GAIN.min, GAIN.max))
  }

  setEqBand(band: EqBandId, db: number): void {
    const filter = this.filters.get(band)
    if (!filter) throw this.notInitialized()
    this.rampParam(filter.gain, clamp(db, EQ_RANGE_DB.min, EQ_RANGE_DB.max))
  }

  setFftSize(size: FftSize): void {
    const analyser = this.requireAnalyser()
    analyser.fftSize = size
    this.freqBuffer = new Uint8Array(analyser.frequencyBinCount)
  }

  setSmoothing(value: number): void {
    this.requireAnalyser().smoothingTimeConstant = clamp(
      value,
      SMOOTHING.min,
      SMOOTHING.max,
    )
  }

  private rampParam(param: AudioParam, value: number): void {
    const ctx = this.ctx
    if (!ctx) throw this.notInitialized()
    param.setTargetAtTime(value, ctx.currentTime, PARAM_TIME_CONSTANT)
  }

  // --- Analysis ----------------------------------------------------------

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? 0
  }

  get fftSize(): number {
    return this.analyser?.fftSize ?? 0
  }

  /** Number of frequency bins; size `getFrequencyData` buffers with this. */
  get frequencyBinCount(): number {
    return this.analyser?.frequencyBinCount ?? 0
  }

  /** Number of time-domain samples; size `getTimeDomainData` buffers with this. */
  get timeDomainLength(): number {
    return this.analyser?.fftSize ?? 0
  }

  getFrequencyData(out: ByteBuffer): void {
    this.analyser?.getByteFrequencyData(out)
  }

  getTimeDomainData(out: ByteBuffer): void {
    this.analyser?.getByteTimeDomainData(out)
  }

  /** Sample the analyser and return bass/mid/treble/overall energy (0..1). */
  getBands(): BandEnergy {
    if (!this.analyser) return { bass: 0, mid: 0, treble: 0, level: 0 }
    this.analyser.getByteFrequencyData(this.freqBuffer)
    return getBandEnergy(this.freqBuffer, this.sampleRate, this.fftSize)
  }

  // --- Events ------------------------------------------------------------

  /** Subscribe to an engine event. Returns an unsubscribe function. */
  on<K extends keyof EngineEventMap>(
    event: K,
    handler: EngineHandler<K>,
  ): () => void {
    const set = this.listeners[event] as Set<EngineHandler<K>>
    set.add(handler)
    return () => {
      set.delete(handler)
    }
  }

  private emit<K extends keyof EngineEventMap>(
    event: K,
    payload: EngineEventMap[K],
  ): void {
    for (const handler of this.listeners[event] as Set<EngineHandler<K>>) {
      handler(payload)
    }
  }

  private onTimeUpdate = () => this.emit('timeupdate', this.currentTime)
  private onLoadedMetadata = () => this.emit('loadedmetadata', this.duration)
  private onPlay = () => this.emit('play', undefined)
  private onPause = () => this.emit('pause', undefined)
  private onEnded = () => this.emit('ended', undefined)
  private onError = () => {
    if (this.audio) this.emit('error', this.toError(this.audio))
  }

  // --- Lifecycle ---------------------------------------------------------

  /** Stop playback, disconnect the graph, revoke URLs and close the context. */
  dispose(): void {
    const audio = this.audio
    if (audio) {
      audio.pause()
      audio.removeEventListener('timeupdate', this.onTimeUpdate)
      audio.removeEventListener('loadedmetadata', this.onLoadedMetadata)
      audio.removeEventListener('play', this.onPlay)
      audio.removeEventListener('pause', this.onPause)
      audio.removeEventListener('ended', this.onEnded)
      audio.removeEventListener('error', this.onError)
      audio.removeAttribute('src')
      audio.load()
    }

    this.source?.disconnect()
    for (const filter of this.filters.values()) filter.disconnect()
    this.gainNode?.disconnect()
    this.analyser?.disconnect()
    this.revokeObjectUrl()

    const ctx = this.ctx
    if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {})

    for (const set of Object.values(this.listeners)) set.clear()

    this.ctx = null
    this.audio = null
    this.source = null
    this.filters.clear()
    this.gainNode = null
    this.analyser = null
    this.freqBuffer = new Uint8Array(0)
  }

  // --- Helpers -----------------------------------------------------------

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      this.env.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
  }

  private toError(audio: HTMLAudioElement): AudioEngineError {
    // MediaError codes: 3 = decode, 4 = source not supported
    const code = audio.error?.code
    if (code === 3 || code === 4) {
      return new AudioEngineError(
        'unsupported-format',
        'This audio file could not be decoded. Try an MP3, WAV, OGG, FLAC or M4A file.',
      )
    }
    return new AudioEngineError('load-failed', 'The audio could not be loaded.')
  }

  private notInitialized(): AudioEngineError {
    return new AudioEngineError(
      'not-initialized',
      'The audio engine has not been initialized.',
    )
  }

  private requireAudio(): HTMLAudioElement {
    if (!this.audio) throw this.notInitialized()
    return this.audio
  }

  private requireGain(): GainNode {
    if (!this.gainNode) throw this.notInitialized()
    return this.gainNode
  }

  private requireAnalyser(): AnalyserNode {
    if (!this.analyser) throw this.notInitialized()
    return this.analyser
  }
}
