import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePlaybackStore } from '@/store/playbackStore'
import { useUiStore } from '@/store/uiStore'

/** Opens the "load a song or pick a preset" card, even while a track is playing. */
export function OpenFileButton() {
  const loading = usePlaybackStore((s) => s.status === 'loading')
  const setSourcePickerOpen = useUiStore((s) => s.setSourcePickerOpen)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="min-h-11 max-sm:size-11 max-sm:p-0"
            aria-label="Load song"
            disabled={loading}
            onClick={() => setSourcePickerOpen(true)}
          />
        }
      >
        <FolderOpen />
        <span className="max-sm:hidden">Load song</span>
      </TooltipTrigger>
      <TooltipContent>Load a song or pick a preset</TooltipContent>
    </Tooltip>
  )
}
