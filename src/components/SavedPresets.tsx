import { useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Download, Pencil, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { resetAllSettings } from '@/lib/resetSettings'
import {
  MAX_PRESET_NAME_LENGTH,
  MAX_SAVED_PRESETS,
  parsePresetImport,
  serializePresets,
  useSavedPresetsStore,
  type PresetResult,
  type SavedPreset,
} from '@/store/savedPresetsStore'

interface NameDialogProps {
  title: string
  submitLabel: string
  initialName: string
  onSubmit: (name: string) => PresetResult
  onClose: () => void
}

function NameDialog({ title, submitLabel, initialName, onSubmit, onClose }: NameDialogProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const result = onSubmit(name)
    if (result.ok) onClose()
    else setError(result.error)
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
          <form onSubmit={submit} className="space-y-3">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Give this preset a unique name
            </Dialog.Description>
            <div className="space-y-1">
              <input
                autoFocus
                value={name}
                maxLength={MAX_PRESET_NAME_LENGTH}
                aria-label="Preset name"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'preset-name-error' : undefined}
                placeholder="Preset name"
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
              />
              {error && (
                <p id="preset-name-error" role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close render={<Button type="button" variant="ghost" />}>Cancel</Dialog.Close>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type DialogState = { kind: 'save' } | { kind: 'rename'; preset: SavedPreset } | null

function downloadJson(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function SavedPresets() {
  const presets = useSavedPresetsStore((s) => s.presets)
  const [dialog, setDialog] = useState<DialogState>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const full = presets.length >= MAX_SAVED_PRESETS

  const apply = (preset: SavedPreset) => {
    useSavedPresetsStore.getState().apply(preset.id)
    toast.success(`Applied "${preset.name}"`)
  }

  const remove = (preset: SavedPreset) => {
    const store = useSavedPresetsStore.getState()
    const index = store.presets.findIndex((p) => p.id === preset.id)
    store.remove(preset.id)
    toast(`Deleted "${preset.name}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          const current = useSavedPresetsStore.getState().presets
          const lower = preset.name.toLowerCase()
          if (current.some((p) => p.id === preset.id || p.name.toLowerCase() === lower)) {
            toast.error(`Could not restore "${preset.name}": that name is in use`)
            return
          }
          if (current.length >= MAX_SAVED_PRESETS) {
            toast.error(`Could not restore "${preset.name}": the list is full`)
            return
          }
          const next = [...current]
          next.splice(Math.min(index, next.length), 0, preset)
          useSavedPresetsStore.setState({ presets: next })
        },
      },
    })
  }

  const importFile = async (file: File) => {
    try {
      const imported = parsePresetImport(await file.text())
      const added = useSavedPresetsStore.getState().addMany(imported)
      if (added === 0) toast.info('Nothing imported: all presets already exist or the list is full')
      else toast.success(`Imported ${added} preset${added === 1 ? '' : 's'}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not import that file.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">
          Saved presets{' '}
          <span className="text-xs font-normal text-muted-foreground">
            {presets.length}/{MAX_SAVED_PRESETS}
          </span>
        </h3>
        <Button
          variant="ghost"
          size="xs"
          disabled={full}
          title={full ? `Limit of ${MAX_SAVED_PRESETS} presets reached` : undefined}
          onClick={() => setDialog({ kind: 'save' })}
        >
          <Save /> Save current
        </Button>
      </div>

      {presets.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          No saved presets yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {presets.map((preset) => (
            <li
              key={preset.id}
              className="flex items-center gap-1 rounded-lg border p-1 pl-2.5"
            >
              <button
                type="button"
                onClick={() => apply(preset)}
                className="min-w-0 flex-1 truncate rounded text-left text-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                title={`Apply "${preset.name}"`}
              >
                {preset.name}
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Rename ${preset.name}`}
                onClick={() => setDialog({ kind: 'rename', preset })}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${preset.name}`}
                onClick={() => remove(preset)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="xs"
          disabled={presets.length === 0}
          onClick={() => downloadJson('audio-visualizer-presets.json', serializePresets(presets))}
        >
          <Download /> Export
        </Button>
        <Button variant="outline" size="xs" onClick={() => fileInput.current?.click()}>
          <Upload /> Import
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            resetAllSettings()
            toast.success('All settings reset to defaults')
          }}
        >
          <RotateCcw /> Reset all settings
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void importFile(file)
          }}
        />
      </div>

      {dialog?.kind === 'save' && (
        <NameDialog
          title="Save preset"
          submitLabel="Save"
          initialName=""
          onSubmit={(name) => useSavedPresetsStore.getState().add(name)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'rename' && (
        <NameDialog
          title="Rename preset"
          submitLabel="Rename"
          initialName={dialog.preset.name}
          onSubmit={(name) => useSavedPresetsStore.getState().rename(dialog.preset.id, name)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}
