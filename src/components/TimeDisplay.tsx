import { formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { usePlaybackStore } from '@/store/playbackStore'

interface TimeDisplayProps {
  which: 'current' | 'duration'
  className?: string
}

/** Elapsed or total time. One of the few components that reads `currentTime`. */
export function TimeDisplay({ which, className }: TimeDisplayProps) {
  const seconds = usePlaybackStore((s) =>
    which === 'current' ? s.currentTime : s.duration,
  )

  return (
    <span
      className={cn(
        'w-10 text-xs tabular-nums text-muted-foreground',
        which === 'current' && 'text-right',
        className,
      )}
    >
      {formatTime(seconds)}
    </span>
  )
}
