import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useSmartTargetsHistory } from '@/hooks/use-smart-targets-history'
import { computeTarget, isEligible, type TargetResult } from '@/utils/progression'

interface SmartTargetForExercise {
  target: TargetResult | null
  isLoading: boolean
}

export const useSmartTarget = (): SmartTargetForExercise => {
  const { session, currentExercise } = useActiveWorkout()

  const catalogExerciseIds = (session?.plan.exercises ?? [])
    .map((ex) => ex.catalogExerciseId)
    .filter((id): id is string => id !== null && id.length > 0)

  const { history, isLoading } = useSmartTargetsHistory(catalogExerciseIds)

  if (currentExercise === null) return { target: null, isLoading }

  const catalogId = currentExercise.catalogExerciseId
  if (catalogId === null) return { target: null, isLoading }

  const exerciseHistory = history[catalogId]
  if (exerciseHistory === undefined) return { target: null, isLoading }

  const eligible = isEligible(
    {
      catalogExerciseId: catalogId,
      isBodyweight: currentExercise.isBodyweight,
      targetReps: currentExercise.sets[0]?.targetReps ?? null,
    },
    exerciseHistory.sessionCount,
  )

  if (!eligible) return { target: null, isLoading: false }

  const target = computeTarget({
    previousSets: exerciseHistory.lastSession.sets.map((s) => ({
      actualWeight: s.actualWeight,
      actualReps: s.actualReps,
    })),
    targetReps: currentExercise.sets[0]?.targetReps ?? null,
    muscleGroups: currentExercise.muscleGroups,
  })

  return { target, isLoading: false }
}
