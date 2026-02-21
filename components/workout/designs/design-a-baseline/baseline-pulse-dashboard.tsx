import { useState } from 'react'
import { View } from 'react-native'

import { PulseDashboard } from '@/components/workout/designs/design-b-pulse/pulse-dashboard'
import { ExerciseLearningPill } from '@/components/workout/shared/exercise-learning-pill'
import { ExerciseLearningSheet } from '@/components/workout/shared/exercise-learning-sheet'
import { useWorkoutExerciseInsights } from '@/components/workout/shared/use-workout-exercise-insights'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface BaselinePulseDashboardProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const BaselinePulseDashboard = ({ onBack, onFinish, isEditMode }: BaselinePulseDashboardProps) => {
  const { currentExercise } = useActiveWorkout()
  const { catalogExercise, videoUrl } = useWorkoutExerciseInsights()
  const [showLearningSheet, setShowLearningSheet] = useState(false)

  if (currentExercise === null) return null

  const pill = (
    <ExerciseLearningPill
      title={currentExercise.name}
      startImageUrl={catalogExercise?.images?.start ?? null}
      endImageUrl={catalogExercise?.images?.end ?? null}
      onPress={() => setShowLearningSheet(true)}
    />
  )

  return (
    <View className="flex-1">
      <PulseDashboard onBack={onBack} onFinish={onFinish} isEditMode={isEditMode} learningPill={pill} />

      <ExerciseLearningSheet
        visible={showLearningSheet}
        title={currentExercise.name}
        exercise={catalogExercise}
        videoUrl={videoUrl}
        onDismiss={() => setShowLearningSheet(false)}
      />
    </View>
  )
}
