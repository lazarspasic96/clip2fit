import { pickerFilterStore } from '@/stores/picker-filter-store'
import type { CatalogExercise } from '@/types/catalog'

interface PickerRequest {
  callerId: string
  existingIds: Set<string>
}

let request: PickerRequest | null = null
let response: { callerId: string; selections: CatalogExercise[] } | null = null
let version = 0
const listeners = new Set<() => void>()

const notify = () => {
  version += 1
  listeners.forEach((l) => l())
}

export const exercisePickerStore = {
  /** Called by parent before opening picker. Stores who's requesting + resets filters. */
  request: (callerId: string, existingIds: Set<string>) => {
    request = { callerId, existingIds }
    response = null
    pickerFilterStore.resetFilters()
  },

  /** Called by picker to read the current request (existingIds etc). */
  getRequest: (): PickerRequest | null => request,

  /** Called by picker when user taps "Add to Workout". */
  respond: (selections: CatalogExercise[]) => {
    if (request === null) return
    response = { callerId: request.callerId, selections: [...selections] }
    notify()
  },

  /** Called by parent. Returns selections only if response matches callerId. */
  consumeIfMine: (callerId: string): CatalogExercise[] | null => {
    if (response === null || response.callerId !== callerId) return null
    const result = response.selections
    response = null
    return result
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },

  getSnapshot: (): number => version,
}
