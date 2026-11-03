import { describe, expect, it } from 'vitest'
import manifest from '../../public/presets/manifest.json'
import { parseManifest, resolveAssetUrl } from './presets'

const valid = {
  id: 'a',
  title: 'Track A',
  artist: 'Someone',
  url: 'presets/a.mp3',
  license: 'CC0',
  sourceUrl: 'https://example.com',
  bpm: 120,
  suggestedTheme: 'neon',
}

describe('parseManifest', () => {
  it('accepts valid data, including optional fields omitted', () => {
    const minimal = { id: 'b', title: 'B', artist: 'X', url: 'presets/b.mp3', license: 'CC0' }
    expect(parseManifest([valid, minimal])).toHaveLength(2)
  })

  it('accepts the bundled manifest', () => {
    expect(parseManifest(manifest).length).toBeGreaterThanOrEqual(3)
  })

  it('rejects non-arrays and non-object entries', () => {
    expect(() => parseManifest({})).toThrow()
    expect(() => parseManifest(['x'])).toThrow()
  })

  it.each(['id', 'title', 'artist', 'url', 'license'])('rejects a missing %s', (field) => {
    expect(() => parseManifest([{ ...valid, [field]: undefined }])).toThrow(field)
  })

  it('rejects invalid optional fields', () => {
    expect(() => parseManifest([{ ...valid, bpm: -5 }])).toThrow('bpm')
    expect(() => parseManifest([{ ...valid, suggestedTheme: 'pink' }])).toThrow('suggestedTheme')
    expect(() => parseManifest([{ ...valid, title: '  ' }])).toThrow('title')
  })

  it('rejects duplicate ids', () => {
    expect(() => parseManifest([valid, valid])).toThrow('duplicate')
  })
})

describe('resolveAssetUrl', () => {
  it('prefixes the base URL', () => {
    expect(resolveAssetUrl('presets/a.mp3', '/')).toBe('/presets/a.mp3')
    expect(resolveAssetUrl('presets/a.mp3', '/app/')).toBe('/app/presets/a.mp3')
    expect(resolveAssetUrl('/presets/a.mp3', '/app')).toBe('/app/presets/a.mp3')
  })

  it('leaves absolute URLs alone', () => {
    expect(resolveAssetUrl('https://x.test/a.mp3', '/app/')).toBe('https://x.test/a.mp3')
  })
})
