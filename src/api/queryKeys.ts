export const presetKeys = {
  all: ['presets'] as const,
  audio: (id: string) => ['presets', 'audio', id] as const,
}
