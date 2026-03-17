import { MUSCLE_GROUP_TO_CATEGORY, type MuscleCategory, type MuscleGroupKey } from '@/constants/muscle-colors'
import type { WorkoutSession } from '@/types/workout'

export interface WorkoutSummary {
  totalVolume: number
  durationMinutes: number
  exercisesCompleted: number
  setsCompleted: number
  muscleCategoryDistribution: { category: MuscleCategory; value: number }[]
}

const CATEGORY_ORDER: MuscleCategory[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core']

export const buildWorkoutSummary = (session: WorkoutSession): WorkoutSummary => {
  let totalVolume = 0
  let setsCompleted = 0
  let exercisesCompleted = 0
  const categoryCounts = new Map<MuscleCategory, number>()

  for (const exercise of session.plan.exercises) {
    const isCompleted = exercise.status === 'completed'
    if (isCompleted) exercisesCompleted++

    for (const set of exercise.sets) {
      if (set.status !== 'completed') continue
      setsCompleted++
      const weight = set.actualWeight ?? 0
      const reps = set.actualReps ?? 0
      totalVolume += weight * reps
    }

    for (const mg of exercise.muscleGroups) {
      const category = MUSCLE_GROUP_TO_CATEGORY[mg as MuscleGroupKey] ?? null
      if (category === null) continue
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    }
  }

  const maxCount = Math.max(...categoryCounts.values(), 1)
  const muscleCategoryDistribution = CATEGORY_ORDER.map((category) => ({
    category,
    value: (categoryCounts.get(category) ?? 0) / maxCount,
  }))

  const durationMinutes = session.completedAt !== undefined
    ? Math.round((session.completedAt - session.startedAt) / 60_000)
    : 0

  return { totalVolume, durationMinutes, exercisesCompleted, setsCompleted, muscleCategoryDistribution }
}
