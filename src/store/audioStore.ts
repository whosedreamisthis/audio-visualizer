import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'
import {
  EQ_BANDS,
  EQ_FLAT,
  EQ_RANGE_DB,
  GAIN,
  SPEED,
  VOLUME,
} from '@/lib/constants'
import type { EqPreset } from '@/lib/eqPresets'
import { clamp } from '@/lib/math'
import { isRecord, readBoolean, readNumber } from '@/lib/sanitize'
import { getSafeStorage } from '@/lib/safeStorage'
import type { EqBandId } from '@/types'

export interface AudioSettings {
  /** UI volume, 0..1 (applied to the media element). */
  volume: number
  muted: boolean
  /** Master gain, 0..2 (applied to the gain node). */
  gain: number
  speed: number
  preservePitch: boolean
  /** Per-band gain in dB. */
  eq: Record<EqBandId, number>
  eqBypass: boolean
}

interface AudioActions {
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  setGain: (gain: number) => void
  setSpeed: (speed: number) => void
  setPreservePitch: (preserve: boolean) => void
  setEqBand: (band: EqBandId, db: number) => void
  resetEq: () => void
  applyEqPreset: (preset: EqPreset) => void
  setEqBypass: (bypass: boolean) => void
}

export type AudioState = AudioSettings & AudioActions

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: VOLUME.default,
  muted: false,
  gain: GAIN.default,
  speed: SPEED.default,
  preservePitch: true,
  eq: EQ_FLAT,
  eqBypass: false,
}

const clampDb = (db: number) => clamp(db, EQ_RANGE_DB.min, EQ_RANGE_DB.max)

/** Build valid settings from untrusted data (old versions, corrupted storage). */
export function sanitizeAudioSettings(raw: unknown): AudioSettings {
  const d = DEFAULT_AUDIO_SETTINGS
  const source = isRecord(raw) ? raw : {}
  const eqSource = isRecord(source.eq) ? source.eq : {}

  const eq = { ...EQ_FLAT }
  for (const band of EQ_BANDS) {
    eq[band.id] = readNumber(
      eqSource[band.id],
      EQ_RANGE_DB.min,
      EQ_RANGE_DB.max,
      d.eq[band.id],
    )
  }

  return {
    volume: readNumber(source.volume, VOLUME.min, VOLUME.max, d.volume),
    muted: readBoolean(source.muted, d.muted),
    gain: readNumber(source.gain, GAIN.min, GAIN.max, d.gain),
    speed: readNumber(source.speed, SPEED.min, SPEED.max, d.speed),
    preservePitch: readBoolean(source.preservePitch, d.preservePitch),
    eq,
    eqBypass: readBoolean(source.eqBypass, d.eqBypass),
  }
}

export function pickAudioSettings(state: AudioSettings): AudioSettings {
  return {
    volume: state.volume,
    muted: state.muted,
    gain: state.gain,
    speed: state.speed,
    preservePitch: state.preservePitch,
    eq: state.eq,
    eqBypass: state.eqBypass,
  }
}

export const useAudioStore = create<AudioState>()(
  subscribeWithSelector(
    persist<
      AudioState,
      [['zustand/subscribeWithSelector', never]],
      [],
      AudioSettings
    >(
      (set) => ({
        ...DEFAULT_AUDIO_SETTINGS,

        setVolume: (volume) =>
          set({ volume: clamp(volume, VOLUME.min, VOLUME.max) }),
        setMuted: (muted) => set({ muted }),
        toggleMute: () => set((s) => ({ muted: !s.muted })),
        setGain: (gain) => set({ gain: clamp(gain, GAIN.min, GAIN.max) }),
        setSpeed: (speed) => set({ speed: clamp(speed, SPEED.min, SPEED.max) }),
        setPreservePitch: (preservePitch) => set({ preservePitch }),
        setEqBand: (band, db) =>
          set((s) => ({ eq: { ...s.eq, [band]: clampDb(db) } })),
        resetEq: () => set({ eq: { ...EQ_FLAT } }),
        applyEqPreset: (preset) =>
          set({
            eq: {
              low: clampDb(preset.bands.low),
              mid: clampDb(preset.bands.mid),
              high: clampDb(preset.bands.high),
            },
          }),
        setEqBypass: (eqBypass) => set({ eqBypass }),
      }),
      {
        name: 'av-audio',
        version: 1,
        storage: createJSONStorage(getSafeStorage),
        partialize: pickAudioSettings,
        migrate: (persisted) => sanitizeAudioSettings(persisted),
        merge: (persisted, current) => ({
          ...current,
          ...sanitizeAudioSettings(persisted),
        }),
      },
    ),
  ),
)
