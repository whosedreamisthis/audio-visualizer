import { useRef } from 'react'
import { FolderOpen, ListMusic, Loader2, Upload } from 'lucide-react'
import { handleAudioFiles } from '@/audio/loadAudioFile'
import { Button } from '@/components/ui/button'
import { useFileDrop } from '@/hooks/useFileDrop'
import { ACCEPTED_AUDIO_EXTENSIONS } from '@/lib/constants'
import { usePlaybackStore } from '@/store/playbackStore'

// Deterministic fake spectrum for the static mockup (replaced by the real canvas later)
const BARS = Array.from({ length: 56 }, (_, i) => {
  const x = i / 55
  const envelope = Math.sin(Math.PI * Math.pow(x, 0.7))
  const wobble = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7))
  return Math.max(0.06, envelope * wobble)
})

const FILE_ACCEPT = `audio/*,${ACCEPTED_AUDIO_EXTENSIONS.join(',')}`
const FORMATS_LABEL = ACCEPTED_AUDIO_EXTENSIONS.map((ext) =>
  ext.slice(1).toUpperCase(),
).join(', ')

export function CanvasStage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const status = usePlaybackStore((s) => s.status)
  const hasTrack = usePlaybackStore((s) => s.track !== null)
  const dragging = useFileDrop((files) => void handleAudioFiles(files))

  const loading = status === 'loading'
  const showCard = !hasTrack || loading

  return (
    <div
      className="relative size-full overflow-hidden bg-black"
      role="img"
      aria-label={
        hasTrack
          ? 'Audio visualizer canvas'
          : 'Audio visualizer canvas, no track loaded'
      }
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

      <input
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT}
        multiple
        className="hidden"
        aria-label="Choose an audio file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = '' // allow picking the same file again
          void handleAudioFiles(files)
        }}
      />

      {showCard && (
        <div className="absolute inset-0 grid place-items-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-dashed border-white/25 bg-black/60 p-6 text-center backdrop-blur-md sm:p-8">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-white/10">
              {loading ? (
                <Loader2 className="size-6 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-6" aria-hidden />
              )}
            </div>
            <h2 className="text-base font-semibold sm:text-lg">
              {loading ? 'Loading track…' : 'Drop a track or pick a preset'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {FORMATS_LABEL}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                className="min-h-11"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
              >
                <FolderOpen /> Choose file
              </Button>
              <Button variant="secondary" className="min-h-11" disabled={loading}>
                <ListMusic /> Use a preset
              </Button>
            </div>
          </div>
        </div>
      )}

      {dragging && (
        <div
          className="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-white bg-black/70"
          aria-live="polite"
        >
          <p className="text-lg font-semibold">Release to play</p>
        </div>
      )}
    </div>
  )
}
