import { memo } from 'react'
import { MicInput } from '@/components/MicInput'
import { PresetLibrary } from '@/components/PresetLibrary'
import { SavedPresets } from '@/components/SavedPresets'
import { Separator } from '@/components/ui/separator'

export const PresetsPanel = memo(function PresetsPanel() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">Preset tracks</h3>
        <PresetLibrary />
      </section>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Input</h3>
        <MicInput />
      </section>

      <Separator />

      <SavedPresets />
    </div>
  )
})
