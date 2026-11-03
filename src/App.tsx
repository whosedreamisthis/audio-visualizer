import { useEffect } from 'react'
import { Maximize, SlidersHorizontal } from 'lucide-react'
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
import { bindEngineToStore } from '@/audio/bindEngineToStore'
import { getAudioEngine } from '@/audio/engine'
import { useAudioEvents } from '@/hooks/useAudioEvents'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useUiStore } from '@/store/uiStore'

function App() {
  useAudioEvents()
  useEffect(() => bindEngineToStore(getAudioEngine()), [])

  const controlsOpen = useUiStore((s) => s.controlsOpen)
  const setControlsOpen = useUiStore((s) => s.setControlsOpen)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-3 pt-[env(safe-area-inset-top)] sm:px-4">
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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label="Fullscreen"
                />
              }
            >
              <Maximize />
            </TooltipTrigger>
            <TooltipContent>Fullscreen (F)</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <CanvasStage />
        </main>
        {isDesktop && (
          <aside className="w-80 shrink-0 border-l p-4">
            <ControlPanel />
          </aside>
        )}
      </div>

      <PlayerBar />

      {!isDesktop && (
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
