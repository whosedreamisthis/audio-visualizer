import { useState } from 'react'
import { AudioLines, BarChart3, Check, Sparkles } from 'lucide-react'
import { ControlRow } from '@/components/ControlRow'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

const MODES = [
  { id: 'waveform', label: 'Waveform', icon: AudioLines },
  { id: 'bars', label: 'Bars', icon: BarChart3 },
  { id: 'particles', label: 'Particles', icon: Sparkles },
]

const THEMES = [
  { id: 'neon', label: 'Neon', gradient: 'from-cyan-400 to-fuchsia-500' },
  { id: 'sunset', label: 'Sunset', gradient: 'from-orange-400 via-rose-500 to-purple-600' },
  { id: 'ocean', label: 'Ocean', gradient: 'from-sky-400 to-teal-500' },
  { id: 'mono', label: 'Mono', gradient: 'from-white to-neutral-500' },
  { id: 'aurora', label: 'Aurora', gradient: 'from-emerald-400 via-teal-400 to-violet-500' },
]

const FFT_SIZES = ['512', '1024', '2048', '4096']

export function VisualPanel() {
  const [theme, setTheme] = useState('neon')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-medium">Visualizer</span>
        <ToggleGroup defaultValue={['bars']} className="w-full" spacing={1}>
          {MODES.map(({ id, label, icon: Icon }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              size="sm"
              className="min-h-11 flex-1 flex-col gap-1 py-1.5"
              aria-label={label}
            >
              <Icon aria-hidden />
              <span className="text-xs">{label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Theme</span>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              aria-pressed={theme === t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'relative grid aspect-square min-h-11 place-items-center rounded-lg bg-gradient-to-br outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
                t.gradient,
                theme === t.id && 'ring-2 ring-foreground',
              )}
            >
              {theme === t.id && (
                <Check className="size-4 text-black drop-shadow" aria-hidden />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {THEMES.find((t) => t.id === theme)?.label}
        </p>
      </div>

      <ControlRow label="FFT size" value="2048">
        <ToggleGroup defaultValue={['2048']} className="w-full" spacing={1}>
          {FFT_SIZES.map((size) => (
            <ToggleGroupItem
              key={size}
              value={size}
              size="sm"
              className="min-h-9 flex-1"
            >
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ControlRow>

      <ControlRow label="Smoothing" value="0.80">
        <Slider aria-label="Smoothing" defaultValue={[0.8]} min={0} max={0.99} step={0.01} />
      </ControlRow>

      <ControlRow label="Sensitivity" value="1.0x">
        <Slider aria-label="Sensitivity" defaultValue={[1]} min={0.5} max={3} step={0.1} />
      </ControlRow>

      <ControlRow label="Bar count" value="64">
        <Slider aria-label="Bar count" defaultValue={[64]} min={16} max={128} step={1} />
      </ControlRow>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <label htmlFor="glow" className="text-sm font-medium">Glow</label>
          <Switch id="glow" />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="mirror" className="text-sm font-medium">Mirror</label>
          <Switch id="mirror" defaultChecked />
        </div>
      </div>
    </div>
  )
}
