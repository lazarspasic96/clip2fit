import { useState } from 'react'
import { View } from 'react-native'

import { BaselinePulseDashboard } from '@/components/workout/designs/design-a-baseline/baseline-pulse-dashboard'
import { FinishWorkoutSheet } from '@/components/workout/finish-workout-sheet'
import { PrCelebration } from '@/components/workout/pr-celebration'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useFinishWorkout } from '@/hooks/use-finish-workout'
import type { ApiPR } from '@/types/api'

interface ActiveWorkoutShellProps {
  onBack: () => void
}

export const ActiveWorkoutShell = ({ onBack }: ActiveWorkoutShellProps) => {
  const { session, finishSession } = useActiveWorkout()
  const [showFinishSheet, setShowFinishSheet] = useState(false)
  const [prs, setPrs] = useState<ApiPR[]>([])
  const [showPrCelebration, setShowPrCelebration] = useState(false)
  const finishMutation = useFinishWorkout()

  const isEditMode = session?.status === 'completed'

  const handleFinish = () => setShowFinishSheet(true)

  const handleSave = () => {
    if (session === null) return
    finishMutation.mutate(session, {
      onSuccess: () => onBack(),
    })
  }

  const handleFinishConfirm = () => {
    if (session === null) return
    finishMutation.mutate(session, {
      onSuccess: (data) => {
        setShowFinishSheet(false)
        if (data.prs.length > 0) {
          const enrichedPrs = data.prs.map((pr) => ({
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
      },
    })
  }

  const handlePrDismiss = () => {
    setShowPrCelebration(false)
    finishSession()
    onBack()
  }

  if (session === null) return null

  const finishError = finishMutation.error instanceof Error ? finishMutation.error.message : null

  return (
    <View className="flex-1">
      <BaselinePulseDashboard
        onBack={onBack}
        onFinish={isEditMode ? handleSave : handleFinish}
        isEditMode={isEditMode}
      />

      {!isEditMode && (
        <FinishWorkoutSheet
          visible={showFinishSheet}
          session={session}
          onDismiss={() => setShowFinishSheet(false)}
          onConfirm={handleFinishConfirm}
          loading={finishMutation.isPending}
          error={finishError}
        />
      )}

      {showPrCelebration && <PrCelebration prs={prs} onDismiss={handlePrDismiss} />}
    </View>
  )
}
