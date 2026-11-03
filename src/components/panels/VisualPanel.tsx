import { AudioLines, BarChart3, Check, Sparkles } from 'lucide-react'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { VISUALIZER_MODES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { ThemeId, VisualizerMode } from '@/types'

const isVisualizerMode = (value: unknown): value is VisualizerMode =>
  VISUALIZER_MODES.some((m) => m === value)

const MODES = [
  { id: 'waveform', label: 'Waveform', icon: AudioLines },
  { id: 'bars', label: 'Bars', icon: BarChart3 },
  { id: 'particles', label: 'Particles', icon: Sparkles },
]

const THEMES: { id: ThemeId; label: string; gradient: string }[] = [
  { id: 'neon', label: 'Neon', gradient: 'from-cyan-400 to-fuchsia-500' },
  { id: 'sunset', label: 'Sunset', gradient: 'from-orange-400 via-rose-500 to-purple-600' },
  { id: 'ocean', label: 'Ocean', gradient: 'from-sky-400 to-teal-500' },
  { id: 'mono', label: 'Mono', gradient: 'from-white to-neutral-500' },
  { id: 'aurora', label: 'Aurora', gradient: 'from-emerald-400 via-teal-400 to-violet-500' },
]

export function VisualPanel() {
  const theme = useVisualizerStore((s) => s.themeId)
  const setTheme = useVisualizerStore((s) => s.setTheme)
  const mode = useVisualizerStore((s) => s.mode)
  const setMode = useVisualizerStore((s) => s.setMode)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-medium">Visualizer</span>
        <ToggleGroup
          value={[mode]}
          onValueChange={(value) => {
            // clicking the active item would deselect it; keep exactly one mode selected
            const next = value[0]
            if (isVisualizerMode(next)) setMode(next)
          }}
          className="w-full"
          spacing={1}
        >
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

      <SettingsPanel />
    </div>
  )
}
