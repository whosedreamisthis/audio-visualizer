import { useRef } from 'react'
import { ListMusic } from 'lucide-react'
import { AudioFileInput } from '@/components/AudioFileInput'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePlaybackStore } from '@/store/playbackStore'

/** Always-available way to load a track, including while another one is playing. */
export function OpenFileButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const loading = usePlaybackStore((s) => s.status === 'loading')

  return (
    <>
      <AudioFileInput ref={inputRef} />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              className="min-h-11 max-sm:size-11 max-sm:p-0"
              aria-label="Load song"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
            />
          }
        >
          <ListMusic />
          <span className="max-sm:hidden">Load song</span>
        </TooltipTrigger>
        <TooltipContent>Load a song (or drop one anywhere)</TooltipContent>
      </Tooltip>
    </>
  )
}
