import { Mic, Play, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const TRACKS = [
  { id: 'a', title: 'Midnight Drive', artist: 'Sample Artist', license: 'CC0' },
  { id: 'b', title: 'Neon Rain', artist: 'Sample Artist', license: 'CC-BY' },
  { id: 'c', title: 'Slow Tide', artist: 'Sample Artist', license: 'CC0' },
]

export function PresetsPanel() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">Preset tracks</h3>
        <ul className="space-y-2">
          {TRACKS.map((track) => (
            <li key={track.id}>
              <Card className="flex-row items-center gap-3 p-3">
                <Button size="icon" variant="secondary" aria-label={`Play ${track.title}`}>
                  <Play />
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{track.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {track.artist} · {track.license}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Input</h3>
        <Button variant="outline" className="min-h-11 w-full justify-start gap-2">
          <Mic /> Use microphone
        </Button>
      </section>

      <Separator />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Saved presets</h3>
          <Button variant="ghost" size="xs">
            <Save /> Save current
          </Button>
        </div>
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          No saved presets yet.
        </p>
      </section>
    </div>
  )
}
