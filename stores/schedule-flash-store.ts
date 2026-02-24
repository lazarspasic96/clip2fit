import type { DayOfWeek } from '@/types/schedule'

export type FlashAction = 'assign' | 'clear'

interface FlashState {
  day: DayOfWeek
  action: FlashAction
}

let flash: FlashState | null = null
let version = 0
const listeners = new Set<() => void>()

const notify = () => {
  version += 1
  listeners.forEach((l) => l())
}

export const scheduleFlashStore = {
  flash: (day: DayOfWeek, action: FlashAction = 'assign') => {
    flash = { day, action }
    notify()
  },

  consume: (): FlashState | null => {
    const state = flash
    flash = null
    return state
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },

  getSnapshot: (): number => version,
}
