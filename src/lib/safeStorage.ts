const memory = new Map<string, string>()

/** In-memory fallback used when localStorage is unavailable (private mode, blocked data, tests). */
const memoryStorage: Storage = {
  get length() {
    return memory.size
  },
  clear: () => memory.clear(),
  getItem: (key) => memory.get(key) ?? null,
  key: (index) => Array.from(memory.keys())[index] ?? null,
  removeItem: (key) => {
    memory.delete(key)
  },
  setItem: (key, value) => {
    memory.set(key, value)
  },
}

/** `localStorage` when usable, otherwise an in-memory store. */
export function getSafeStorage(): Storage {
  try {
    const storage = globalThis.localStorage
    const probe = '__av_probe__'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return memoryStorage
  }
}
