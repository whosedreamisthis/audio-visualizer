import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_VISUALIZER_SETTINGS } from '@/lib/constants'
import {
  DEFAULT_VISUALIZER_PREFS,
  sanitizeVisualizerPrefs,
  sanitizeVisualizerSettings,
  useVisualizerStore,
} from './visualizerStore'

beforeEach(() => {
  useVisualizerStore.setState(useVisualizerStore.getInitialState())
})

describe('visualizer store', () => {
  it('sets mode and theme', () => {
    useVisualizerStore.getState().setMode('particles')
    useVisualizerStore.getState().setTheme('aurora')
    expect(useVisualizerStore.getState()).toMatchObject({
      mode: 'particles',
      themeId: 'aurora',
    })
  })

  it('merges and clamps settings patches', () => {
    useVisualizerStore.getState().updateSettings({ barCount: 9999, smoothing: -1 })
    const { settings } = useVisualizerStore.getState()
    expect(settings.barCount).toBe(128)
    expect(settings.smoothing).toBe(0)
    expect(settings.fftSize).toBe(DEFAULT_VISUALIZER_SETTINGS.fftSize)
  })

  it('rounds integer settings and rejects invalid FFT sizes', () => {
    useVisualizerStore.getState().updateSettings({ barCount: 40.6 })
    // @ts-expect-error 1000 is not a valid FFT size
    useVisualizerStore.getState().updateSettings({ fftSize: 1000 })
    const { settings } = useVisualizerStore.getState()
    expect(settings.barCount).toBe(41)
    expect(settings.fftSize).toBe(2048)
  })

  it('resets settings to defaults', () => {
    useVisualizerStore.getState().updateSettings({ glow: true, particleCount: 200 })
    useVisualizerStore.getState().resetSettings()
    expect(useVisualizerStore.getState().settings).toEqual(DEFAULT_VISUALIZER_SETTINGS)
  })
})

describe('sanitizeVisualizerSettings / sanitizeVisualizerPrefs', () => {
  it('falls back to defaults for garbage', () => {
    expect(sanitizeVisualizerPrefs(null)).toEqual(DEFAULT_VISUALIZER_PREFS)
    expect(sanitizeVisualizerPrefs({ mode: 'disco', themeId: 7, settings: 'x' })).toEqual(
      DEFAULT_VISUALIZER_PREFS,
    )
  })

  it('keeps valid values and clamps the rest', () => {
    const prefs = sanitizeVisualizerPrefs({
      mode: 'waveform',
      themeId: 'ocean',
      settings: { fftSize: 4096, sensitivity: 99, glow: true },
    })
    expect(prefs.mode).toBe('waveform')
    expect(prefs.themeId).toBe('ocean')
    expect(prefs.settings).toMatchObject({ fftSize: 4096, sensitivity: 3, glow: true })
  })

  it('uses the supplied base for missing fields', () => {
    const base = { ...DEFAULT_VISUALIZER_SETTINGS, mirror: false }
    expect(sanitizeVisualizerSettings({}, base).mirror).toBe(false)
  })
})
