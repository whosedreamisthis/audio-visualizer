import {
  Gauge,
  Pause,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function IconButton({
  label,
  children,
  ...props
}: { label: string } & React.ComponentProps<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className="size-11"
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function PlayerBar() {
  return (
    <footer className="shrink-0 border-t bg-background px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 md:grid-cols-[1fr_2fr_1fr]">
        <div className="min-w-0 max-md:col-span-2 md:order-1">
          <div className="truncate text-sm font-medium">No track loaded</div>
          <div className="truncate text-xs text-muted-foreground">
            Drop a file or pick a preset
          </div>
        </div>

        <div className="max-md:col-span-2 md:order-2">
          <div className="flex items-center justify-center gap-1">
            <IconButton label="Previous">
              <SkipBack />
            </IconButton>
            <Button size="icon" className="size-11 rounded-full" aria-label="Play / pause">
              <Pause />
            </Button>
            <IconButton label="Next">
              <SkipForward />
            </IconButton>
            <IconButton label="Loop">
              <Repeat />
            </IconButton>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              0:00
            </span>
            <Slider aria-label="Seek" defaultValue={[0]} min={0} max={100} />
            <span className="w-10 text-xs tabular-nums text-muted-foreground">
              3:18
            </span>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 md:order-3 md:flex">
          <Volume2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Slider
            aria-label="Volume"
            defaultValue={[70]}
            min={0}
            max={100}
            className="max-w-28"
          />
          <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Gauge className="size-4" aria-hidden /> 1.0x
          </span>
        </div>
      </div>
    </footer>
  )
}
