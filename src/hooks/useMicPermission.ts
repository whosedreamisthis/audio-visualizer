import { useEffect } from 'react'
import { useMicStore } from '@/store/micStore'

/**
 * Mirror the browser's microphone permission into the mic store so a blocked
 * mic is explained before the user clicks. The Permissions API is optional
 * (older Safari and Firefox reject the `microphone` name), so failures are ignored.
 */
export function useMicPermission(): void {
  useEffect(() => {
    let cancelled = false
    let permission: PermissionStatus | undefined

    const apply = () => {
      if (permission) useMicStore.getState().setStatus(permission.state)
    }

    async function watch() {
      try {
        const result = await navigator.permissions?.query({
          name: 'microphone' as PermissionName,
        })
        if (!result || cancelled) return
        permission = result
        apply()
        result.addEventListener('change', apply)
      } catch {
        // unsupported: the status is learned from the first attempt instead
      }
    }
    void watch()

    return () => {
      cancelled = true
      permission?.removeEventListener('change', apply)
    }
  }, [])
}
