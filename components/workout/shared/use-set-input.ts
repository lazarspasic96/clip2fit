import * as Haptics from 'expo-haptics'
import { useState, useEffect } from 'react'

import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useActiveSet } from '@/components/workout/shared/use-active-set'

const WEIGHT_STEP = 2.5
const REPS_STEP = 1

export const useSetInput = () => {
  const { currentExercise, completeSet } = useActiveWorkout()
  const { activeSet } = useActiveSet()

  const initialWeight = activeSet?.previousWeight ?? activeSet?.targetWeight ?? 0
  const initialReps = activeSet?.previousReps ?? parseTargetReps(activeSet?.targetReps) ?? 10

  const [weight, setWeight] = useState(initialWeight)
  const [reps, setReps] = useState(initialReps)

  // Reset inputs when active set changes
  const activeSetId = activeSet?.id
  const prevWeight = activeSet?.previousWeight
  const targetWeight = activeSet?.targetWeight
  const prevReps = activeSet?.previousReps
  const targetReps = activeSet?.targetReps

  useEffect(() => {
    setWeight(prevWeight ?? targetWeight ?? 0)
    setReps(prevReps ?? parseTargetReps(targetReps) ?? 10)
  }, [activeSetId, prevWeight, targetWeight, prevReps, targetReps])

  const incrementWeight = () => setWeight((w) => w + WEIGHT_STEP)
  const decrementWeight = () => setWeight((w) => Math.max(0, w - WEIGHT_STEP))
  const incrementReps = () => setReps((r) => r + REPS_STEP)
  const decrementReps = () => setReps((r) => Math.max(1, r - REPS_STEP))

  const submitSet = () => {
    if (currentExercise === null || activeSet === null) return

    const isBodyweight = currentExercise.isBodyweight
    completeSet(currentExercise.id, activeSet.id, reps, isBodyweight ? null : weight)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return {
    weight,
    reps,
    setWeight,
    setReps,
    incrementWeight,
    decrementWeight,
    incrementReps,
    decrementReps,
    submitSet,
    isBodyweight: currentExercise?.isBodyweight ?? false,
    canSubmit: activeSet !== null,
  }
}

const parseTargetReps = (target: string | null | undefined): number | null => {
  if (target === null || target === undefined) return null
  const parsed = parseInt(target, 10)
  return isNaN(parsed) ? null : parsed
}
