import { beforeEach, describe, expect, it } from 'vitest'
import { EQ_PRESETS } from '@/lib/eqPresets'
import {
  DEFAULT_AUDIO_SETTINGS,
  pickAudioSettings,
  sanitizeAudioSettings,
  useAudioStore,
} from './audioStore'

beforeEach(() => {
  useAudioStore.setState(useAudioStore.getInitialState())
})

describe('audio store setters', () => {
  it('clamps volume, gain and speed', () => {
    const s = useAudioStore.getState()
    s.setVolume(5)
    s.setGain(-1)
    s.setSpeed(10)
    expect(useAudioStore.getState()).toMatchObject({ volume: 1, gain: 0, speed: 2 })
  })

  it('clamps EQ bands to ±12 dB and leaves other bands alone', () => {
    useAudioStore.getState().setEqBand('low', 40)
    useAudioStore.getState().setEqBand('high', -40)
    expect(useAudioStore.getState().eq).toEqual({ low: 12, mid: 0, high: -12 })
  })

  it('toggles mute', () => {
    useAudioStore.getState().toggleMute()
    expect(useAudioStore.getState().muted).toBe(true)
    useAudioStore.getState().toggleMute()
    expect(useAudioStore.getState().muted).toBe(false)
  })

  it('applies every EQ preset and resets to flat', () => {
    for (const preset of EQ_PRESETS) {
      useAudioStore.getState().applyEqPreset(preset)
      expect(useAudioStore.getState().eq).toEqual(preset.bands)
    }
    useAudioStore.getState().resetEq()
    expect(useAudioStore.getState().eq).toEqual({ low: 0, mid: 0, high: 0 })
  })

  it('does not mutate the shared default EQ object', () => {
    useAudioStore.getState().setEqBand('mid', 5)
    expect(DEFAULT_AUDIO_SETTINGS.eq).toEqual({ low: 0, mid: 0, high: 0 })
  })
})

describe('sanitizeAudioSettings', () => {
  it('returns defaults for garbage input', () => {
    for (const raw of [null, undefined, 42, 'x', [], {}]) {
      expect(sanitizeAudioSettings(raw)).toEqual(DEFAULT_AUDIO_SETTINGS)
    }
  })

  it('clamps out-of-range numbers and ignores wrong types', () => {
    const result = sanitizeAudioSettings({
      volume: 9,
      gain: 'loud',
      speed: Number.NaN,
      muted: 'yes',
      eq: { low: 99, mid: 'x' },
    })
    expect(result.volume).toBe(1)
    expect(result.gain).toBe(DEFAULT_AUDIO_SETTINGS.gain)
    expect(result.speed).toBe(DEFAULT_AUDIO_SETTINGS.speed)
    expect(result.muted).toBe(false)
    expect(result.eq).toEqual({ low: 12, mid: 0, high: 0 })
  })

  it('keeps valid values', () => {
    const valid = {
      volume: 0.3,
      muted: true,
      gain: 1.5,
      speed: 1.25,
      preservePitch: false,
      eq: { low: 3, mid: -2, high: 1.5 },
      eqBypass: true,
    }
    expect(sanitizeAudioSettings(valid)).toEqual(valid)
  })
})

describe('audio store persistence', () => {
  it('persists settings only (no action functions or transient state)', () => {
    const picked = pickAudioSettings(useAudioStore.getState())
    expect(Object.keys(picked).sort()).toEqual(
      ['eq', 'eqBypass', 'gain', 'muted', 'preservePitch', 'speed', 'volume'].sort(),
    )
  })

  it('migrates old or corrupted persisted data to valid settings', async () => {
    const options = useAudioStore.persist.getOptions()
    const migrated = await options.migrate?.({ gain: 99, junk: true }, 0)
    expect(migrated).toMatchObject({ gain: 2 })
    expect(migrated).not.toHaveProperty('junk')
  })

  it('merges persisted data without losing actions', () => {
    const options = useAudioStore.persist.getOptions()
    const current = useAudioStore.getState()
    const merged = options.merge?.({ gain: 1.5, volume: 'bad' }, current) as typeof current
    expect(merged.gain).toBe(1.5)
    expect(merged.volume).toBe(DEFAULT_AUDIO_SETTINGS.volume)
    expect(typeof merged.setGain).toBe('function')
  })
})
