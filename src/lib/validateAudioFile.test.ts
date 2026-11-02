import { describe, expect, it } from 'vitest'
import { MAX_AUDIO_FILE_BYTES } from './constants'
import { validateAudioFile } from './validateAudioFile'

const file = (name: string, type: string, size = 1024) => ({ name, type, size })

describe('validateAudioFile', () => {
  it('accepts supported extensions and MIME types', () => {
    expect(validateAudioFile(file('a.mp3', 'audio/mpeg')).ok).toBe(true)
    expect(validateAudioFile(file('a.wav', 'audio/wav')).ok).toBe(true)
    expect(validateAudioFile(file('a.ogg', 'audio/ogg')).ok).toBe(true)
    expect(validateAudioFile(file('a.flac', 'audio/flac')).ok).toBe(true)
    expect(validateAudioFile(file('a.m4a', 'audio/mp4')).ok).toBe(true)
  })

  it('treats extensions case-insensitively', () => {
    expect(validateAudioFile(file('LOUD.MP3', 'audio/mpeg')).ok).toBe(true)
  })

  it('accepts a valid extension when the browser gives no MIME type', () => {
    expect(validateAudioFile(file('song.flac', '')).ok).toBe(true)
  })

  it('accepts a known MIME type when the name has no extension', () => {
    expect(validateAudioFile(file('track', 'audio/mpeg')).ok).toBe(true)
  })

  it('rejects other file types', () => {
    const result = validateAudioFile(file('notes.txt', 'text/plain'))
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-type' })
  })

  it('rejects files with neither extension nor MIME type', () => {
    expect(validateAudioFile(file('mystery', '')).ok).toBe(false)
  })

  it('rejects empty files', () => {
    expect(validateAudioFile(file('a.mp3', 'audio/mpeg', 0))).toMatchObject({
      ok: false,
      reason: 'empty',
    })
  })

  it('rejects files over the size limit but accepts exactly the limit', () => {
    expect(
      validateAudioFile(file('big.mp3', 'audio/mpeg', MAX_AUDIO_FILE_BYTES + 1)),
    ).toMatchObject({ ok: false, reason: 'too-large' })
    expect(
      validateAudioFile(file('edge.mp3', 'audio/mpeg', MAX_AUDIO_FILE_BYTES)).ok,
    ).toBe(true)
  })

  it('names the file in the error message', () => {
    const result = validateAudioFile(file('notes.txt', 'text/plain'))
    expect(!result.ok && result.message).toContain('notes.txt')
  })
})
