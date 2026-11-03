import { ControlRow } from '@/components/ControlRow'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GAIN, SPEED } from '@/lib/constants'
import { formatPercent, formatSpeed } from '@/lib/format'
import { useAudioStore } from '@/store/audioStore'
import { usePlaybackStore } from '@/store/playbackStore'

const SPEED_CHIPS = [0.75, 1, 1.25, 1.5] as const

const sliderValue = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : v)

export function MixerPanel() {
  const gain = useAudioStore((s) => s.gain)
  const speed = useAudioStore((s) => s.speed)
  const preservePitch = useAudioStore((s) => s.preservePitch)
  const setGain = useAudioStore((s) => s.setGain)
  const setSpeed = useAudioStore((s) => s.setSpeed)
  const setPreservePitch = useAudioStore((s) => s.setPreservePitch)
  // speed and pitch only apply to files; a live input plays in real time
  const live = usePlaybackStore((s) => s.track?.source === 'mic')

  const clipping = gain > GAIN.default

  return (
    <div className="space-y-6">
      <ControlRow
        label="Gain"
        value={formatPercent(gain)}
        warning={clipping ? 'Above 100%, may clip' : undefined}
        onReset={() => setGain(GAIN.default)}
      >
        <div onDoubleClick={() => setGain(GAIN.default)}>
          <Slider
            aria-label="Gain"
            getAriaValueText={(_, v) => `Gain ${formatPercent(v)}`}
            value={[gain]}
            min={GAIN.min}
            max={GAIN.max}
            step={0.01}
            onValueChange={(v) => setGain(sliderValue(v))}
          />
        </div>
      </ControlRow>

      <ControlRow
        label="Speed"
        value={formatSpeed(speed)}
        onReset={() => setSpeed(SPEED.default)}
      >
        <div onDoubleClick={() => setSpeed(SPEED.default)}>
          <Slider
            aria-label="Playback speed"
            getAriaValueText={(_, v) => `Speed ${formatSpeed(v)}`}
            value={[speed]}
            disabled={live}
            min={SPEED.min}
            max={SPEED.max}
            step={SPEED.step}
            onValueChange={(v) => setSpeed(sliderValue(v))}
          />
        </div>
        <ToggleGroup
          value={SPEED_CHIPS.filter((c) => Math.abs(c - speed) < 0.001).map(String)}
          onValueChange={(value) => {
            // clicking the active chip would deselect it; ignore that
            if (value[0]) setSpeed(Number(value[0]))
          }}
          className="w-full"
          disabled={live}
          spacing={1}
        >
          {SPEED_CHIPS.map((chip) => (
            <ToggleGroupItem
              key={chip}
              value={String(chip)}
              size="sm"
              className="min-h-9 flex-1"
            >
              {formatSpeed(chip)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ControlRow>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div>
          <label htmlFor="preserve-pitch" className="text-sm font-medium">
            Preserve pitch
          </label>
          <p className="text-xs text-muted-foreground">
            Off gives a tape-style pitch shift.
          </p>
        </div>
        <Switch
          id="preserve-pitch"
          checked={preservePitch}
          disabled={live}
          onCheckedChange={setPreservePitch}
        />
      </div>
    </div>
  )
}
