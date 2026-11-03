import { THEME_IDS } from '@/lib/constants'
import { isRecord } from '@/lib/sanitize'
import type { PresetTrack, ThemeId } from '@/types'

/** Join a path onto Vite's base URL, tolerating stray slashes on either side. */
export function resolveAssetUrl(path: string, base: string = import.meta.env.BASE_URL): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path)) return path
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

function parseTrack(value: unknown, index: number): PresetTrack {
  const fail = (field: string): never => {
    throw new Error(`Invalid preset manifest: track ${index} has a bad "${field}".`)
  }
  if (!isRecord(value)) return fail('entry')

  const text = (field: string): string => {
    const v = value[field]
    return typeof v === 'string' && v.trim() !== '' ? v : fail(field)
  }
  const optionalText = (field: string): string | undefined =>
    value[field] === undefined ? undefined : text(field)

  let bpm: number | undefined
  if (value.bpm !== undefined) {
    const raw = value.bpm
    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) fail('bpm')
    bpm = raw as number
  }

  let suggestedTheme: ThemeId | undefined
  if (value.suggestedTheme !== undefined) {
    const raw = value.suggestedTheme
    if (!THEME_IDS.includes(raw as ThemeId)) fail('suggestedTheme')
    suggestedTheme = raw as ThemeId
  }

  return {
    id: text('id'),
    title: text('title'),
    artist: text('artist'),
    url: text('url'),
    license: text('license'),
    sourceUrl: optionalText('sourceUrl'),
    bpm,
    suggestedTheme,
  }
}

/** Validate untrusted manifest JSON; throws a descriptive Error when malformed. */
export function parseManifest(data: unknown): PresetTrack[] {
  if (!Array.isArray(data)) throw new Error('Invalid preset manifest: expected a list of tracks.')
  const tracks = data.map(parseTrack)
  if (new Set(tracks.map((t) => t.id)).size !== tracks.length) {
    throw new Error('Invalid preset manifest: duplicate track ids.')
  }
  return tracks
}

async function fetchOk(url: string): Promise<Response> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`)
  }
  return response
}

export async function fetchManifest(): Promise<PresetTrack[]> {
  const response = await fetchOk(resolveAssetUrl('presets/manifest.json'))
  return parseManifest(await response.json())
}

export async function fetchPresetAudio(url: string): Promise<Blob> {
  const response = await fetchOk(resolveAssetUrl(url))
  return response.blob()
}
