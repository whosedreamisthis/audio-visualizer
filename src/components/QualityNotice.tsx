import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/uiStore'

/** Shown when the render loop fell back to cheaper settings; lets the user undo it. */
export function QualityNotice() {
  const reduced = useUiStore((s) => s.qualityReduced)
  const forceHighQuality = useUiStore((s) => s.forceHighQuality)

  if (!reduced) return null

  return (
    <div
      role="status"
      className="absolute right-2 bottom-2 z-20 flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-lg bg-black/70 py-1 pr-1 pl-3 text-xs text-white backdrop-blur"
    >
      <span>Reduced visual quality to keep playback smooth.</span>
      <Button
        size="sm"
        variant="secondary"
        className="min-h-9"
        onClick={forceHighQuality}
      >
        High quality
      </Button>
    </div>
  )
}
