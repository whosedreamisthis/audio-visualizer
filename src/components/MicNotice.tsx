import { MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMicStore, type MicStatus } from '@/store/micStore'

const NOTICES: Partial<Record<MicStatus, { title: string; help: string }>> = {
  denied: {
    title: 'Microphone access is blocked',
    help: "Click the lock icon in your browser's address bar, set Microphone to Allow, then try again.",
  },
  'no-device': {
    title: 'No microphone found',
    help: 'Connect a microphone and try again.',
  },
  unsupported: {
    title: 'Microphone not available here',
    help: 'Microphone input needs a secure (HTTPS) page and a supported browser.',
  },
  failed: {
    title: "Couldn't start the microphone",
    help: 'Another app may be using it. Close it and try again.',
  },
}

/** Explains why the microphone isn't working; renders nothing while it's fine or untried. */
export function MicNotice({ className }: { className?: string }) {
  const status = useMicStore((s) => s.status)
  const notice = NOTICES[status]
  if (!notice) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-2 rounded-lg border border-destructive/40 p-3 text-left text-xs',
        className,
      )}
    >
      <MicOff className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="space-y-0.5">
        <p className="font-medium">{notice.title}</p>
        <p className="text-muted-foreground">{notice.help}</p>
      </div>
    </div>
  )
}
