import { useState } from 'react'
import { seekTo } from '@/audio/transport'
import { Slider } from '@/components/ui/slider'
import { TimeDisplay } from '@/components/TimeDisplay'
import { formatTime } from '@/lib/format'
import { usePlaybackStore } from '@/store/playbackStore'

const firstValue = (value: number | readonly number[]) =>
  typeof value === 'number' ? value : value[0]

export function SeekBar() {
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const duration = usePlaybackStore((s) => s.duration)
  const hasTrack = usePlaybackStore((s) => s.track !== null)
  // While dragging, show the thumb position locally instead of fighting store updates
  const [dragValue, setDragValue] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-2">
      <TimeDisplay which="current" />
      <Slider
        aria-label="Seek"
        value={[dragValue ?? currentTime]}
        min={0}
        max={duration > 0 ? duration : 1}
        step={0.1}
        disabled={!hasTrack || duration <= 0}
        getAriaValueText={(_, value) =>
          `${formatTime(value)} of ${formatTime(duration)}`
        }
        onValueChange={(value) => setDragValue(firstValue(value))}
        onValueCommitted={(value) => {
          seekTo(firstValue(value))
          setDragValue(null)
        }}
      />
      <TimeDisplay which="duration" className="text-left" />
    </div>
  )
}
