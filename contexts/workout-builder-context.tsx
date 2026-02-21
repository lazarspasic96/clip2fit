import { createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'

import type { CatalogExercise, SelectedExercise } from '@/types/catalog'

interface WorkoutBuilderContextValue {
  selectedExercises: Map<string, SelectedExercise>
  addExercise: (exercise: CatalogExercise) => void
  removeExercise: (id: string) => void
  toggleExercise: (exercise: CatalogExercise) => void
  isSelected: (id: string) => boolean
  updateExercise: (id: string, updates: Partial<Pick<SelectedExercise, 'sets' | 'reps' | 'restSeconds'>>) => void
  reorderExercises: (fromIndex: number, toIndex: number) => void
  clearAll: () => void
  getOrderedExercises: () => SelectedExercise[]
  getSelectedCount: () => number
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
}

const WorkoutBuilderContext = createContext<WorkoutBuilderContextValue | null>(null)

export const WorkoutBuilderProvider = ({ children }: { children: ReactNode }) => {
  const exercisesRef = useRef<Map<string, SelectedExercise>>(new Map())
  const orderRef = useRef<string[]>([])
  const versionRef = useRef(0)
  const listenersRef = useRef<Set<() => void>>(new Set())

  const notify = () => {
    versionRef.current += 1
    listenersRef.current.forEach((listener) => listener())
  }

  const addExercise = (exercise: CatalogExercise) => {
    if (exercisesRef.current.has(exercise.id)) return
    exercisesRef.current.set(exercise.id, {
      catalogExercise: exercise,
      sets: 3,
      reps: '10',
      restSeconds: null,
    })
    orderRef.current.push(exercise.id)
    notify()
  }

  const removeExercise = (id: string) => {
    exercisesRef.current.delete(id)
    orderRef.current = orderRef.current.filter((eid) => eid !== id)
    notify()
  }

  const toggleExercise = (exercise: CatalogExercise) => {
    if (exercisesRef.current.has(exercise.id)) {
      removeExercise(exercise.id)
    } else {
      addExercise(exercise)
    }
  }

  const isSelected = (id: string) => exercisesRef.current.has(id)

  const updateExercise = (id: string, updates: Partial<Pick<SelectedExercise, 'sets' | 'reps' | 'restSeconds'>>) => {
    const existing = exercisesRef.current.get(id)
    if (existing === undefined) return
    exercisesRef.current.set(id, { ...existing, ...updates })
    notify()
  }

  const reorderExercises = (fromIndex: number, toIndex: number) => {
    const order = [...orderRef.current]
    const [moved] = order.splice(fromIndex, 1)
    order.splice(toIndex, 0, moved)
    orderRef.current = order
    notify()
  }

  const clearAll = () => {
    exercisesRef.current.clear()
    orderRef.current = []
    notify()
  }

  const getOrderedExercises = (): SelectedExercise[] =>
    orderRef.current
      .map((id) => exercisesRef.current.get(id))
      .filter((e): e is SelectedExercise => e !== undefined)

  const subscribe = (listener: () => void) => {
    listenersRef.current.add(listener)
    return () => { listenersRef.current.delete(listener) }
  }

  const getSnapshot = () => versionRef.current

  return (
    <WorkoutBuilderContext.Provider
      value={{
        selectedExercises: exercisesRef.current,
        addExercise,
        removeExercise,
        toggleExercise,
        isSelected,
        updateExercise,
        reorderExercises,
        clearAll,
        getOrderedExercises,
        getSelectedCount: () => orderRef.current.length,
        subscribe,
        getSnapshot,
      }}
    >
      {children}
    </WorkoutBuilderContext.Provider>
  )
}

export const useWorkoutBuilder = (): WorkoutBuilderContextValue => {
  const context = useContext(WorkoutBuilderContext)
  if (context === null) {
    throw new Error('useWorkoutBuilder must be used within WorkoutBuilderProvider')
  }
  return context
}
