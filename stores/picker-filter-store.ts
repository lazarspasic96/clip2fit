import { EMPTY_FILTERS } from '@/types/catalog'
import type { CatalogFilters } from '@/types/catalog'

let filters: CatalogFilters = { ...EMPTY_FILTERS }
let version = 0
const listeners = new Set<() => void>()

const notify = () => {
  version += 1
  listeners.forEach((l) => l())
}

export const pickerFilterStore = {
  getFilters: (): CatalogFilters => filters,

  setFilters: (next: CatalogFilters) => {
    filters = { ...next }
    notify()
  },

  resetFilters: () => {
    filters = { ...EMPTY_FILTERS }
    notify()
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },

  getSnapshot: (): number => version,
}
