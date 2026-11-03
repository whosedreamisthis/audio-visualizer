import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SHORTCUT_HELP } from '@/lib/shortcuts'
import { useUiStore } from '@/store/uiStore'

export function ShortcutsDialog() {
  const open = useUiStore((s) => s.helpOpen)
  const setOpen = useUiStore((s) => s.setHelpOpen)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
          <Dialog.Title className="text-base font-semibold">
            Keyboard shortcuts
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Keys that control playback, volume, fullscreen and the visualizer
          </Dialog.Description>
          <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
            {SHORTCUT_HELP.map(({ keys, label }) => (
              <div key={label} className="contents">
                <dt className="flex gap-1">
                  {keys.map((key) => (
                    <kbd
                      key={key}
                      className="min-w-6 rounded border bg-muted px-1.5 py-0.5 text-center text-xs font-medium"
                    >
                      {key}
                    </kbd>
                  ))}
                </dt>
                <dd className="text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3"
                aria-label="Close"
              />
            }
          >
            <X />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
