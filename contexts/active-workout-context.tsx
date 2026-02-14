import type { WorkoutExercise, WorkoutPlan, WorkoutSession } from '@/types/workout'
import { clearPersistedSession, loadSession, saveSession } from '@/utils/session-storage'
import { createContext, useContext, useState } from 'react'

const isFinished = (item: { status: string }) =>
  item.status === 'completed' || item.status === 'skipped'

const advanceToNextExercise = (
  exercises: WorkoutExercise[],
  fromIndex: number
): { exercises: WorkoutExercise[]; activeIndex: number } => {
  const nextIndex = exercises.findIndex(
    (e, i) => i > fromIndex && isFinished(e) === false
  )

  if (nextIndex === -1) return { exercises, activeIndex: fromIndex }

  return {
    exercises: exercises.map((ex, i) =>
      i === nextIndex ? { ...ex, status: 'active' } : ex
    ),
    activeIndex: nextIndex,
  }
}

const updateSession = (
  state: WorkoutSession,
  exercises: WorkoutExercise[],
  activeExerciseIndex: number
): WorkoutSession => ({
  ...state,
  plan: { ...state.plan, exercises },
  activeExerciseIndex,
})

const buildInitialSession = (plan: WorkoutPlan): WorkoutSession => ({
  id: `session-${Date.now()}`,
  plan: {
    ...plan,
    exercises: plan.exercises.map((ex, i) => ({
      ...ex,
      status: i === 0 ? 'active' : 'pending',
    })),
  },
  status: 'in_progress',
  startedAt: Date.now(),
  activeExerciseIndex: 0,
})

const applyCompleteSet = (
  state: WorkoutSession,
  exerciseId: string,
  setId: string,
  actualReps: number | null,
  actualWeight: number | null
): WorkoutSession => {
  const exercises = state.plan.exercises.map((ex) => {
    if (ex.id !== exerciseId) return ex

    const sets = ex.sets.map((s) =>
      s.id !== setId
        ? s
        : { ...s, actualReps, actualWeight, status: 'completed' as const }
    )

    const allDone = sets.every((s) => isFinished(s))
    return { ...ex, sets, status: allDone ? ('completed' as const) : ex.status }
  })

  const currentEx = exercises[state.activeExerciseIndex]
  if (currentEx?.status !== 'completed') {
    return updateSession(state, exercises, state.activeExerciseIndex)
  }

  const advanced = advanceToNextExercise(exercises, state.activeExerciseIndex)
  return updateSession(state, advanced.exercises, advanced.activeIndex)
}

const applyEditSet = (
  state: WorkoutSession,
  exerciseId: string,
  setId: string,
  actualReps: number | null,
  actualWeight: number | null
): WorkoutSession => {
  const exercises = state.plan.exercises.map((ex) => {
    if (ex.id !== exerciseId) return ex
    const sets = ex.sets.map((s) =>
      s.id !== setId ? s : { ...s, actualReps, actualWeight }
    )
    return { ...ex, sets }
  })
  return updateSession(state, exercises, state.activeExerciseIndex)
}

const applySkipExercise = (
  state: WorkoutSession,
  exerciseId: string
): WorkoutSession => {
  const exercises = state.plan.exercises.map((ex) =>
    ex.id !== exerciseId
      ? ex
      : { ...ex, status: 'skipped' as const, sets: ex.sets.map((s) => ({ ...s, status: 'skipped' as const })) }
  )

  const advanced = advanceToNextExercise(exercises, state.activeExerciseIndex)
  return updateSession(state, advanced.exercises, advanced.activeIndex)
}

const applyNavigateExercise = (
  state: WorkoutSession,
  index: number
): WorkoutSession => {
  const exercises = state.plan.exercises.map((ex, i) =>
    i === index && ex.status === 'pending' ? { ...ex, status: 'active' as const } : ex
  )
  return updateSession(state, exercises, index)
}

interface WorkoutContextValue {
  session: WorkoutSession | null
  activeWorkoutId: string | null
  completedSession: WorkoutSession | null
  currentExercise: WorkoutExercise | null
  progress: { completed: number; total: number }
  startWorkout: (plan: WorkoutPlan) => void
  completeSet: (exerciseId: string, setId: string, actualReps: number | null, actualWeight: number | null) => void
  editSet: (exerciseId: string, setId: string, actualReps: number | null, actualWeight: number | null) => void
  skipExercise: (exerciseId: string) => void
  navigateExercise: (index: number) => void
  finishSession: () => void
  clearSession: () => void
}

const ActiveWorkoutContext = createContext<WorkoutContextValue | undefined>(undefined)

export const ActiveWorkoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<WorkoutSession | null>(() => loadSession())

  const updateAndPersist = (updater: (prev: WorkoutSession) => WorkoutSession) => {
    setSession((prev) => {
      if (prev === null) return prev
      const next = updater(prev)
      saveSession(next)
      return next
    })
  }

  const startWorkout = (plan: WorkoutPlan) => {
    const initial = buildInitialSession(plan)
    saveSession(initial)
    setSession(initial)
  }

  const completeSet = (exerciseId: string, setId: string, actualReps: number | null, actualWeight: number | null) => {
    updateAndPersist((prev) => applyCompleteSet(prev, exerciseId, setId, actualReps, actualWeight))
  }

  const editSet = (exerciseId: string, setId: string, actualReps: number | null, actualWeight: number | null) => {
    updateAndPersist((prev) => applyEditSet(prev, exerciseId, setId, actualReps, actualWeight))
  }

  const skipExercise = (exerciseId: string) => {
    updateAndPersist((prev) => applySkipExercise(prev, exerciseId))
  }

  const navigateExercise = (index: number) => {
    updateAndPersist((prev) => applyNavigateExercise(prev, index))
  }

  const finishSession = () => {
    setSession((prev) => {
      if (prev === null) return prev
      const next: WorkoutSession = { ...prev, status: 'completed', completedAt: Date.now() }
      saveSession(next)
      return next
    })
  }

  const clearSession = () => {
    clearPersistedSession()
    setSession(null)
  }

  const activeWorkoutId = session?.status === 'in_progress' ? session.plan.id : null

  const completedSession = session?.status === 'completed' ? session : null

  const currentExercise = session === null
    ? null
    : session.plan.exercises[session.activeExerciseIndex] ?? null

  const progress = session === null
    ? { completed: 0, total: 0 }
    : { completed: session.plan.exercises.filter(isFinished).length, total: session.plan.exercises.length }

  const value: WorkoutContextValue = {
    session,
    activeWorkoutId,
    completedSession,
    currentExercise,
    progress,
    startWorkout,
    completeSet,
    editSet,
    skipExercise,
    navigateExercise,
    finishSession,
    clearSession,
  }

  return <ActiveWorkoutContext.Provider value={value}>{children}</ActiveWorkoutContext.Provider>
}

export const useActiveWorkout = (): WorkoutContextValue => {
  const context = useContext(ActiveWorkoutContext)
  if (context === undefined) {
    throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider')
  }
  return context
}
