export type ShortcutAction =
  | 'togglePlay'
  | 'seekBack'
  | 'seekForward'
  | 'volumeUp'
  | 'volumeDown'
  | 'toggleMute'
  | 'toggleLoop'
  | 'toggleFullscreen'
  | 'modeWaveform'
  | 'modeBars'
  | 'modeParticles'
  | 'toggleHelp'
  | 'toggleFps'

/** The parts of a focused element that decide whether a shortcut should fire. */
export interface KeyTarget {
  tag: string
  /** `type` attribute of an input. */
  type?: string
  role?: string | null
  isContentEditable?: boolean
}

export interface KeyInput {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  target: KeyTarget | null
}

export const SEEK_STEP_SECONDS = 5
export const VOLUME_STEP = 0.05

const KEY_ACTIONS: Record<string, ShortcutAction> = {
  ' ': 'togglePlay',
  ArrowLeft: 'seekBack',
  ArrowRight: 'seekForward',
  ArrowUp: 'volumeUp',
  ArrowDown: 'volumeDown',
  m: 'toggleMute',
  l: 'toggleLoop',
  f: 'toggleFullscreen',
  '1': 'modeWaveform',
  '2': 'modeBars',
  '3': 'modeParticles',
  '?': 'toggleHelp',
  p: 'toggleFps',
}

/** Display list for the help dialog; keep in sync with `KEY_ACTIONS`. */
export const SHORTCUT_HELP: { keys: string[]; label: string }[] = [
  { keys: ['Space'], label: 'Play / pause' },
  { keys: ['←', '→'], label: 'Seek 5 seconds back / forward' },
  { keys: ['↑', '↓'], label: 'Volume up / down' },
  { keys: ['M'], label: 'Mute' },
  { keys: ['L'], label: 'Loop' },
  { keys: ['F'], label: 'Fullscreen' },
  { keys: ['1', '2', '3'], label: 'Waveform / Bars / Particles' },
  { keys: ['P'], label: 'Performance meter (FPS)' },
  { keys: ['?'], label: 'Show this help' },
]

const TEXT_INPUT_TYPES_EXCLUDED = new Set([
  'range',
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'file',
])

const ARROW_ACTIONS = new Set<ShortcutAction>([
  'seekBack',
  'seekForward',
  'volumeUp',
  'volumeDown',
])

function isTextEntry(target: KeyTarget): boolean {
  if (target.isContentEditable) return true
  const tag = target.tag.toLowerCase()
  if (tag === 'textarea' || tag === 'select') return true
  return tag === 'input' && !TEXT_INPUT_TYPES_EXCLUDED.has(target.type ?? 'text')
}

/** Sliders use the arrow keys themselves. */
function ownsArrows(target: KeyTarget): boolean {
  return (
    target.role === 'slider' ||
    (target.tag.toLowerCase() === 'input' && target.type === 'range')
  )
}

/** Focused controls activate on Space, so it must not also toggle playback. */
function ownsSpace(target: KeyTarget): boolean {
  const tag = target.tag.toLowerCase()
  if (tag === 'button' || tag === 'a' || tag === 'summary') return true
  if (tag === 'input') return true // checkbox, radio, range, buttons
  return (
    target.role === 'button' ||
    target.role === 'switch' ||
    target.role === 'checkbox' ||
    target.role === 'tab' ||
    target.role === 'slider'
  )
}

/** Maps a keydown to a player action, or null when it should be left alone. */
export function mapKeyToAction(input: KeyInput): ShortcutAction | null {
  if (input.ctrlKey || input.metaKey || input.altKey) return null

  const key = input.key.length === 1 ? input.key.toLowerCase() : input.key
  const action = KEY_ACTIONS[key]
  if (!action) return null

  const { target } = input
  if (target) {
    if (isTextEntry(target)) return null
    if (action === 'togglePlay' && ownsSpace(target)) return null
    if (ARROW_ACTIONS.has(action) && ownsArrows(target)) return null
  }
  return action
}

export function toKeyTarget(element: EventTarget | null): KeyTarget | null {
  if (!(element instanceof HTMLElement)) return null
  return {
    tag: element.tagName,
    type: element instanceof HTMLInputElement ? element.type : undefined,
    role: element.getAttribute('role'),
    isContentEditable: element.isContentEditable,
  }
}
