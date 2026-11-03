import { Mic, MicOff, TriangleAlert } from 'lucide-react'
import { startMicrophone, stopMicrophone } from '@/audio/mic'
import { MicNotice } from '@/components/MicNotice'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useMicStore } from '@/store/micStore'
import { usePlaybackStore } from '@/store/playbackStore'

/** Microphone source controls for the Presets tab: start/stop, permission help, monitoring. */
export function MicInput() {
  const active = usePlaybackStore((s) => s.track?.source === 'mic')
  const monitor = useMicStore((s) => s.monitor)
  const processing = useMicStore((s) => s.processing)
  const setMonitor = useMicStore((s) => s.setMonitor)
  const setProcessing = useMicStore((s) => s.setProcessing)

  return (
    <div className="space-y-3">
      <Button
        variant={active ? 'secondary' : 'outline'}
        className="min-h-11 w-full justify-start gap-2"
        onClick={() => (active ? stopMicrophone() : void startMicrophone())}
      >
        {active ? <MicOff /> : <Mic />}
        {active ? 'Stop microphone' : 'Use microphone'}
      </Button>

      <MicNotice />

      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="mic-monitor" className="text-sm font-medium">
            Monitor through speakers
          </label>
          <Switch id="mic-monitor" checked={monitor} onCheckedChange={setMonitor} />
        </div>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden />
          <span>Can cause loud feedback. Use headphones, or keep this off.</span>
        </p>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="mic-processing" className="text-sm font-medium">
            Clean up input
          </label>
          <Switch
            id="mic-processing"
            checked={processing}
            onCheckedChange={(checked) => {
              setProcessing(checked)
              // a live mic restarts so the new constraints take effect
              if (active) void startMicrophone()
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Echo cancellation and noise suppression. Off shows the raw sound. Changing it
          restarts a live microphone.
        </p>
      </div>
    </div>
  )
}
