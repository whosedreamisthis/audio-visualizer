import type { ReactNode } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ControlRowProps {
  label: string
  value?: string
  /** Shows the value in a warning style with an icon (never color alone). */
  warning?: string
  onReset?: () => void
  children: ReactNode
}

export function ControlRow({
  label,
  value,
  warning,
  onReset,
  children,
}: ControlRowProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs tabular-nums',
                warning
                  ? 'font-semibold text-amber-500'
                  : 'text-muted-foreground',
              )}
              title={warning}
            >
              {warning && <TriangleAlert className="size-3.5" aria-hidden />}
              {warning && <span className="sr-only">Warning: {warning}.</span>}
              {value}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Reset ${label}`}
            onClick={onReset}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}
