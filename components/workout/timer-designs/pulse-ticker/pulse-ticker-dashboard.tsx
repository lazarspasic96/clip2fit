import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { PulseDashboard } from '@/components/workout/designs/design-b-pulse/pulse-dashboard'
import { ExerciseLearningPill } from '@/components/workout/shared/exercise-learning-pill'
import { useElapsedTimer } from '@/components/workout/shared/use-elapsed-timer'
import { useWorkoutExerciseInsights } from '@/components/workout/shared/use-workout-exercise-insights'
import { PulseTickerHeader } from '@/components/workout/timer-designs/pulse-ticker/pulse-ticker-header'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface PulseTickerDashboardProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const PulseTickerDashboard = ({ onBack, onFinish, isEditMode }: PulseTickerDashboardProps) => {
  const router = useRouter()
  const { session, currentExercise, isPaused, pauseWorkout, resumeWorkout } = useActiveWorkout()
  const { formatted, flashTrigger } = useElapsedTimer()
  const { catalogExercise, videoUrl } = useWorkoutExerciseInsights()

  if (session === null || currentExercise === null) return null

  const isCompleted = session.status === 'completed'

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
      gifUrl={catalogExercise?.gifUrl ?? null}
      onPress={handleLearningPress}
    />
  )

  const header = (
    <PulseTickerHeader
      onBack={onBack}
      onFinish={onFinish}
      isEditMode={isEditMode}
      title={session.plan.title}
      isPaused={isPaused}
      formatted={formatted}
      onPause={pauseWorkout}
      onResume={resumeWorkout}
      flashTrigger={flashTrigger}
      isCompleted={isCompleted}
    />
  )

  return (
    <View className="flex-1">
      <PulseDashboard
        onBack={onBack}
        onFinish={onFinish}
        isEditMode={isEditMode}
        learningPill={pill}
        headerSlot={header}
      />
    </View>
  )
}
