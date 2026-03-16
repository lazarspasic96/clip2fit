import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { PulseDashboard } from '@/components/workout/designs/design-b-pulse/pulse-dashboard'
import { ExerciseLearningPill } from '@/components/workout/shared/exercise-learning-pill'
import { useElapsedTimer } from '@/components/workout/shared/use-elapsed-timer'
import { useWorkoutExerciseInsights } from '@/components/workout/shared/use-workout-exercise-insights'
import { TimerFloatPill } from '@/components/workout/timer-designs/float-pill/timer-float-pill'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface FloatPillDashboardProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const FloatPillDashboard = ({ onBack, onFinish, isEditMode }: FloatPillDashboardProps) => {
  const router = useRouter()
  const { session, currentExercise, isPaused, pauseWorkout, resumeWorkout } = useActiveWorkout()
  const { formatted, elapsedSeconds, flashTrigger } = useElapsedTimer()
  const { catalogExercise, videoUrl } = useWorkoutExerciseInsights()

  if (session === null || currentExercise === null) return null

  const exercises = session.plan.exercises
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.status === 'completed').length,
    0
  )
  const remainingSets = totalSets - completedSets

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

  const overlay = (
    <TimerFloatPill
      formatted={formatted}
      elapsedSeconds={elapsedSeconds}
      isPaused={isPaused}
      isCompleted={isEditMode === true}
      completedSets={completedSets}
      totalSets={totalSets}
      remainingSets={remainingSets}
      onPause={pauseWorkout}
      onResume={resumeWorkout}
      flashTrigger={flashTrigger}
    />
  )

  return (
    <View className="flex-1">
      <PulseDashboard
        onBack={onBack}
        onFinish={onFinish}
        isEditMode={isEditMode}
        learningPill={pill}
        bottomOverlay={overlay}
      />
    </View>
  )
}
