import { ExerciseAccordion } from '@/components/workout/command-center/exercise-accordion'
import { WorkoutHeader } from '@/components/workout/command-center/workout-header'
import { FinishWorkoutSheet } from '@/components/workout/finish-workout-sheet'
import { PrCelebration } from '@/components/workout/pr-celebration'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useFinishWorkout } from '@/hooks/use-finish-workout'
import type { ApiPR } from '@/types/api'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'

interface CommandCenterWorkoutProps {
  onBack: () => void
}

export const CommandCenterWorkout = ({ onBack }: CommandCenterWorkoutProps) => {
  const { session, clearSession } = useActiveWorkout()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFinishSheet, setShowFinishSheet] = useState(false)
  const [prs, setPrs] = useState<ApiPR[]>([])
  const [showPrCelebration, setShowPrCelebration] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const finishMutation = useFinishWorkout()

  useEffect(() => {
    if (session === null) return
    const active = session.plan.exercises[session.activeExerciseIndex]
    if (active !== undefined) {
      setExpandedId(active.id)
    }
  }, [session])

  if (session === null) return null

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleFinishConfirm = () => {
    finishMutation.mutate(session, {
      onSuccess: (data) => {
        setShowFinishSheet(false)

        if (data.prs.length > 0) {
          setPrs(data.prs)
          setShowPrCelebration(true)
        } else {
          clearSession()
          onBack()
        }
      },
    })
  }

  const handlePrDismiss = () => {
    setShowPrCelebration(false)
    clearSession()
    onBack()
  }

  const finishError = finishMutation.error instanceof Error ? finishMutation.error.message : null

  return (
    <View className="flex-1">
      <WorkoutHeader onBack={onBack} onFinish={() => setShowFinishSheet(true)} />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {session.plan.exercises.map((exercise) => (
          <ExerciseAccordion
            key={exercise.id}
            exercise={exercise}
            isExpanded={expandedId === exercise.id}
            onToggle={() => toggleAccordion(exercise.id)}
          />
        ))}
      </ScrollView>

      <FinishWorkoutSheet
        visible={showFinishSheet}
        session={session}
        onDismiss={() => setShowFinishSheet(false)}
        onConfirm={handleFinishConfirm}
        loading={finishMutation.isPending}
        error={finishError}
      />

      {showPrCelebration && <PrCelebration prs={prs} onDismiss={handlePrDismiss} />}
    </View>
  )
}
