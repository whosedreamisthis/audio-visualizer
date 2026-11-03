import { memo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { EQ_BANDS, EQ_FLAT, EQ_RANGE_DB } from '@/lib/constants'
import { eqResponseDb } from '@/lib/eqCurve'
import { EQ_PRESETS, findMatchingPreset } from '@/lib/eqPresets'
import { formatDb } from '@/lib/format'
import { useAudioStore } from '@/store/audioStore'
import type { EqBandId } from '@/types'

const CURVE_FREQS = Array.from({ length: 64 }, (_, i) => 20 * 1000 ** (i / 63))

const sliderValue = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : v)
const formatHz = (hz: number) => (hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`)

function EqCurve({ gains, bypass }: { gains: Record<EqBandId, number>; bypass: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const style = getComputedStyle(canvas)
    const y = (db: number) => h / 2 - (db / EQ_RANGE_DB.max) * (h / 2 - 2)

    ctx.strokeStyle = style.getPropertyValue('--border') || 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.moveTo(0, y(0))
    ctx.lineTo(w, y(0))
    ctx.stroke()

    const response = eqResponseDb(bypass ? EQ_FLAT : gains, CURVE_FREQS)
    ctx.strokeStyle = style.getPropertyValue('--primary') || '#fff'
    ctx.lineWidth = 2
    ctx.globalAlpha = bypass ? 0.4 : 1
    ctx.beginPath()
    response.forEach((db, i) => {
      const x = (i / (response.length - 1)) * w
      if (i === 0) ctx.moveTo(x, y(db))
      else ctx.lineTo(x, y(db))
    })
    ctx.stroke()
  }, [gains, bypass])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="EQ frequency response curve"
      className="h-24 w-full rounded-lg border"
    />
  )
}

export const EqPanel = memo(function EqPanel() {
  const eq = useAudioStore((s) => s.eq)
  const bypass = useAudioStore((s) => s.eqBypass)
  const setEqBand = useAudioStore((s) => s.setEqBand)
  const resetEq = useAudioStore((s) => s.resetEq)
  const applyEqPreset = useAudioStore((s) => s.applyEqPreset)
  const setEqBypass = useAudioStore((s) => s.setEqBypass)

  const active = findMatchingPreset(eq)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <label htmlFor="eq-bypass" className="text-sm font-medium">
          Bypass EQ
        </label>
        <Switch id="eq-bypass" checked={bypass} onCheckedChange={setEqBypass} />
      </div>

      <EqCurve gains={eq} bypass={bypass} />

      <div className="flex justify-around gap-2">
        {EQ_BANDS.map((band) => (
          <div key={band.id} className="flex flex-col items-center gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatDb(eq[band.id])}
            </span>
            <div className="h-40">
              <Slider
                orientation="vertical"
                aria-label={`${band.label} ${formatHz(band.frequency)}`}
                getAriaValueText={(_, v) => formatDb(v)}
                value={[eq[band.id]]}
                min={EQ_RANGE_DB.min}
                max={EQ_RANGE_DB.max}
                step={EQ_RANGE_DB.step}
                onValueChange={(v) => setEqBand(band.id, sliderValue(v))}
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{band.label}</div>
              <div className="text-xs text-muted-foreground">
                {formatHz(band.frequency)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Preset{active ? '' : ': Custom'}
          </span>
          <Button variant="ghost" size="xs" onClick={resetEq}>
            Reset to flat
          </Button>
        </div>
        <ToggleGroup
          value={active ? [active.id] : []}
          onValueChange={(v) => {
            const preset = EQ_PRESETS.find((p) => p.id === v[0])
            if (preset) applyEqPreset(preset)
          }}
          className="flex-wrap"
          spacing={1}
        >
          {EQ_PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset.id}
              value={preset.id}
              size="sm"
              className="min-h-9 aria-pressed:bg-white/25 aria-pressed:hover:bg-white/30 data-[state=on]:bg-white/25 data-[state=on]:hover:bg-white/30"
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
})
