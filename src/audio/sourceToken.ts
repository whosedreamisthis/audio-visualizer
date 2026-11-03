let current = 0

/**
 * Start a new source request (file, preset or microphone). Whatever was in
 * flight before is superseded, so a slow earlier load can't overwrite a newer one.
 */
export function nextSourceToken(): number {
  current += 1
  return current
}

export function isCurrentSource(token: number): boolean {
  return token === current
}
