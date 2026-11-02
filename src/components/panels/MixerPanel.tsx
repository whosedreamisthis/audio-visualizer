import { ControlRow } from '@/components/ControlRow'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const SPEED_CHIPS = ['0.75x', '1x', '1.25x', '1.5x']

export function MixerPanel() {
  return (
    <div className="space-y-6">
      <ControlRow label="Gain" value="100%">
        <Slider
          aria-label="Gain"
          defaultValue={[100]}
          min={0}
          max={200}
          step={1}
        />
      </ControlRow>

      <ControlRow label="Speed" value="1.00x">
        <Slider
          aria-label="Playback speed"
          defaultValue={[1]}
          min={0.5}
          max={2}
          step={0.05}
        />
        <ToggleGroup defaultValue={['1x']} className="w-full" spacing={1}>
          {SPEED_CHIPS.map((chip) => (
            <ToggleGroupItem
              key={chip}
              value={chip}
              size="sm"
              className="min-h-9 flex-1"
            >
              {chip}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ControlRow>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div>
          <label htmlFor="preserve-pitch" className="text-sm font-medium">
            Preserve pitch
          </label>
          <p className="text-xs text-muted-foreground">
            Off gives a tape-style pitch shift.
          </p>
        </div>
        <Switch id="preserve-pitch" defaultChecked />
      </div>
    </div>
  )
}
