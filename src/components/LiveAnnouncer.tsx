import { playbackAnnouncement } from '@/lib/announce'
import { usePlaybackStore } from '@/store/playbackStore'

/** Visually hidden polite live region that announces track and playback changes. */
export function LiveAnnouncer() {
  const status = usePlaybackStore((s) => s.status)
  const trackName = usePlaybackStore((s) => s.track?.name ?? null)
  const error = usePlaybackStore((s) => s.error)

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {playbackAnnouncement({ status, trackName, error })}
    </div>
  )
}
