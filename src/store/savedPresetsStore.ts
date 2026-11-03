import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_VISUALIZER_SETTINGS,
  EQ_BANDS,
  EQ_FLAT,
  EQ_RANGE_DB,
  GAIN,
  SPEED,
  THEME_IDS,
  VISUALIZER_MODES,
} from '@/lib/constants'
import { isRecord, readNumber, readOneOf } from '@/lib/sanitize'
import { getSafeStorage } from '@/lib/safeStorage'
import type { EqBandId, ThemeId, VisualizerMode, VisualizerSettings } from '@/types'
import { useAudioStore } from './audioStore'
import { sanitizeVisualizerSettings, useVisualizerStore } from './visualizerStore'

export const MAX_SAVED_PRESETS = 20
export const MAX_PRESET_NAME_LENGTH = 40

export interface SavedPreset {
  id: string
  name: string
  eq: Record<EqBandId, number>
  gain: number
  speed: number
  themeId: ThemeId
  mode: VisualizerMode
  settings: VisualizerSettings
  createdAt: number
}

export type PresetResult = { ok: true; id: string } | { ok: false; error: string }

interface SavedPresetsData {
  presets: SavedPreset[]
}

interface SavedPresetsActions {
  /** Snapshot the current audio and visualizer settings under `name`. */
  add: (name: string) => PresetResult
  rename: (id: string, name: string) => PresetResult
  remove: (id: string) => void
  /** Restore a preset into the audio, visualizer and theme stores. */
  apply: (id: string) => boolean
  /** Insert already-validated presets (import), skipping duplicates and respecting the cap. */
  addMany: (presets: SavedPreset[]) => number
}

export type SavedPresetsState = SavedPresetsData & SavedPresetsActions

/** Trimmed name, or an error message when it is empty, too long or already used. */
export function validatePresetName(
  name: string,
  existing: readonly SavedPreset[],
  ignoreId?: string,
): { ok: true; name: string } | { ok: false; error: string } {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Enter a name.' }
  if (trimmed.length > MAX_PRESET_NAME_LENGTH) {
    return { ok: false, error: `Use ${MAX_PRESET_NAME_LENGTH} characters or fewer.` }
  }
  const lower = trimmed.toLowerCase()
  if (existing.some((p) => p.id !== ignoreId && p.name.toLowerCase() === lower)) {
    return { ok: false, error: 'A preset with that name already exists.' }
  }
  return { ok: true, name: trimmed }
}

/** A valid preset from untrusted data, or null when it is not salvageable. */
export function sanitizeSavedPreset(raw: unknown): SavedPreset | null {
  if (!isRecord(raw)) return null
  if (typeof raw.id !== 'string' || !raw.id) return null
  if (typeof raw.name !== 'string') return null
  const name = raw.name.trim().slice(0, MAX_PRESET_NAME_LENGTH)
  if (!name) return null

  const eqSource = isRecord(raw.eq) ? raw.eq : {}
  const eq = { ...EQ_FLAT }
  for (const band of EQ_BANDS) {
    eq[band.id] = readNumber(eqSource[band.id], EQ_RANGE_DB.min, EQ_RANGE_DB.max, 0)
  }

  return {
    id: raw.id,
    name,
    eq,
    gain: readNumber(raw.gain, GAIN.min, GAIN.max, GAIN.default),
    speed: readNumber(raw.speed, SPEED.min, SPEED.max, SPEED.default),
    themeId: readOneOf(raw.themeId, THEME_IDS, 'neon'),
    mode: readOneOf(raw.mode, VISUALIZER_MODES, 'bars'),
    settings: sanitizeVisualizerSettings(raw.settings, DEFAULT_VISUALIZER_SETTINGS),
    createdAt: readNumber(raw.createdAt, 0, Number.MAX_SAFE_INTEGER, 0),
  }
}

