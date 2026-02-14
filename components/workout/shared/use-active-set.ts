import { useActiveWorkout } from '@/contexts/active-workout-context'
import type { WorkoutSet } from '@/types/workout'

interface ActiveSetResult {
  activeSet: WorkoutSet | null
  activeSetIndex: number
  completedCount: number
  totalCount: number
}

export const useActiveSet = (): ActiveSetResult => {
  const { currentExercise } = useActiveWorkout()

  if (currentExercise === null) {
    return { activeSet: null, activeSetIndex: -1, completedCount: 0, totalCount: 0 }
  }

  const sets = currentExercise.sets
  const pendingIndex = sets.findIndex((s) => s.status === 'pending')
  const activeSet = pendingIndex !== -1 ? sets[pendingIndex] : null
  const completedCount = sets.filter((s) => s.status === 'completed').length

  return {
    activeSet,
    activeSetIndex: pendingIndex,
    completedCount,
    totalCount: sets.length,
  }
}
