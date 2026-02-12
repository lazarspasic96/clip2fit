import { AccordionHeader } from '@/components/workout/command-center/accordion-header'
import { SetTable } from '@/components/workout/command-center/set-table'
import { ExerciseNotes } from '@/components/workout/exercise-notes'
import { SourceVideoButton } from '@/components/workout/source-video-button'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import type { WorkoutExercise } from '@/types/workout'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

interface ExerciseAccordionProps {
  exercise: WorkoutExercise
  isExpanded: boolean
  onToggle: () => void
}

export const ExerciseAccordion = ({ exercise, isExpanded, onToggle }: ExerciseAccordionProps) => {
  const { skipExercise } = useActiveWorkout()

  const handleSkip = () => {
    skipExercise(exercise.id)
  }

  return (
    <View className="border-b border-border-primary">
      <AccordionHeader exercise={exercise} isExpanded={isExpanded} onToggle={onToggle} />

      {isExpanded && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          {/* Muscle pills */}
          <View className="flex-row gap-1.5 px-4 mb-2">
            {exercise.muscleGroups.map((mg) => (
              <View key={mg} className="bg-background-tertiary rounded-full px-2 py-0.5">
                <Text className="text-xs font-inter text-content-secondary">{mg}</Text>
              </View>
            ))}
          </View>

          <SetTable exercise={exercise} />

          <View className="px-4 pb-3">
            <ExerciseNotes notes={exercise.notes} />
            <SourceVideoButton url={exercise.sourceVideoUrl} />

            {exercise.status !== 'completed' && exercise.status !== 'skipped' && (
              <Pressable onPress={handleSkip} className="mt-3">
                <Text className="text-xs font-inter text-content-tertiary">Skip Exercise</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  )
}
