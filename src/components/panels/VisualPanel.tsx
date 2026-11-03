import { memo } from 'react'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { ThemePicker } from '@/components/ThemePicker'
import { VisualizerPicker } from '@/components/VisualizerPicker'

export const VisualPanel = memo(function VisualPanel() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-medium">Visualizer</span>
        <VisualizerPicker />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Theme</span>
        <ThemePicker />
      </div>

      <SettingsPanel />
    </div>
  )
})
