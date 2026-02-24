import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'

import { ExerciseAccordion } from '@/components/workout/command-center/exercise-accordion'
import { WorkoutHeader } from '@/components/workout/command-center/workout-header'
import { PrCelebration } from '@/components/workout/pr-celebration'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import type { ApiPR } from '@/types/api'

interface CommandCenterWorkoutProps {
  onBack: () => void
}

export const CommandCenterWorkout = ({ onBack }: CommandCenterWorkoutProps) => {
  const router = useRouter()
  const { session, clearSession, finishResult, clearFinishResult } = useActiveWorkout()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [prs, setPrs] = useState<ApiPR[]>([])
  const [showPrCelebration, setShowPrCelebration] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (session === null) return
    const active = session.plan.exercises[session.activeExerciseIndex]
    if (active !== undefined) {
      setExpandedId(active.id)
    }
  }, [session])

  // Consume finishResult written by the finish-workout sheet route
  useEffect(() => {
    if (finishResult === null) return
    clearFinishResult()

    if (finishResult.prs.length > 0) {
      setPrs(finishResult.prs)
      setShowPrCelebration(true)
    } else {
      clearSession()
      onBack()
    }
  }, [finishResult, clearFinishResult, clearSession, onBack])

  if (session === null) return null

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handlePrDismiss = () => {
    setShowPrCelebration(false)
    clearSession()
    onBack()
  }

  return (
    <View className="flex-1">
      <WorkoutHeader onBack={onBack} onFinish={() => router.push('/(protected)/sheets/finish-workout')} />

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

      {showPrCelebration && <PrCelebration prs={prs} onDismiss={handlePrDismiss} />}
    </View>
  )
}
