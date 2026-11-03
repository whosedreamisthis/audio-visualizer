import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { readableForeground } from '@/lib/color'
import { useVisualizerStore } from '@/store/visualizerStore'
import { THEMES } from '@/visualizers/themes'

export function ThemePicker() {
  const themeId = useVisualizerStore((s) => s.themeId)
  const setTheme = useVisualizerStore((s) => s.setTheme)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {Object.values(THEMES).map((t) => {
          const active = themeId === t.id
          return (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              aria-pressed={active}
              onClick={() => setTheme(t.id)}
              style={{ backgroundImage: `linear-gradient(135deg, ${t.colors.join(', ')})` }}
              className={cn(
                'relative grid aspect-square min-h-11 place-items-center rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
                active && 'ring-2 ring-foreground',
              )}
            >
              {active && (
                <Check
                  className="size-4 drop-shadow"
                  style={{ color: readableForeground(t.colors[1] ?? t.accent) }}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">{THEMES[themeId].label}</p>
    </div>
  )
}
