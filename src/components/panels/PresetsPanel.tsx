import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MicInput } from '@/components/MicInput'
import { PresetLibrary } from '@/components/PresetLibrary'
import { Separator } from '@/components/ui/separator'

export function PresetsPanel() {
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

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Saved presets</h3>
          <Button variant="ghost" size="xs">
            <Save /> Save current
          </Button>
        </div>
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          No saved presets yet.
        </p>
      </section>
    </div>
  )
}
