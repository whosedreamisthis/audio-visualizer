import { Music, Maximize, Play, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Music className="size-5" aria-hidden />
          <h1 className="text-sm font-semibold">Audio Visualizer Studio</h1>
        </div>
        <Button variant="ghost" size="icon" aria-label="Fullscreen">
          <Maximize />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="relative flex-1 bg-black/40">
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Canvas area
          </div>
        </main>
        <aside className="hidden w-80 shrink-0 border-l p-4 text-sm text-muted-foreground md:block">
          Sidebar
        </aside>
      </div>

      <footer className="flex h-20 shrink-0 items-center justify-center gap-2 border-t px-4">
        <Button variant="ghost" size="icon" aria-label="Previous" disabled>
          <SkipBack />
        </Button>
        <Button size="icon" aria-label="Play" disabled>
          <Play />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Next" disabled>
          <SkipForward />
        </Button>
      </footer>
    </div>
  )
}

export default App
