import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_VISUALIZER_SETTINGS } from '@/lib/constants'
import { resetAllSettings } from '@/lib/resetSettings'
import { getSafeStorage } from '@/lib/safeStorage'
import { useAudioStore } from './audioStore'
import {
  MAX_PRESET_NAME_LENGTH,
  MAX_SAVED_PRESETS,
  parsePresetImport,
  sanitizePresetList,
  serializePresets,
  useSavedPresetsStore,
  validatePresetName,
} from './savedPresetsStore'
import { useVisualizerStore } from './visualizerStore'

const store = () => useSavedPresetsStore.getState()

function idOf(result: ReturnType<typeof store>['add'] extends (n: string) => infer R ? R : never) {
  if (!result.ok) throw new Error(result.error)
  return result.id
}

beforeEach(() => {
  useSavedPresetsStore.setState({ presets: [] })
  useAudioStore.setState(useAudioStore.getInitialState())
  useVisualizerStore.setState(useVisualizerStore.getInitialState())
})

describe('validatePresetName', () => {
  it('rejects empty and whitespace names', () => {
    expect(validatePresetName('   ', []).ok).toBe(false)
  })

  it('rejects duplicates case-insensitively but allows the preset own name', () => {
    store().add('Bass')
    const [preset] = store().presets
    expect(validatePresetName('bass', store().presets).ok).toBe(false)
    expect(validatePresetName('BASS', store().presets, preset.id).ok).toBe(true)
  })

  it('trims the name', () => {
    expect(validatePresetName('  Hi  ', [])).toEqual({ ok: true, name: 'Hi' })
  })
})

describe('saved presets store', () => {
  it('adds a snapshot of current settings', () => {
    useAudioStore.getState().setGain(1.5)
    useAudioStore.getState().setEqBand('low', 6)
    useVisualizerStore.getState().setMode('particles')
    useVisualizerStore.getState().setTheme('sunset')
    expect(store().add('Mine').ok).toBe(true)
    expect(store().presets[0]).toMatchObject({
      name: 'Mine',
      gain: 1.5,
      mode: 'particles',
      themeId: 'sunset',
      eq: { low: 6, mid: 0, high: 0 },
    })
  })

  it('renames and rejects duplicate names', () => {
    const a = idOf(store().add('A'))
    store().add('B')
    expect(store().rename(a, 'B').ok).toBe(false)
    expect(store().rename(a, 'C').ok).toBe(true)
    expect(store().presets[0].name).toBe('C')
  })

  it('removes a preset', () => {
    const id = idOf(store().add('A'))
    store().remove(id)
    expect(store().presets).toHaveLength(0)
  })

  it('enforces the maximum', () => {
    for (let i = 0; i < MAX_SAVED_PRESETS; i++) expect(store().add(`P${i}`).ok).toBe(true)
    expect(store().add('One too many').ok).toBe(false)
    expect(store().presets).toHaveLength(MAX_SAVED_PRESETS)
  })

  it('apply restores everything after settings change', () => {
    useAudioStore.getState().setGain(1.5)
    useAudioStore.getState().setSpeed(1.25)
    useAudioStore.getState().setEqBand('high', -4)
    useVisualizerStore.getState().setMode('waveform')
    useVisualizerStore.getState().setTheme('ocean')
    useVisualizerStore.getState().updateSettings({ glow: false, barCount: 40 })
    const id = idOf(store().add('Snap'))

    resetAllSettings()
    expect(useAudioStore.getState().gain).toBe(1)

    expect(store().apply(id)).toBe(true)
    expect(useAudioStore.getState()).toMatchObject({
      gain: 1.5,
      speed: 1.25,
      eq: { low: 0, mid: 0, high: -4 },
    })
    expect(useVisualizerStore.getState()).toMatchObject({ mode: 'waveform', themeId: 'ocean' })
    expect(useVisualizerStore.getState().settings).toMatchObject({ glow: false, barCount: 40 })
  })

  it('apply returns false for an unknown id', () => {
    expect(store().apply('nope')).toBe(false)
  })

  it('addMany skips duplicates and respects the cap', () => {
    store().add('A')
    const incoming = sanitizePresetList([
      { ...store().presets[0] },
      { ...store().presets[0], id: 'x', name: 'a' },
      { ...store().presets[0], id: 'y', name: 'New' },
    ])
    expect(store().addMany(incoming)).toBe(1)
    expect(store().presets.map((p) => p.name)).toEqual(['A', 'New'])
  })
})

