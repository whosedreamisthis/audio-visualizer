import type { Ref } from 'react'
import { handleAudioFiles } from '@/audio/loadAudioFile'
import { ACCEPTED_AUDIO_EXTENSIONS } from '@/lib/constants'

const FILE_ACCEPT = `audio/*,${ACCEPTED_AUDIO_EXTENSIONS.join(',')}`

/** Hidden file input that loads the chosen audio file. Trigger it with `ref.current?.click()`. */
export function AudioFileInput({ ref }: { ref: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      type="file"
      accept={FILE_ACCEPT}
      multiple
      className="hidden"
      aria-label="Choose an audio file"
      onChange={(event) => {
        const files = Array.from(event.target.files ?? [])
        event.target.value = '' // allow picking the same file again
        void handleAudioFiles(files)
      }}
    />
  )
}
