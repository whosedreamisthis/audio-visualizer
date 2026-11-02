import { AudioEngine } from './AudioEngine'

let instance: AudioEngine | null = null

/** The app-wide engine. Created on first use so nothing touches Web Audio at import time. */
export function getAudioEngine(): AudioEngine {
  instance ??= new AudioEngine()
  return instance
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    instance?.dispose()
    instance = null
  })
}
