import { AlertCircle, Loader2, Play, RotateCw, Volume2 } from 'lucide-react'
import { useLoadPreset, usePresetTracks } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { usePlaybackStore } from '@/store/playbackStore'
import type { PresetTrack } from '@/types'

function LibrarySkeleton() {
  return (
    <ul className="space-y-2" aria-busy="true" aria-label="Loading preset tracks">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Card className="flex-row items-center gap-3 p-3">
            <div className="size-8 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function PresetLibrary() {
  const tracks = usePresetTracks()
  const load = useLoadPreset()
  const current = usePlaybackStore((s) => s.track)

  if (tracks.isPending) return <LibrarySkeleton />

  if (tracks.isError) {
    return (
      <div
        role="alert"
        className="space-y-3 rounded-lg border border-destructive/40 p-4 text-center"
      >
        <AlertCircle className="mx-auto size-5 text-destructive" />
        <p className="text-xs text-muted-foreground">Couldn't load the preset library.</p>
        <Button size="sm" variant="outline" onClick={() => void tracks.refetch()}>
          <RotateCw /> Retry
        </Button>
      </div>
    )
  }

  const loadingId = load.isPending ? load.variables?.id : undefined
  const isActive = (t: PresetTrack) =>
    current?.source === 'preset' && current.name === t.title && current.artist === t.artist

  return (
    <ul className="space-y-2">
      {tracks.data.map((track) => {
        const loading = loadingId === track.id
        const active = isActive(track)
        return (
          <li key={track.id}>
            <Card
              data-active={active || undefined}
              // Clicks on the inner play button bubble here too, so there's a single handler
              onClick={() => {
                if (!load.isPending) load.mutate(track)
              }}
              className={cn(
                'flex-row items-center gap-3 p-3 transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring',
                load.isPending ? 'cursor-wait' : 'cursor-pointer',
                active && 'ring-2 ring-primary',
              )}
            >
              <Button
                size="icon"
                variant="secondary"
                aria-label={`Play ${track.title}`}
                disabled={load.isPending}
              >
                {loading ? <Loader2 className="animate-spin" /> : active ? <Volume2 /> : <Play />}
              </Button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{track.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {loading ? 'Loading…' : track.artist}
                  {track.bpm ? ` · ${track.bpm} BPM` : ''}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {track.sourceUrl ? (
                    <a
                      href={track.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      “{track.title}” by {track.artist} ({track.license})
                    </a>
                  ) : (
                    <>
                      “{track.title}” by {track.artist} ({track.license})
                    </>
                  )}
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {track.license}
              </span>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
