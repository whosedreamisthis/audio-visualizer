import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const BANDS = [
  { id: 'low', label: 'Low', freq: '200 Hz', db: '+3 dB', value: 3 },
  { id: 'mid', label: 'Mid', freq: '1 kHz', db: '0 dB', value: 0 },
  { id: 'high', label: 'High', freq: '4 kHz', db: '+2 dB', value: 2 },
]

const PRESETS = ['Flat', 'Bass Boost', 'Vocal', 'Treble', 'Lo-Fi']

export function EqPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <label htmlFor="eq-bypass" className="text-sm font-medium">
          Bypass EQ
        </label>
        <Switch id="eq-bypass" />
      </div>

      <div className="flex justify-around gap-2">
        {BANDS.map((band) => (
          <div key={band.id} className="flex flex-col items-center gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">
              {band.db}
            </span>
            <div className="h-40">
              <Slider
                orientation="vertical"
                aria-label={`${band.label} ${band.freq}`}
                defaultValue={[band.value]}
                min={-12}
                max={12}
                step={0.5}
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{band.label}</div>
              <div className="text-xs text-muted-foreground">{band.freq}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Preset</span>
          <Button variant="ghost" size="xs">
            Reset to flat
          </Button>
        </div>
        <ToggleGroup defaultValue={['Flat']} className="flex-wrap" spacing={1}>
          {PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset}
              value={preset}
              size="sm"
              className="min-h-9"
            >
              {preset}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
