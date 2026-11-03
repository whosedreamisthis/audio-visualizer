import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { readBoolean, isRecord } from '@/lib/sanitize'
import { getSafeStorage } from '@/lib/safeStorage'

export type ControlTab = 'mixer' | 'eq' | 'visual' | 'presets'

interface UiData {
  /** Desktop sidebar expanded (persisted). */
  sidebarOpen: boolean
  /** Controls sheet open on tablet and mobile. */
  controlsOpen: boolean
  /** "Load a track or pick a preset" card shown over the visualizer. */
  sourcePickerOpen: boolean
  activeTab: ControlTab
  fullscreen: boolean
  /** Auto-hide state for the player bar and header in fullscreen. */
  controlsVisible: boolean
}

interface UiActions {
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setControlsOpen: (open: boolean) => void
  setSourcePickerOpen: (open: boolean) => void
  setActiveTab: (tab: ControlTab) => void
  setFullscreen: (fullscreen: boolean) => void
  setControlsVisible: (visible: boolean) => void
}

export type UiState = UiData & UiActions

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      controlsOpen: false,
      sourcePickerOpen: false,
      activeTab: 'mixer',
      fullscreen: false,
      controlsVisible: true,

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setControlsOpen: (controlsOpen) => set({ controlsOpen }),
      setSourcePickerOpen: (sourcePickerOpen) => set({ sourcePickerOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setFullscreen: (fullscreen) => set({ fullscreen }),
      setControlsVisible: (controlsVisible) => set({ controlsVisible }),
    }),
    {
      name: 'av-ui',
      version: 1,
      storage: createJSONStorage(getSafeStorage),
      partialize: (s) => ({ sidebarOpen: s.sidebarOpen }),
      migrate: (persisted) => ({
        sidebarOpen: readBoolean(
          isRecord(persisted) ? persisted.sidebarOpen : undefined,
          true,
        ),
      }),
      merge: (persisted, current) => ({
        ...current,
        sidebarOpen: readBoolean(
          isRecord(persisted) ? persisted.sidebarOpen : undefined,
          current.sidebarOpen,
        ),
      }),
    },
  ),
)
