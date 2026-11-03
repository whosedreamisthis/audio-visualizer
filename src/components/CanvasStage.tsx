import { useRef } from 'react'
import { FolderOpen, ListMusic, Loader2, Upload } from 'lucide-react'
import { handleAudioFiles } from '@/audio/loadAudioFile'
import { AudioFileInput } from '@/components/AudioFileInput'
import { FpsMeter } from '@/components/FpsMeter'
import { VisualizerCanvas } from '@/components/VisualizerCanvas'
import { Button } from '@/components/ui/button'
import { useFileDrop } from '@/hooks/useFileDrop'
import { ACCEPTED_AUDIO_EXTENSIONS } from '@/lib/constants'
import { usePlaybackStore } from '@/store/playbackStore'

const SHOW_FPS =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('fps')

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
    <div className="relative size-full overflow-hidden bg-black">
      <VisualizerCanvas />
      {SHOW_FPS && <FpsMeter />}

      <AudioFileInput ref={inputRef} />

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
