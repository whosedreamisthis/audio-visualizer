import { useEffect } from 'react'
import { toast } from 'sonner'
import { seekTo, togglePlayback } from '@/audio/transport'
import { formatPercent, formatTime } from '@/lib/format'
import { toggleFullscreen } from '@/lib/fullscreen'
import { clamp } from '@/lib/math'
import {
  SEEK_STEP_SECONDS,
  VOLUME_STEP,
  mapKeyToAction,
  toKeyTarget,
  type ShortcutAction,
} from '@/lib/shortcuts'
import { useAudioStore } from '@/store/audioStore'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import type { VisualizerMode } from '@/types'

const HUD_ID = 'shortcut-hud'

/** One reusable toast, so repeated key presses update it instead of stacking. */
function showHud(message: string) {
  toast(message, { id: HUD_ID, duration: 1200 })
}

const MODE_ACTIONS: Partial<Record<ShortcutAction, [VisualizerMode, string]>> = {
  modeWaveform: ['waveform', 'Waveform'],
  modeBars: ['bars', 'Bars'],
  modeParticles: ['particles', 'Particles'],
}

const REPEATABLE = new Set<ShortcutAction>([
  'seekBack',
  'seekForward',
  'volumeUp',
  'volumeDown',
])

function changeVolume(delta: number) {
  const audio = useAudioStore.getState()
  const next = clamp(Math.round((audio.volume + delta) * 100) / 100, 0, 1)
  audio.setVolume(next)
  if (audio.muted) audio.setMuted(false)
  showHud(`Volume ${formatPercent(next)}`)
}

function seekBy(delta: number) {
  const { track, currentTime, duration } = usePlaybackStore.getState()
  if (!track || track.source === 'mic') return // a live input has no timeline
  const next = clamp(currentTime + delta, 0, duration || Infinity)
  seekTo(next)
  showHud(`${formatTime(next)} / ${formatTime(duration)}`)
}

function runAction(action: ShortcutAction) {
  switch (action) {
    case 'togglePlay':
      void togglePlayback()
      break
    case 'seekBack':
      seekBy(-SEEK_STEP_SECONDS)
      break
    case 'seekForward':
      seekBy(SEEK_STEP_SECONDS)
      break
    case 'volumeUp':
      changeVolume(VOLUME_STEP)
      break
    case 'volumeDown':
      changeVolume(-VOLUME_STEP)
      break
    case 'toggleMute': {
      const audio = useAudioStore.getState()
      audio.toggleMute()
      showHud(audio.muted ? 'Unmuted' : 'Muted')
      break
    }
    case 'toggleLoop': {
      const playback = usePlaybackStore.getState()
      playback.toggleLoop()
      showHud(playback.loop ? 'Loop off' : 'Loop on')
      break
    }
    case 'toggleFullscreen':
      void toggleFullscreen()
      break
    case 'toggleHelp': {
      const ui = useUiStore.getState()
      ui.setHelpOpen(!ui.helpOpen)
      break
    }
    default: {
      const mode = MODE_ACTIONS[action]
      if (mode) {
        useVisualizerStore.getState().setMode(mode[0])
        showHud(mode[1])
      }
    }
  }
}

/** Global player shortcuts, mounted once at the app root. */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      const action = mapKeyToAction({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        target: toKeyTarget(event.target),
      })
      if (!action) return
      event.preventDefault() // stops Space and the arrows scrolling the page
      // holding a key repeats seek and volume, but must not flicker toggles
      if (event.repeat && !REPEATABLE.has(action)) return
      runAction(action)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
