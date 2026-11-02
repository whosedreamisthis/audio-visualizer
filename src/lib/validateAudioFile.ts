import {
  ACCEPTED_AUDIO_EXTENSIONS,
  ACCEPTED_AUDIO_MIME_TYPES,
  MAX_AUDIO_FILE_BYTES,
} from './constants'

export type AudioFileProblem = 'empty' | 'too-large' | 'unsupported-type'

export type AudioFileValidation =
  | { ok: true }
  | { ok: false; reason: AudioFileProblem; message: string }

const MAX_MB = Math.round(MAX_AUDIO_FILE_BYTES / (1024 * 1024))

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot).toLowerCase() : ''
}

/**
 * Check a selected or dropped file before loading it.
 * Accepts a known audio extension or MIME type (some browsers leave `type` empty).
 */
export function validateAudioFile(
  file: Pick<File, 'name' | 'type' | 'size'>,
): AudioFileValidation {
  if (file.size === 0) {
    return { ok: false, reason: 'empty', message: `"${file.name}" is empty.` }
  }

  if (file.size > MAX_AUDIO_FILE_BYTES) {
    return {
      ok: false,
      reason: 'too-large',
      message: `"${file.name}" is too large. The limit is ${MAX_MB} MB.`,
    }
  }

  const extensionOk = (ACCEPTED_AUDIO_EXTENSIONS as readonly string[]).includes(
    extensionOf(file.name),
  )
  const mimeOk = (ACCEPTED_AUDIO_MIME_TYPES as readonly string[]).includes(
    file.type.toLowerCase(),
  )
  if (!extensionOk && !mimeOk) {
    return {
      ok: false,
      reason: 'unsupported-type',
      message: `"${file.name}" isn't a supported audio file. Try MP3, WAV, OGG, FLAC or M4A.`,
    }
  }

  return { ok: true }
}
