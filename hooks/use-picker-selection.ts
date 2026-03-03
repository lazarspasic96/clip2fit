import { useRef } from 'react'

import type { CatalogExercise } from '@/types/catalog'

interface PickerSelection {
  isSelected: (id: string) => boolean
  isDisabled: (id: string) => boolean
  toggleExercise: (exercise: CatalogExercise) => void
  getSelectedCount: () => number
  getSelected: () => CatalogExercise[]
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
}

export const usePickerSelection = (existingIds: Set<string>): PickerSelection => {
  const selectedRef = useRef<Map<string, CatalogExercise>>(new Map())
  const versionRef = useRef(0)
  const listenersRef = useRef<Set<() => void>>(new Set())

  const notify = () => {
    versionRef.current += 1
    listenersRef.current.forEach((l) => l())
  }

  const isSelected = (id: string) => selectedRef.current.has(id)

  const isDisabled = (id: string) => existingIds.has(id)

  const toggleExercise = (exercise: CatalogExercise) => {
    if (existingIds.has(exercise.id)) return
    if (selectedRef.current.has(exercise.id)) {
      selectedRef.current.delete(exercise.id)
    } else {
      selectedRef.current.set(exercise.id, exercise)
    }
    notify()
  }

  const getSelectedCount = () => selectedRef.current.size

  const getSelected = () => Array.from(selectedRef.current.values())

  const subscribe = (listener: () => void) => {
    listenersRef.current.add(listener)
    return () => { listenersRef.current.delete(listener) }
  }

  const getSnapshot = () => versionRef.current

  return { isSelected, isDisabled, toggleExercise, getSelectedCount, getSelected, subscribe, getSnapshot }
}
