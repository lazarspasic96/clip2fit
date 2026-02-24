import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

import { BaselinePulseDashboard } from '@/components/workout/designs/design-a-baseline/baseline-pulse-dashboard'
import { PrCelebration } from '@/components/workout/pr-celebration'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useFinishWorkout } from '@/hooks/use-finish-workout'
import type { ApiPR } from '@/types/api'

interface ActiveWorkoutShellProps {
  onBack: () => void
}

export const ActiveWorkoutShell = ({ onBack }: ActiveWorkoutShellProps) => {
  const router = useRouter()
  const { session, finishSession, finishResult, clearFinishResult } = useActiveWorkout()
  const [prs, setPrs] = useState<ApiPR[]>([])
  const [showPrCelebration, setShowPrCelebration] = useState(false)
  const finishMutation = useFinishWorkout()

  const isEditMode = session?.status === 'completed'

  // Consume finishResult written by the finish-workout sheet route
  useEffect(() => {
    if (finishResult === null || session === null) return
    clearFinishResult()

    if (finishResult.prs.length > 0) {
      const enrichedPrs = finishResult.prs.map((pr) => ({
        ...pr,
        exercise_name:
          pr.exercise_name ||
          session.plan.exercises.find((ex) => ex.id === pr.exercise_id)?.name ||
          'Unknown Exercise',
      }))
      setPrs(enrichedPrs)
      setShowPrCelebration(true)
    } else {
      finishSession()
      onBack()
    }
  }, [finishResult, session, clearFinishResult, finishSession, onBack])

  const handleFinish = () => {
    router.push('/(protected)/sheets/finish-workout')
  }

  const handleSave = () => {
    if (session === null) return
    finishMutation.mutate(session, {
      onSuccess: () => onBack(),
    })
  }

  const handlePrDismiss = () => {
    setShowPrCelebration(false)
    finishSession()
    onBack()
  }

  if (session === null) return null

  return (
    <View className="flex-1">
      <BaselinePulseDashboard
        onBack={onBack}
        onFinish={isEditMode ? handleSave : handleFinish}
        isEditMode={isEditMode}
      />

      {showPrCelebration && <PrCelebration prs={prs} onDismiss={handlePrDismiss} />}
    </View>
  )
}
