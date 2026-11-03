import { AudioLines, BarChart3, Sparkles } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VISUALIZER_MODES } from '@/lib/constants'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { VisualizerMode } from '@/types'

const isVisualizerMode = (value: unknown): value is VisualizerMode =>
  VISUALIZER_MODES.some((m) => m === value)

const MODES: {
  id: VisualizerMode
  label: string
  hint: string
  icon: typeof AudioLines
}[] = [
  { id: 'waveform', label: 'Waveform', hint: 'Oscilloscope line (1)', icon: AudioLines },
  { id: 'bars', label: 'Bars', hint: 'Frequency spectrum bars (2)', icon: BarChart3 },
  { id: 'particles', label: 'Particles', hint: 'Beat-driven particles (3)', icon: Sparkles },
]

export function VisualizerPicker() {
  const mode = useVisualizerStore((s) => s.mode)
  const setMode = useVisualizerStore((s) => s.setMode)

  return (
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
      {MODES.map(({ id, label, hint, icon: Icon }) => (
        <Tooltip key={id}>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                value={id}
                size="sm"
                className="min-h-11 flex-1 flex-col gap-1 py-1.5"
                aria-label={label}
              />
            }
          >
            <Icon aria-hidden />
            <span className="text-xs">{label}</span>
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}
