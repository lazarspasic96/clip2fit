import { ExerciseAccordion } from '@/components/workout/command-center/exercise-accordion'
import { WorkoutHeader } from '@/components/workout/command-center/workout-header'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

interface CommandCenterWorkoutProps {
  onClose: () => void
}

export const CommandCenterWorkout = ({ onClose }: CommandCenterWorkoutProps) => {
  const { session, isWorkoutComplete, finishWorkout } = useActiveWorkout()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const scrollRef = useRef<ScrollView>(null)

  // Auto-expand active exercise
  useEffect(() => {
    if (session === null) return
    const active = session.plan.exercises[session.activeExerciseIndex]
    if (active !== undefined) {
      setExpandedId(active.id)
    }
  }, [session])

  if (session === null) return null

  const handleFinish = () => {
    finishWorkout()
  }

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <View className="flex-1">
      <WorkoutHeader onClose={onClose} />

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

      {/* Sticky footer */}
      <View className="px-5 pt-4 border-t border-border-primary">
        <Pressable
          onPress={handleFinish}
          className={`rounded-md py-3 items-center ${isWorkoutComplete ? 'bg-brand-accent' : 'bg-brand-accent/60'}`}
        >
          <Text className="text-base font-inter-semibold text-background-primary">
            Finish Workout
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
