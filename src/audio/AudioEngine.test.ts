import { describe, expect, it, vi } from 'vitest'
import { AudioEngine, AudioEngineError, type EngineEnv } from './AudioEngine'

function fakeParam(value = 0) {
  return { value, setTargetAtTime: vi.fn() }
}

function fakeNode() {
  return { connect: vi.fn(), disconnect: vi.fn() }
}

function createFakes(options: { playError?: string } = {}) {
  const analyser = {
    ...fakeNode(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
  }
  const gain = { ...fakeNode(), gain: fakeParam(1) }
  const filters: Array<ReturnType<typeof fakeFilter>> = []
  function fakeFilter() {
    return {
      ...fakeNode(),
      type: '',
      frequency: fakeParam(),
      Q: fakeParam(),
      gain: fakeParam(),
    }
  }
  const source = fakeNode()
  const ctx = {
    currentTime: 0,
    sampleRate: 48000,
    state: 'running',
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    createMediaElementSource: vi.fn(() => source),
    createBiquadFilter: vi.fn(() => {
      const filter = fakeFilter()
      filters.push(filter)
      return filter
    }),
    createGain: vi.fn(() => gain),
    createAnalyser: vi.fn(() => analyser),
  }

  const audio = Object.assign(new EventTarget(), {
    preload: '',
    src: '',
    duration: 120,
    currentTime: 0,
    paused: true,
    loop: false,
    volume: 1,
    muted: false,
    playbackRate: 1,
    preservesPitch: true,
    error: null as { code: number } | null,
    pause: vi.fn(),
    load: vi.fn(),
    removeAttribute: vi.fn(),
    play: vi.fn(() =>
      options.playError
        ? Promise.reject(new DOMException('blocked', options.playError))
        : Promise.resolve(),
    ),
  })

  const env: EngineEnv = {
    createAudio: vi.fn(() => audio as unknown as HTMLAudioElement),
    createContext: vi.fn(() => ctx as unknown as AudioContext),
    createObjectURL: vi.fn(() => 'blob:fake'),
    revokeObjectURL: vi.fn(),
  }

  return { env, ctx, audio, analyser, gain, filters, source }
}

describe('AudioEngine', () => {
  it('init() builds the graph once and is idempotent', () => {
    const { env, ctx } = createFakes()
    const engine = new AudioEngine(env)

    engine.init()
    engine.init()

    expect(env.createContext).toHaveBeenCalledTimes(1)
    expect(env.createAudio).toHaveBeenCalledTimes(1)
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1)
    expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(3)
  })

  it('connects source → filters → gain → analyser → destination', () => {
    const { env, ctx, source, filters, gain, analyser } = createFakes()
    new AudioEngine(env).init()

    expect(source.connect).toHaveBeenCalledWith(filters[0])
    expect(filters[0].connect).toHaveBeenCalledWith(filters[1])
    expect(filters[1].connect).toHaveBeenCalledWith(filters[2])
    expect(filters[2].connect).toHaveBeenCalledWith(gain)
    expect(gain.connect).toHaveBeenCalledWith(analyser)
    expect(analyser.connect).toHaveBeenCalledWith(ctx.destination)
  })

  it('clamps and ramps gain and EQ changes', () => {
    const { env, gain, filters } = createFakes()
    const engine = new AudioEngine(env)
    engine.init()

    engine.setGain(5)
    expect(gain.gain.setTargetAtTime).toHaveBeenCalledWith(2, 0, expect.any(Number))

    engine.setEqBand('low', -40)
    expect(filters[0].gain.setTargetAtTime).toHaveBeenCalledWith(-12, 0, expect.any(Number))
  })

  it('reallocates analysis buffers when the FFT size changes', () => {
    const { env, analyser } = createFakes()
    const engine = new AudioEngine(env)
    engine.init()

    analyser.frequencyBinCount = 512
    engine.setFftSize(1024)

    expect(analyser.fftSize).toBe(1024)
    engine.getBands()
    const buffer = analyser.getByteFrequencyData.mock.calls[0][0] as Uint8Array
    expect(buffer.length).toBe(512)
  })

  it('loadFile revokes the previous object URL and resolves with track meta', async () => {
    const { env, audio } = createFakes()
    const engine = new AudioEngine(env)

    const first = engine.loadFile(new File(['x'], 'First Song.mp3'))
    audio.dispatchEvent(new Event('loadedmetadata'))
    const meta = await first
    expect(meta).toMatchObject({ name: 'First Song', source: 'file', duration: 120 })
    expect(env.revokeObjectURL).not.toHaveBeenCalled()

    const second = engine.loadFile(new File(['y'], 'Second.wav'))
    audio.dispatchEvent(new Event('loadedmetadata'))
    await second
    expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
  })

  it('rejects with unsupported-format on a decode error', async () => {
    const { env, audio } = createFakes()
    const engine = new AudioEngine(env)

    const pending = engine.loadFile(new File(['x'], 'bad.mp3'))
    audio.error = { code: 4 }
    audio.dispatchEvent(new Event('error'))

    await expect(pending).rejects.toMatchObject({ code: 'unsupported-format' })
  })

  it('maps a blocked play() to an autoplay-blocked error', async () => {
    const { env } = createFakes({ playError: 'NotAllowedError' })
    const engine = new AudioEngine(env)
    engine.init()

    const result = engine.play()
    await expect(result).rejects.toBeInstanceOf(AudioEngineError)
    await expect(result).rejects.toMatchObject({ code: 'autoplay-blocked' })
  })

  it('resumes the context before playing', async () => {
    const { env, ctx, audio } = createFakes()
    const engine = new AudioEngine(env)
    engine.init()

    await engine.play()

    expect(ctx.resume).toHaveBeenCalled()
    expect(audio.play).toHaveBeenCalled()
  })

  it('throws not-initialized before init()', () => {
    const engine = new AudioEngine(createFakes().env)
    expect(() => engine.setGain(1)).toThrowError(
      expect.objectContaining({ code: 'not-initialized' }),
    )
  })

  it('forwards audio events to subscribers until unsubscribed', () => {
    const { env, audio } = createFakes()
    const engine = new AudioEngine(env)
    engine.init()

    const handler = vi.fn()
    const off = engine.on('timeupdate', handler)
    audio.currentTime = 12
    audio.dispatchEvent(new Event('timeupdate'))
    expect(handler).toHaveBeenCalledWith(12)

    off()
    audio.dispatchEvent(new Event('timeupdate'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('dispose() disconnects the graph, revokes URLs and closes the context', () => {
    const { env, ctx, source, gain, analyser, audio } = createFakes()
    const engine = new AudioEngine(env)
    void engine.loadFile(new File(['x'], 'song.mp3'))

    engine.dispose()

    expect(audio.pause).toHaveBeenCalled()
    expect(source.disconnect).toHaveBeenCalled()
    expect(gain.disconnect).toHaveBeenCalled()
    expect(analyser.disconnect).toHaveBeenCalled()
    expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
    expect(ctx.close).toHaveBeenCalled()
  })

  it('can be initialized again after dispose()', () => {
    const { env } = createFakes()
    const engine = new AudioEngine(env)
    engine.init()
    engine.dispose()
    engine.init()

    expect(env.createContext).toHaveBeenCalledTimes(2)
  })
})
