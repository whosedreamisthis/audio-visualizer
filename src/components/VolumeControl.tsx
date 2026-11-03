import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatPercent } from '@/lib/format'
import { useAudioStore } from '@/store/audioStore'

const firstValue = (value: number | readonly number[]) =>
  typeof value === 'number' ? value : value[0]

export function VolumeControl() {
  const volume = useAudioStore((s) => s.volume)
  const muted = useAudioStore((s) => s.muted)
  const setVolume = useAudioStore((s) => s.setVolume)
  const setMuted = useAudioStore((s) => s.setMuted)
  const toggleMute = useAudioStore((s) => s.toggleMute)

  const shown = muted ? 0 : volume

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
        onClick={toggleMute}
      >
        {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
      </Button>
      {/* The Slider is w-full, so it needs a fixed-width parent in a flex row */}
      <div className="w-24 shrink-0">
        <Slider
          aria-label="Volume"
          value={[Math.round(shown * 100)]}
          min={0}
          max={100}
          step={1}
          getAriaValueText={(_, value) =>
            muted ? 'Muted' : `Volume ${formatPercent(value / 100)}`
          }
          onValueChange={(value) => {
            setVolume(firstValue(value) / 100)
            // dragging the slider while muted brings the sound back
            if (muted) setMuted(false)
          }}
        />
      </div>
    </div>
  )
}
