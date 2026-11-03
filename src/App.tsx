import { useEffect } from 'react'
import { Maximize, Minimize, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AppLogo } from '@/components/AppLogo'
import { CanvasStage } from '@/components/CanvasStage'
import { ControlPanel } from '@/components/ControlPanel'
import { OpenFileButton } from '@/components/OpenFileButton'
import { PlayerBar } from '@/components/PlayerBar'
import { ShortcutsDialog } from '@/components/ShortcutsDialog'
import { bindEngineToStore } from '@/audio/bindEngineToStore'
import { getAudioEngine } from '@/audio/engine'
import { useAudioEvents } from '@/hooks/useAudioEvents'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { isFullscreenSupported, toggleFullscreen } from '@/lib/fullscreen'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

const FULLSCREEN_SUPPORTED = isFullscreenSupported()

function App() {
  useAudioEvents()
  useApplyTheme()
  useFullscreen()
  useKeyboardShortcuts()
  useEffect(() => bindEngineToStore(getAudioEngine()), [])

  const controlsOpen = useUiStore((s) => s.controlsOpen)
  const setControlsOpen = useUiStore((s) => s.setControlsOpen)
  const fullscreen = useUiStore((s) => s.fullscreen)
  const controlsVisible = useUiStore((s) => s.controlsVisible)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  // In fullscreen the header and player bar float over the canvas and fade out when idle
  const floating = (edge: 'top-0' | 'bottom-0') =>
    fullscreen &&
    cn(
      'absolute inset-x-0 z-10 bg-background/80 backdrop-blur transition-opacity duration-300',
      edge,
      !controlsVisible && 'pointer-events-none opacity-0',
    )

  return (
    <div
      className={cn(
        'relative flex h-dvh flex-col overflow-hidden bg-background text-foreground',
        fullscreen && !controlsVisible && 'cursor-none',
      )}
    >
      <header
        className={cn(
          'flex h-14 shrink-0 items-center justify-between border-b px-3 pt-[env(safe-area-inset-top)] sm:px-4',
          floating('top-0'),
        )}
      >
        <div className="flex items-center gap-2">
          <AppLogo className="size-5" />
          <h1 className="text-sm font-semibold">Audio Visualizer Studio</h1>
        </div>
        <div className="flex items-center gap-1">
          <OpenFileButton />
          {!isDesktop && (
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => setControlsOpen(true)}
            >
              <SlidersHorizontal /> Controls
            </Button>
          )}
          {FULLSCREEN_SUPPORTED && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    onClick={() => void toggleFullscreen()}
                  />
                }
              >
                {fullscreen ? <Minimize /> : <Maximize />}
              </TooltipTrigger>
              <TooltipContent>
                {fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <CanvasStage />
        </main>
        {isDesktop && !fullscreen && (
          <aside className="w-80 shrink-0 border-l p-4">
            <ControlPanel />
          </aside>
        )}
      </div>

      <div className={cn('shrink-0', floating('bottom-0'))}>
        <PlayerBar />
      </div>

      <ShortcutsDialog />

      {!isDesktop && !fullscreen && (
        <Sheet open={controlsOpen} onOpenChange={setControlsOpen}>
          <SheetContent
            side={isTablet ? 'right' : 'bottom'}
            className={
              isTablet
                ? 'w-96 max-w-full p-4'
                : 'max-h-[85dvh] rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
            }
          >
            <SheetHeader className="p-0">
              <SheetTitle>Controls</SheetTitle>
              <SheetDescription className="sr-only">
                Mixer, equalizer, visual settings and presets
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ControlPanel />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

export default App
