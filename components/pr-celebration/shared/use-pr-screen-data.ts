import { useRouter } from 'expo-router'

import { useActiveWorkout } from '@/contexts/active-workout-context'
import type { ApiPR } from '@/types/api'
import type { WorkoutSession } from '@/types/workout'

import { buildWorkoutSummary, type WorkoutSummary } from './workout-summary-builder'

export interface PrScreenData {
  prs: ApiPR[]
  session: WorkoutSession
  summary: WorkoutSummary
  onDismiss: () => void
  onNavigateToExercise: (catalogExerciseId: string | null, exerciseName: string) => void
}

export const usePrScreenData = (): PrScreenData | null => {
  const router = useRouter()
  const { session, finishResult, clearFinishResult, clearSession } = useActiveWorkout()

  if (finishResult === null || session === null || finishResult.prs.length === 0) return null

  const enrichedPrs = finishResult.prs.map((pr) => ({
    ...pr,
    exercise_name:
      pr.exercise_name ||
      session.plan.exercises.find((ex) => ex.id === pr.exercise_id)?.name ||
      'Unknown Exercise',
  }))

  const summary = buildWorkoutSummary(session)

  const onDismiss = () => {
    clearFinishResult()
    clearSession()
    router.replace('/(protected)/(tabs)/(home)' as never)
  }

  const onNavigateToExercise = (catalogExerciseId: string | null, exerciseName: string) => {
    clearFinishResult()
    clearSession()
    const params = new URLSearchParams()
    params.set('exerciseName', exerciseName)
    if (catalogExerciseId !== null) params.set('catalogExerciseId', catalogExerciseId)
    router.replace(`/(protected)/exercise-history?${params.toString()}` as never)
  }

  return { prs: enrichedPrs, session, summary, onDismiss, onNavigateToExercise }
}
