import type { PlaybackStatus } from '@/store/playbackStore'

interface AnnounceInput {
  status: PlaybackStatus
  trackName: string | null
  error: string | null
}

/** Screen-reader text for the current playback state; empty when nothing is worth announcing. */
export function playbackAnnouncement({
  status,
  trackName,
  error,
}: AnnounceInput): string {
  switch (status) {
    case 'loading':
      return 'Loading track'
    case 'ready':
      return trackName ? `Loaded ${trackName}` : 'Track loaded'
    case 'playing':
      return trackName ? `Playing ${trackName}` : 'Playing'
    case 'paused':
      return 'Paused'
    case 'error':
      return error ? `Error: ${error}` : 'Error'
    default:
      return ''
  }
}
