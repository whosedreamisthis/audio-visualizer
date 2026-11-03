import { RotateCcw } from 'lucide-react'
import { ControlRow } from '@/components/ControlRow'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  BAR_COUNT,
  DEFAULT_VISUALIZER_SETTINGS as DEFAULTS,
  FFT_SIZES,
  LINE_WIDTH,
  PARTICLE_COUNT,
  SENSITIVITY,
  SMOOTHING,
} from '@/lib/constants'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { FftSize, VisualizerSettings } from '@/types'

const isFftSize = (value: unknown): value is FftSize =>
  FFT_SIZES.some((size) => size === Number(value))

interface SliderRowProps {
  label: string
  field: 'smoothing' | 'sensitivity' | 'barCount' | 'particleCount' | 'lineWidth'
  min: number
  max: number
  step: number
  format: (value: number) => string
}

/** Slider bound to one numeric setting; applies while dragging. */
function SettingSlider({ label, field, min, max, step, format }: SliderRowProps) {
  const value = useVisualizerStore((s) => s.settings[field])
  const updateSettings = useVisualizerStore((s) => s.updateSettings)

  return (
    <ControlRow
      label={label}
      value={format(value)}
      onReset={() => updateSettings({ [field]: DEFAULTS[field] })}
    >
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v
          updateSettings({ [field]: next })
        }}
      />
    </ControlRow>
  )
}

interface SwitchRowProps {
  id: string
  label: string
  field: keyof Pick<VisualizerSettings, 'glow' | 'mirror'>
}

function SettingSwitch({ id, label, field }: SwitchRowProps) {
  const checked = useVisualizerStore((s) => s.settings[field])
  const updateSettings = useVisualizerStore((s) => s.updateSettings)

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(next) => updateSettings({ [field]: next })}
      />
    </div>
  )
}

export function SettingsPanel() {
  const mode = useVisualizerStore((s) => s.mode)
  const fftSize = useVisualizerStore((s) => s.settings.fftSize)
  const updateSettings = useVisualizerStore((s) => s.updateSettings)
  const resetSettings = useVisualizerStore((s) => s.resetSettings)

  return (
    <div className="space-y-6">
      <ControlRow
        label="FFT size"
        value={String(fftSize)}
        onReset={() => updateSettings({ fftSize: DEFAULTS.fftSize })}
      >
        <ToggleGroup
          value={[String(fftSize)]}
          onValueChange={(value) => {
            // clicking the active item would deselect it; keep exactly one size selected
            const next = value[0]
            if (isFftSize(next)) updateSettings({ fftSize: Number(next) as FftSize })
          }}
          className="w-full"
          spacing={1}
        >
          {FFT_SIZES.map((size) => (
            <ToggleGroupItem
              key={size}
              value={String(size)}
              size="sm"
              className="min-h-9 flex-1"
            >
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ControlRow>

      <SettingSlider
        label="Smoothing"
        field="smoothing"
        min={SMOOTHING.min}
        max={SMOOTHING.max}
        step={0.01}
        format={(v) => v.toFixed(2)}
      />

      <SettingSlider
        label="Sensitivity"
        field="sensitivity"
        min={SENSITIVITY.min}
        max={SENSITIVITY.max}
        step={0.1}
        format={(v) => `${v.toFixed(1)}x`}
      />

      {mode === 'bars' && (
        <SettingSlider
          label="Bar count"
          field="barCount"
          min={BAR_COUNT.min}
          max={BAR_COUNT.max}
          step={1}
          format={String}
        />
      )}

      {mode === 'particles' && (
        <SettingSlider
          label="Particle count"
          field="particleCount"
          min={PARTICLE_COUNT.min}
          max={PARTICLE_COUNT.max}
          step={50}
          format={String}
        />
      )}

      {mode === 'waveform' && (
        <SettingSlider
          label="Line width"
          field="lineWidth"
          min={LINE_WIDTH.min}
          max={LINE_WIDTH.max}
          step={0.5}
          format={(v) => `${v.toFixed(1)} px`}
        />
      )}

      <div className="space-y-3 rounded-lg border p-3">
        <SettingSwitch id="glow" label="Glow" field="glow" />
        <SettingSwitch id="mirror" label="Mirror" field="mirror" />
      </div>

      <Button variant="outline" className="w-full" onClick={resetSettings}>
        <RotateCcw aria-hidden />
        Reset visual settings
      </Button>
    </div>
  )
}
