import { FolderOpen, ListMusic, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Deterministic fake spectrum for the static mockup (replaced by the real canvas later)
const BARS = Array.from({ length: 56 }, (_, i) => {
  const x = i / 55
  const envelope = Math.sin(Math.PI * Math.pow(x, 0.7))
  const wobble = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7))
  return Math.max(0.06, envelope * wobble)
})

export function CanvasStage() {
  return (
    <div
      className="relative size-full overflow-hidden bg-black"
      role="img"
      aria-label="Audio visualizer canvas, no track loaded"
    >
      <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-[3px] px-4 pb-6 opacity-40 sm:gap-1 sm:px-8">
        {BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-400 to-fuchsia-500"
            style={{ height: `${h * 70}%` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-dashed border-white/25 bg-black/60 p-6 text-center backdrop-blur-md sm:p-8">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-white/10">
            <Upload className="size-6" aria-hidden />
          </div>
          <h2 className="text-base font-semibold sm:text-lg">
            Drop a track or pick a preset
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            MP3, WAV, OGG, FLAC or M4A
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="min-h-11">
              <FolderOpen /> Choose file
            </Button>
            <Button variant="secondary" className="min-h-11">
              <ListMusic /> Use a preset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