/** Valid, unique-id, unique-name presets from untrusted data, capped at the maximum. */
export function sanitizePresetList(raw: unknown): SavedPreset[] {
  if (!Array.isArray(raw)) return []
  const result: SavedPreset[] = []
  const ids = new Set<string>()
  const names = new Set<string>()
  for (const item of raw) {
    const preset = sanitizeSavedPreset(item)
    if (!preset) continue
    const key = preset.name.toLowerCase()
    if (ids.has(preset.id) || names.has(key)) continue
    ids.add(preset.id)
    names.add(key)
    result.push(preset)
    if (result.length >= MAX_SAVED_PRESETS) break
  }
  return result
}

/** Parse an exported JSON file. Throws a readable Error when it is not a preset export. */
export function parsePresetImport(text: string): SavedPreset[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const list = Array.isArray(data) ? data : isRecord(data) ? data.presets : undefined
  if (!Array.isArray(list)) throw new Error('No presets found in that file.')
  const presets = sanitizePresetList(list)
  if (presets.length === 0) throw new Error('No valid presets found in that file.')
  return presets
}

export function serializePresets(presets: readonly SavedPreset[]): string {
  return JSON.stringify({ app: 'audio-visualizer', version: 1, presets }, null, 2)
}

function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

export const useSavedPresetsStore = create<SavedPresetsState>()(
  persist<SavedPresetsState, [], [], SavedPresetsData>(
    (set, get) => ({
      presets: [],

      add: (name) => {
        const { presets } = get()
        if (presets.length >= MAX_SAVED_PRESETS) {
          return { ok: false, error: `You can save up to ${MAX_SAVED_PRESETS} presets.` }
        }
        const checked = validatePresetName(name, presets)
        if (!checked.ok) return checked

        const audio = useAudioStore.getState()
        const visual = useVisualizerStore.getState()
        const preset: SavedPreset = {
          id: newId(),
          name: checked.name,
          eq: { ...audio.eq },
          gain: audio.gain,
          speed: audio.speed,
          themeId: visual.themeId,
          mode: visual.mode,
          settings: { ...visual.settings },
          createdAt: Date.now(),
        }
        set({ presets: [...presets, preset] })
        return { ok: true, id: preset.id }
      },

      rename: (id, name) => {
        const { presets } = get()
        if (!presets.some((p) => p.id === id)) return { ok: false, error: 'Preset not found.' }
        const checked = validatePresetName(name, presets, id)
        if (!checked.ok) return checked
        set({ presets: presets.map((p) => (p.id === id ? { ...p, name: checked.name } : p)) })
        return { ok: true, id }
      },

      remove: (id) => set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),

      apply: (id) => {
        const preset = get().presets.find((p) => p.id === id)
        if (!preset) return false
        useAudioStore.setState({
          gain: preset.gain,
          speed: preset.speed,
          eq: { ...preset.eq },
        })
        useVisualizerStore.setState({
          mode: preset.mode,
          themeId: preset.themeId,
          settings: { ...preset.settings },
        })
        return true
      },

      addMany: (incoming) => {
        const merged = [...get().presets]
        let added = 0
        for (const preset of incoming) {
          if (merged.length >= MAX_SAVED_PRESETS) break
          const taken = merged.some(
            (p) => p.id === preset.id || p.name.toLowerCase() === preset.name.toLowerCase(),
          )
          if (taken) continue
          merged.push(preset)
          added++
        }
        set({ presets: merged })
        return added
      },
    }),
    {
      name: 'av-presets',
      version: 1,
      storage: createJSONStorage(getSafeStorage),
      partialize: (s) => ({ presets: s.presets }),
      migrate: (persisted) => ({
        presets: sanitizePresetList(isRecord(persisted) ? persisted.presets : undefined),
      }),
      merge: (persisted, current) => ({
        ...current,
        presets: sanitizePresetList(isRecord(persisted) ? persisted.presets : undefined),
      }),
    },
  ),
)
