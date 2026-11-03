import { Gauge, Pause, Play, Repeat, RotateCcw, Square } from 'lucide-react'
import { seekTo, getTransportAction, togglePlayback } from '@/audio/transport'
import { SeekBar } from '@/components/SeekBar'
import { VolumeControl } from '@/components/VolumeControl'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatSpeed } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAudioStore } from '@/store/audioStore'
import { usePlaybackStore } from '@/store/playbackStore'

function IconButton({
  label,
  children,
  className,
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
            className={cn('size-11', className)}
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

const SOURCE_LABEL = { file: 'File', preset: 'Preset', mic: 'Mic' } as const

export function PlayerBar() {
  const status = usePlaybackStore((s) => s.status)
  const track = usePlaybackStore((s) => s.track)
  const loop = usePlaybackStore((s) => s.loop)
  const error = usePlaybackStore((s) => s.error)
  const toggleLoop = usePlaybackStore((s) => s.toggleLoop)
  const speed = useAudioStore((s) => s.speed)

  const live = track?.source === 'mic'
  const action = getTransportAction(status, track !== null, live)
  const playing = action === 'pause'
  const stopping = action === 'stop'
  const canTransport = track !== null && status !== 'loading'

  const title = track
    ? track.name
    : status === 'loading'
      ? 'Loading…'
      : 'No track loaded'
  const subtitle = track
    ? (track.artist ?? 'Unknown artist')
    : (error ?? 'Drop a file or pick a preset')

  return (
    <footer
      id="player-controls"
      tabIndex={-1}
      aria-label="Player controls"
      className="shrink-0 outline-none border-t bg-background px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 md:grid-cols-[1fr_2fr_1fr]">
        <div className="flex min-w-0 items-center gap-2 md:order-1">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{title}</div>
            <div
              className={cn(
                'truncate text-xs text-muted-foreground',
                !track && error && 'text-destructive',
              )}
            >
              {subtitle}
            </div>
          </div>
          {track && (
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              {SOURCE_LABEL[track.source]}
            </span>
          )}
        </div>

        <div className="md:hidden">
          <VolumeControl />
        </div>

        <div className="max-md:col-span-2 md:order-2">
          <div className="flex items-center justify-center gap-1">
            <IconButton
              label="Restart"
              className="active:bg-white/25 dark:active:bg-white/25"
              disabled={!canTransport || live}
              onClick={() => seekTo(0)}
            >
              <RotateCcw />
            </IconButton>
            <Button
              size="icon"
              className="size-11 rounded-full"
              aria-label={stopping ? 'Stop microphone' : playing ? 'Pause' : 'Play'}
              disabled={!canTransport}
              onClick={() => void togglePlayback()}
            >
              {stopping ? <Square /> : playing ? <Pause /> : <Play />}
            </Button>
            <IconButton
              label={loop ? 'Loop on' : 'Loop off'}
              disabled={live}
              aria-pressed={loop}
              variant={loop ? 'secondary' : 'ghost'}
              className={loop ? 'bg-white/25 hover:bg-white/30' : undefined}
              onClick={toggleLoop}
            >
              <Repeat />
            </IconButton>
          </div>
          <SeekBar />
        </div>

        <div className="hidden items-center justify-end gap-2 md:order-3 md:flex">
          <VolumeControl />
          {!live && (
            <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
              <Gauge className="size-4" aria-hidden /> {formatSpeed(speed)}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
