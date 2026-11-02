import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { clamp } from '@/lib/math'
import type { TrackMeta } from '@/types'

export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'error'

interface PlaybackData {
  status: PlaybackStatus
  track: TrackMeta | null
  /** Throttled; only the seek bar and time display should subscribe. */
  currentTime: number
  duration: number
  loop: boolean
  error: string | null
}

interface PlaybackActions {
  setTrack: (track: TrackMeta | null) => void
  setStatus: (status: PlaybackStatus) => void
  setTime: (seconds: number) => void
  setDuration: (seconds: number) => void
  setLoop: (loop: boolean) => void
  toggleLoop: () => void
  /** Records an error message and moves to the `error` status; `null` clears it. */
  setError: (message: string | null) => void
  reset: () => void
}

export type PlaybackState = PlaybackData & PlaybackActions

const initialData: PlaybackData = {
  status: 'idle',
  track: null,
  currentTime: 0,
  duration: 0,
  loop: false,
  error: null,
}

function safeDuration(seconds: number): number {
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0
}

export const usePlaybackStore = create<PlaybackState>()(
  subscribeWithSelector((set, get) => ({
    ...initialData,

    setTrack: (track) =>
      set({
        track,
        status: track ? 'ready' : 'idle',
        currentTime: 0,
        duration: track ? safeDuration(track.duration) : 0,
        error: null,
      }),
    setStatus: (status) => set({ status }),
    setTime: (seconds) =>
      set({ currentTime: clamp(seconds, 0, get().duration || Infinity) }),
    setDuration: (seconds) => set({ duration: safeDuration(seconds) }),
    setLoop: (loop) => set({ loop }),
    toggleLoop: () => set((s) => ({ loop: !s.loop })),
    setError: (message) =>
      set(
        message === null
          ? { error: null }
          : { error: message, status: 'error' },
      ),
    // `loop` is a user preference, so it survives a reset
    reset: () => set({ ...initialData, loop: get().loop }),
  })),
)
