import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { PulseDashboard } from '@/components/workout/designs/design-b-pulse/pulse-dashboard'
import { ExerciseLearningPill } from '@/components/workout/shared/exercise-learning-pill'
import { useWorkoutExerciseInsights } from '@/components/workout/shared/use-workout-exercise-insights'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface BaselinePulseDashboardProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const BaselinePulseDashboard = ({ onBack, onFinish, isEditMode }: BaselinePulseDashboardProps) => {
  const router = useRouter()
  const { currentExercise } = useActiveWorkout()
  const { catalogExercise, videoUrl } = useWorkoutExerciseInsights()

  if (currentExercise === null) return null

  const handleLearningPress = () => {
    router.push({
      pathname: '/(protected)/sheets/exercise-learning',
      params: {
        catalogExerciseId: catalogExercise?.id ?? '',
        title: currentExercise.name,
        ...(videoUrl !== null ? { videoUrl } : {}),
        showPrimaryMuscles: 'true',
      },
    })
  }

  const pill = (
    <ExerciseLearningPill
      title={currentExercise.name}
      startImageUrl={catalogExercise?.images?.start ?? null}
      endImageUrl={catalogExercise?.images?.end ?? null}
      onPress={handleLearningPress}
    />
  )

  return (
    <View className="flex-1">
      <PulseDashboard onBack={onBack} onFinish={onFinish} isEditMode={isEditMode} learningPill={pill} />
    </View>
  )
}
