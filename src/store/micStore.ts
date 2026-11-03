import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

/**
 * Outcome of the last microphone attempt, seeded from the Permissions API when available.
 * `prompt` means the browser will ask on the next attempt.
 */
export type MicStatus =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'no-device'
  | 'unsupported'
  | 'failed'

interface MicData {
  status: MicStatus
  /** Play the mic through the speakers. Never persisted: feedback is a risk, so it starts off. */
  monitor: boolean
  /** Browser echo cancellation, noise suppression and auto gain. Off by default for accurate visuals. */
  processing: boolean
}

interface MicActions {
  setStatus: (status: MicStatus) => void
  setMonitor: (monitor: boolean) => void
  setProcessing: (processing: boolean) => void
}

export type MicState = MicData & MicActions

export const useMicStore = create<MicState>()(
  subscribeWithSelector((set) => ({
    status: 'prompt',
    monitor: false,
    processing: false,

    setStatus: (status) => set({ status }),
    setMonitor: (monitor) => set({ monitor }),
    setProcessing: (processing) => set({ processing }),
  })),
)
