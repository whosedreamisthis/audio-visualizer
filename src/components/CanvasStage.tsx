import { useEffect, useRef } from 'react'
import { FolderOpen, ListMusic, Loader2, Mic, Upload, X } from 'lucide-react'
import { handleAudioFiles } from '@/audio/loadAudioFile'
import { startMicrophone } from '@/audio/mic'
import { AudioFileInput } from '@/components/AudioFileInput'
import { FpsMeter } from '@/components/FpsMeter'
import { MicNotice } from '@/components/MicNotice'
import { VisualizerCanvas } from '@/components/VisualizerCanvas'
import { Button } from '@/components/ui/button'
import { useFileDrop } from '@/hooks/useFileDrop'
import { ACCEPTED_AUDIO_EXTENSIONS } from '@/lib/constants'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'

const SHOW_FPS =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('fps')

const FORMATS_LABEL = ACCEPTED_AUDIO_EXTENSIONS.map((ext) =>
  ext.slice(1).toUpperCase(),
).join(', ')

export function CanvasStage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const status = usePlaybackStore((s) => s.status)
  const hasTrack = usePlaybackStore((s) => s.track !== null)
  const pickerOpen = useUiStore((s) => s.sourcePickerOpen)
  const setPickerOpen = useUiStore((s) => s.setSourcePickerOpen)
  const dragging = useFileDrop((files) => void handleAudioFiles(files))

  const loading = status === 'loading'
  // Shown for the empty state, while loading, or when the user asks to load another track
  const showCard = !hasTrack || loading || pickerOpen
  const dismissible = hasTrack && pickerOpen && !loading

  useEffect(() => {
    if (!dismissible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dismissible, setPickerOpen])

  const showPresets = () => {
    const ui = useUiStore.getState()
    ui.setActiveTab('presets')
    ui.setControlsOpen(true) // opens the sheet on tablet and mobile; the sidebar is always shown on desktop
    ui.setSourcePickerOpen(false)
  }

  return (
    <div className="relative size-full overflow-hidden bg-black">
      <VisualizerCanvas />
      {SHOW_FPS && <FpsMeter />}

      <AudioFileInput ref={inputRef} />

      {showCard && (
        <div
          className={`absolute inset-0 grid place-items-center p-4 ${hasTrack ? 'bg-black/50' : ''}`}
          onClick={dismissible ? () => setPickerOpen(false) : undefined}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-dashed border-white/25 bg-black/60 p-6 text-center backdrop-blur-md sm:p-8"
            role={dismissible ? 'dialog' : undefined}
            aria-label={dismissible ? 'Load a song or pick a preset' : undefined}
            onClick={(event) => event.stopPropagation()}
          >
            {dismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-11"
                aria-label="Close"
                onClick={() => setPickerOpen(false)}
              >
                <X />
              </Button>
            )}
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
                autoFocus={dismissible}
                onClick={() => inputRef.current?.click()}
              >
                <FolderOpen /> Choose file
              </Button>
              <Button
                variant="secondary"
                className="min-h-11"
                disabled={loading}
                onClick={showPresets}
              >
                <ListMusic /> Use a preset
              </Button>
            </div>
            <Button
              variant="ghost"
              className="mt-2 min-h-11 w-full sm:w-auto"
              disabled={loading}
              onClick={() => void startMicrophone()}
            >
              <Mic /> Use microphone
            </Button>
            <MicNotice className="mt-3" />
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
