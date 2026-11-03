import { describe, expect, it, vi } from 'vitest'
import { AudioEngine, AudioEngineError, type EngineEnv } from './AudioEngine'

function fakeParam(value = 0) {
  return {
    value,
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  }
}

function fakeNode() {
  return { connect: vi.fn(), disconnect: vi.fn() }
}

function createFakes(options: { playError?: string; micError?: string } = {}) {
  const analyser = {
    ...fakeNode(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
  }
  // The engine creates the master gain first, then the monitor gate before the speakers
  const gain = { ...fakeNode(), gain: fakeParam(1) }
  const monitorGain = { ...fakeNode(), gain: fakeParam(1) }
  let gainsCreated = 0
  const micTrack = Object.assign(new EventTarget(), { stop: vi.fn() })
  const micStream = {
    getTracks: () => [micTrack],
    getAudioTracks: () => [micTrack],
  }
  const micSource = fakeNode()
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
    createGain: vi.fn(() => (gainsCreated++ === 0 ? gain : monitorGain)),
    createAnalyser: vi.fn(() => analyser),
    createMediaStreamSource: vi.fn(() => micSource),
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
    getUserMedia: vi.fn(() =>
      options.micError
        ? Promise.reject(Object.assign(new Error('mic'), { name: options.micError }))
        : Promise.resolve(micStream as unknown as MediaStream),
    ),
  }

  return {
    env,
    ctx,
    audio,
    analyser,
    gain,
    monitorGain,
    filters,
    source,
    micTrack,
    micSource,
  }
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

  it('reports isInitialized and emits initialized once', () => {
    const { env } = createFakes()
    const engine = new AudioEngine(env)
    const handler = vi.fn()
    engine.on('initialized', handler)

    expect(engine.isInitialized).toBe(false)
    engine.init()
    engine.init()

    expect(engine.isInitialized).toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('connects source → filters → gain → analyser → monitor → destination', () => {
    const { env, ctx, source, filters, gain, analyser, monitorGain } = createFakes()
    new AudioEngine(env).init()

    expect(source.connect).toHaveBeenCalledWith(filters[0])
    expect(filters[0].connect).toHaveBeenCalledWith(filters[1])
    expect(filters[1].connect).toHaveBeenCalledWith(filters[2])
    expect(filters[2].connect).toHaveBeenCalledWith(gain)
    expect(gain.connect).toHaveBeenCalledWith(analyser)
    expect(analyser.connect).toHaveBeenCalledWith(monitorGain)
    expect(monitorGain.connect).toHaveBeenCalledWith(ctx.destination)
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

  it('aborts a pending load when a newer one starts, leaving a single listener set', async () => {
    const { env, audio } = createFakes()
    const engine = new AudioEngine(env)
    const removeSpy = vi.spyOn(audio, 'removeEventListener')

    const stale = engine.loadFile(new File(['x'], 'stale.mp3'))
    const fresh = engine.loadFile(new File(['y'], 'fresh.mp3'))
    await expect(stale).rejects.toMatchObject({ code: 'aborted' })
    expect(removeSpy).toHaveBeenCalledWith('loadedmetadata', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('error', expect.any(Function))

    audio.dispatchEvent(new Event('loadedmetadata'))
    await expect(fresh).resolves.toMatchObject({ name: 'fresh' })
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
    engine.loadFile(new File(['x'], 'song.mp3')).catch(() => {})

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

describe('AudioEngine microphone', () => {
  it('connects the mic into the EQ chain and keeps it off the speakers by default', async () => {
    const { env, ctx, filters, micSource, monitorGain } = createFakes()
    const engine = new AudioEngine(env)

    const meta = await engine.useMicrophone()

    expect(ctx.createMediaStreamSource).toHaveBeenCalled()
    expect(micSource.connect).toHaveBeenCalledWith(filters[0])
    expect(monitorGain.gain.setValueAtTime).toHaveBeenLastCalledWith(0, 0)
    expect(engine.isMicActive).toBe(true)
    expect(meta).toMatchObject({ name: 'Microphone', source: 'mic', duration: 0 })
  })

  it('requests raw audio unless processing is asked for', async () => {
    const { env } = createFakes()
    const engine = new AudioEngine(env)

    await engine.useMicrophone()
    expect(env.getUserMedia).toHaveBeenLastCalledWith({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    })

    await engine.useMicrophone({ processing: true })
    expect(env.getUserMedia).toHaveBeenLastCalledWith({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
  })

  it('resumes the context from the click that asked for the mic', async () => {
    const { env, ctx } = createFakes()
    await new AudioEngine(env).useMicrophone()
    expect(ctx.resume).toHaveBeenCalled()
  })

  it('plays the mic through the speakers only while monitoring, following volume and mute', async () => {
    const { env, monitorGain } = createFakes()
    const engine = new AudioEngine(env)
    await engine.useMicrophone()
    const ramp = monitorGain.gain.setTargetAtTime

    engine.setMonitor(true)
    expect(ramp).toHaveBeenLastCalledWith(1, 0, expect.any(Number))

    engine.setVolume(0.4)
    expect(ramp).toHaveBeenLastCalledWith(0.4, 0, expect.any(Number))

    engine.setMuted(true)
    expect(ramp).toHaveBeenLastCalledWith(0, 0, expect.any(Number))

    engine.setMuted(false)
    engine.setMonitor(false)
    expect(ramp).toHaveBeenLastCalledWith(0, 0, expect.any(Number))
  })

  it('leaves the speaker gate open for files regardless of the monitor setting', () => {
    const { env, monitorGain } = createFakes()
    const engine = new AudioEngine(env)
    engine.init()

    engine.setMonitor(true)
    engine.setMonitor(false)

    expect(monitorGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 0, expect.any(Number))
  })

  it('stopMicrophone() stops every track, disconnects the source and reopens the speaker gate', async () => {
    const { env, micTrack, micSource, monitorGain } = createFakes()
    const engine = new AudioEngine(env)
    await engine.useMicrophone()

    engine.stopMicrophone()

    expect(micTrack.stop).toHaveBeenCalled()
    expect(micSource.disconnect).toHaveBeenCalled()
    expect(monitorGain.gain.setValueAtTime).toHaveBeenLastCalledWith(1, 0)
    expect(engine.isMicActive).toBe(false)
  })

  it('loading a file disconnects the mic', async () => {
    const { env, audio, micTrack } = createFakes()
    const engine = new AudioEngine(env)
    await engine.useMicrophone()

    const pending = engine.loadFile(new File(['x'], 'song.mp3'))
    audio.dispatchEvent(new Event('loadedmetadata'))
    await pending

    expect(micTrack.stop).toHaveBeenCalled()
    expect(engine.isMicActive).toBe(false)
  })

  it('unloads the file when the mic takes over', async () => {
    const { env, audio } = createFakes()
    const engine = new AudioEngine(env)
    const loading = engine.loadFile(new File(['x'], 'song.mp3'))
    audio.dispatchEvent(new Event('loadedmetadata'))
    await loading

    await engine.useMicrophone()

    expect(audio.pause).toHaveBeenCalled()
    expect(audio.removeAttribute).toHaveBeenCalledWith('src')
    expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
  })

  it('replacing a running mic releases the old stream', async () => {
    const { env, micTrack } = createFakes()
    const engine = new AudioEngine(env)
    await engine.useMicrophone()
    await engine.useMicrophone({ processing: true })

    expect(micTrack.stop).toHaveBeenCalledTimes(1)
    expect(engine.isMicActive).toBe(true)
  })

  it('discards a stream that arrives after the request was cancelled', async () => {
    const { env, micTrack } = createFakes()
    const engine = new AudioEngine(env)

    const pending = engine.useMicrophone()
    engine.stopMicrophone()

    await expect(pending).rejects.toMatchObject({ code: 'aborted' })
    expect(micTrack.stop).toHaveBeenCalled()
    expect(engine.isMicActive).toBe(false)
  })

  it('a pending file load survives a denied permission prompt', async () => {
    const { env, audio } = createFakes({ micError: 'NotAllowedError' })
    const engine = new AudioEngine(env)
    const loading = engine.loadFile(new File(['x'], 'song.mp3'))

    await expect(engine.useMicrophone()).rejects.toMatchObject({ code: 'mic-denied' })

    audio.dispatchEvent(new Event('loadedmetadata'))
    await expect(loading).resolves.toMatchObject({ name: 'song' })
  })

  it.each([
    ['NotAllowedError', 'mic-denied'],
    ['SecurityError', 'mic-denied'],
    ['NotFoundError', 'mic-no-device'],
    ['OverconstrainedError', 'mic-no-device'],
    ['NotSupportedError', 'mic-unsupported'],
    ['TypeError', 'mic-unsupported'],
    ['NotReadableError', 'mic-failed'],
    ['SomethingElse', 'mic-failed'],
  ])('maps a %s rejection to %s', async (name, code) => {
    const { env } = createFakes({ micError: name })
    const engine = new AudioEngine(env)

    await expect(engine.useMicrophone()).rejects.toMatchObject({ code })
    expect(engine.isMicActive).toBe(false)
  })

  it('stops itself and emits micended when the device disappears', async () => {
    const { env, micTrack } = createFakes()
    const engine = new AudioEngine(env)
    const handler = vi.fn()
    engine.on('micended', handler)
    await engine.useMicrophone()

    micTrack.dispatchEvent(new Event('ended'))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(micTrack.stop).toHaveBeenCalled()
    expect(engine.isMicActive).toBe(false)
  })

  it('dispose() releases the microphone', async () => {
    const { env, micTrack } = createFakes()
    const engine = new AudioEngine(env)
    await engine.useMicrophone()

    engine.dispose()

    expect(micTrack.stop).toHaveBeenCalled()
    expect(engine.isMicActive).toBe(false)
  })
})
