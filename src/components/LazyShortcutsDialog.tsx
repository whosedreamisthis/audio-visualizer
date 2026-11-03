import { lazy, Suspense, useState } from 'react'
import { useUiStore } from '@/store/uiStore'

const ShortcutsDialog = lazy(() =>
  import('@/components/ShortcutsDialog').then((m) => ({
    default: m.ShortcutsDialog,
  })),
)

/**
 * Loads the shortcut help dialog the first time it is opened, then keeps it
 * mounted so its close animation still plays.
 */
export function LazyShortcutsDialog() {
  const open = useUiStore((s) => s.helpOpen)
  const [wasOpened, setWasOpened] = useState(open)
  if (open && !wasOpened) setWasOpened(true)

  if (!wasOpened) return null
  return (
    <Suspense fallback={null}>
      <ShortcutsDialog />
    </Suspense>
  )
}
