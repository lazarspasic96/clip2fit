import type { CatalogExercise } from '@/types/catalog'

let selections: CatalogExercise[] = []
let version = 0
const listeners = new Set<() => void>()

const notify = () => {
  version += 1
  listeners.forEach((l) => l())
}

export const exercisePickerStore = {
  setSelections: (next: CatalogExercise[]) => {
    selections = [...next]
    notify()
  },

  /** Read + clear in one call so each consumer processes exactly once. */
  consume: (): CatalogExercise[] => {
    const result = selections
    selections = []
    return result
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },

  getSnapshot: (): number => version,
}
