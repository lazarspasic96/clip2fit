import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type {
  ApiSessionExercise,
  ApiSessionPayload,
  ApiSessionResponse,
  ApiSessionSet,
} from '@/types/api'
import type { WorkoutSession } from '@/types/workout'
import { apiPost } from '@/utils/api'

const mapSetStatus = (status: string): 'completed' | 'skipped' | 'pending' => {
  if (status === 'completed') return 'completed'
  if (status === 'skipped') return 'skipped'
  return 'pending'
}

const mapExerciseStatus = (status: string): 'completed' | 'skipped' | 'pending' => {
  if (status === 'completed') return 'completed'
  if (status === 'skipped') return 'skipped'
  // 'active' and 'pending' both map to 'pending' for the API
  return 'pending'
}

export const buildSessionPayload = (session: WorkoutSession): ApiSessionPayload => {
  const exercises: ApiSessionExercise[] = session.plan.exercises.map((ex) => ({
    exercise_id: ex.id,
    status: mapExerciseStatus(ex.status),
    order: ex.order,
    sets: ex.sets.map((s): ApiSessionSet => ({
      set_number: s.setNumber,
      target_reps: s.targetReps,
      target_weight: s.targetWeight,
      actual_reps: s.actualReps,
      actual_weight: s.actualWeight,
      status: mapSetStatus(s.status),
    })),
  }))

  const allFinished = exercises.every(
    (e) => e.status === 'completed' || e.status === 'skipped'
  )

  return {
    workout_id: session.plan.id,
    status: allFinished ? 'completed' : 'partial',
    started_at: new Date(session.startedAt).toISOString(),
    completed_at: new Date().toISOString(),
    exercises,
  }
}

export const useFinishWorkout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (session: WorkoutSession) =>
      apiPost<ApiSessionResponse>('/api/sessions', buildSessionPayload(session)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.current })
    },
  })
}
