import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './uiStore'

beforeEach(() => {
  useUiStore.setState({
    fpsVisible: false,
    qualityReduced: false,
    highQualityOverride: false,
  })
})

describe('uiStore performance state', () => {
  it('toggles the fps meter', () => {
    useUiStore.getState().toggleFps()
    expect(useUiStore.getState().fpsVisible).toBe(true)
    useUiStore.getState().toggleFps()
    expect(useUiStore.getState().fpsVisible).toBe(false)
  })

  it('marks quality as reduced', () => {
    useUiStore.getState().setQualityReduced(true)
    expect(useUiStore.getState().qualityReduced).toBe(true)
  })

  it('high quality override clears the reduction and sticks', () => {
    useUiStore.getState().setQualityReduced(true)
    useUiStore.getState().forceHighQuality()
    expect(useUiStore.getState().qualityReduced).toBe(false)
    expect(useUiStore.getState().highQualityOverride).toBe(true)
  })

  it('does not persist the performance flags', () => {
    useUiStore.getState().setQualityReduced(true)
    useUiStore.getState().toggleFps()
    const persisted = useUiStore.persist.getOptions().partialize?.(
      useUiStore.getState(),
    )
    expect(persisted).toEqual({ sidebarOpen: true })
  })
})
