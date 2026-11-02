import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'
import {
  BAR_COUNT,
  DEFAULT_VISUALIZER_SETTINGS,
  FFT_SIZES,
  LINE_WIDTH,
  PARTICLE_COUNT,
  SENSITIVITY,
  SMOOTHING,
  THEME_IDS,
  VISUALIZER_MODES,
} from '@/lib/constants'
import { isRecord, readBoolean, readNumber, readOneOf } from '@/lib/sanitize'
import { getSafeStorage } from '@/lib/safeStorage'
import type { ThemeId, VisualizerMode, VisualizerSettings } from '@/types'

export interface VisualizerPrefs {
  mode: VisualizerMode
  themeId: ThemeId
  settings: VisualizerSettings
}

interface VisualizerActions {
  setMode: (mode: VisualizerMode) => void
  setTheme: (themeId: ThemeId) => void
  updateSettings: (patch: Partial<VisualizerSettings>) => void
  resetSettings: () => void
}

export type VisualizerState = VisualizerPrefs & VisualizerActions

export const DEFAULT_VISUALIZER_PREFS: VisualizerPrefs = {
  mode: 'bars',
  themeId: 'neon',
  settings: DEFAULT_VISUALIZER_SETTINGS,
}

/** Merge a (possibly partial or invalid) patch into settings, clamping every field. */
export function sanitizeVisualizerSettings(
  raw: unknown,
  base: VisualizerSettings = DEFAULT_VISUALIZER_SETTINGS,
): VisualizerSettings {
  const s = isRecord(raw) ? raw : {}
  return {
    fftSize: readOneOf(s.fftSize, FFT_SIZES, base.fftSize),
    smoothing: readNumber(s.smoothing, SMOOTHING.min, SMOOTHING.max, base.smoothing),
    sensitivity: readNumber(s.sensitivity, SENSITIVITY.min, SENSITIVITY.max, base.sensitivity),
    barCount: Math.round(readNumber(s.barCount, BAR_COUNT.min, BAR_COUNT.max, base.barCount)),
    particleCount: Math.round(
      readNumber(s.particleCount, PARTICLE_COUNT.min, PARTICLE_COUNT.max, base.particleCount),
    ),
    lineWidth: readNumber(s.lineWidth, LINE_WIDTH.min, LINE_WIDTH.max, base.lineWidth),
    glow: readBoolean(s.glow, base.glow),
    mirror: readBoolean(s.mirror, base.mirror),
  }
}

/** Build valid preferences from untrusted data (old versions, corrupted storage). */
export function sanitizeVisualizerPrefs(raw: unknown): VisualizerPrefs {
  const d = DEFAULT_VISUALIZER_PREFS
  const source = isRecord(raw) ? raw : {}
  return {
    mode: readOneOf(source.mode, VISUALIZER_MODES, d.mode),
    themeId: readOneOf(source.themeId, THEME_IDS, d.themeId),
    settings: sanitizeVisualizerSettings(source.settings),
  }
}

export function pickVisualizerPrefs(state: VisualizerPrefs): VisualizerPrefs {
  return { mode: state.mode, themeId: state.themeId, settings: state.settings }
}

export const useVisualizerStore = create<VisualizerState>()(
  subscribeWithSelector(
    persist<
      VisualizerState,
      [['zustand/subscribeWithSelector', never]],
      [],
      VisualizerPrefs
    >(
      (set) => ({
        ...DEFAULT_VISUALIZER_PREFS,

        setMode: (mode) => set({ mode }),
        setTheme: (themeId) => set({ themeId }),
        updateSettings: (patch) =>
          set((s) => ({
            settings: sanitizeVisualizerSettings({ ...s.settings, ...patch }, s.settings),
          })),
        resetSettings: () => set({ settings: DEFAULT_VISUALIZER_SETTINGS }),
      }),
      {
        name: 'av-visualizer',
        version: 1,
        storage: createJSONStorage(getSafeStorage),
        partialize: pickVisualizerPrefs,
        migrate: (persisted) => sanitizeVisualizerPrefs(persisted),
        merge: (persisted, current) => ({
          ...current,
          ...sanitizeVisualizerPrefs(persisted),
        }),
      },
    ),
  ),
)