describe('resetAllSettings', () => {
  it('restores defaults without touching saved presets', () => {
    store().add('Keep')
    useAudioStore.getState().setGain(1.8)
    useVisualizerStore.getState().setMode('particles')
    resetAllSettings()
    expect(useAudioStore.getState().gain).toBe(1)
    expect(useVisualizerStore.getState().mode).toBe('bars')
    expect(useVisualizerStore.getState().settings).toEqual(DEFAULT_VISUALIZER_SETTINGS)
    expect(store().presets).toHaveLength(1)
  })
})

describe('import validation', () => {
  it('round-trips an export', () => {
    store().add('A')
    expect(parsePresetImport(serializePresets(store().presets))).toEqual(store().presets)
  })

  it('rejects malformed data', () => {
    expect(() => parsePresetImport('not json')).toThrow()
    expect(() => parsePresetImport('{"presets": 5}')).toThrow()
    expect(() => parsePresetImport('[1, null, {"name": ""}]')).toThrow()
  })

  it('clamps out-of-range values and drops bad entries', () => {
    const list = parsePresetImport(
      JSON.stringify([
        { id: 'a', name: 'Loud', gain: 99, speed: 'fast', mode: 'nope', eq: { low: 50 } },
        { id: 'b' },
      ]),
    )
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ gain: 2, speed: 1, mode: 'bars', eq: { low: 12, mid: 0, high: 0 } })
  })
})

describe('sanitizePresetList', () => {
  const base = { id: 'a', name: 'A' }

  it('returns an empty list for non-arrays', () => {
    for (const raw of [null, undefined, 5, 'x', {}]) expect(sanitizePresetList(raw)).toEqual([])
  })

  it('drops duplicate ids and names (case-insensitive)', () => {
    const list = sanitizePresetList([
      base,
      { ...base, name: 'Other' },
      { id: 'b', name: 'a' },
      { id: 'c', name: 'C' },
    ])
    expect(list.map((p) => p.id)).toEqual(['a', 'c'])
  })

  it('caps the list at the maximum', () => {
    const many = Array.from({ length: MAX_SAVED_PRESETS + 5 }, (_, i) => ({
      id: `id${i}`,
      name: `N${i}`,
    }))
    expect(sanitizePresetList(many)).toHaveLength(MAX_SAVED_PRESETS)
  })

  it('truncates long names and rejects blank ones', () => {
    const [long] = sanitizePresetList([{ id: 'a', name: 'x'.repeat(100) }])
    expect(long.name).toHaveLength(MAX_PRESET_NAME_LENGTH)
    expect(sanitizePresetList([{ id: 'a', name: '   ' }])).toEqual([])
  })
})

describe('name edge cases', () => {
  it('rejects names over the length limit', () => {
    expect(validatePresetName('x'.repeat(MAX_PRESET_NAME_LENGTH + 1), []).ok).toBe(false)
  })

  it('rename fails for an unknown id', () => {
    expect(store().rename('missing', 'Name').ok).toBe(false)
  })
})

describe('persistence', () => {
  it('writes presets to av-presets storage', () => {
    store().add('Stored')
    const raw = getSafeStorage().getItem('av-presets')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state.presets[0].name).toBe('Stored')
  })

  it('uses the av-presets key and falls back safely on bad data', async () => {
    const options = useSavedPresetsStore.persist.getOptions()
    expect(options.name).toBe('av-presets')
    expect(await options.migrate?.({ presets: 'garbage' }, 0)).toEqual({ presets: [] })
    expect(await options.migrate?.(null, 0)).toEqual({ presets: [] })
    const merged = options.merge?.({ presets: [{ id: 1 }] }, useSavedPresetsStore.getState())
    expect(merged?.presets).toEqual([])
    expect(typeof merged?.add).toBe('function')
  })
})
