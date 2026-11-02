import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ControlRowProps {
  label: string
  value?: string
  onReset?: () => void
  children: ReactNode
}

export function ControlRow({ label, value, onReset, children }: ControlRowProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          {value && (
            <span className="text-xs tabular-nums text-muted-foreground">
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
