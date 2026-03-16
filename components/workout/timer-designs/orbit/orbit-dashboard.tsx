import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { PulseDashboard } from '@/components/workout/designs/design-b-pulse/pulse-dashboard'
import { ExerciseLearningPill } from '@/components/workout/shared/exercise-learning-pill'
import { useActiveSet } from '@/components/workout/shared/use-active-set'
import { useElapsedTimer } from '@/components/workout/shared/use-elapsed-timer'
import { useWorkoutExerciseInsights } from '@/components/workout/shared/use-workout-exercise-insights'
import { OrbitRing } from '@/components/workout/timer-designs/orbit/orbit-ring'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface OrbitDashboardProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const OrbitDashboard = ({ onBack, onFinish, isEditMode }: OrbitDashboardProps) => {
  const router = useRouter()
  const { session, currentExercise, isPaused, pauseWorkout, resumeWorkout } = useActiveWorkout()
  const { formatted, flashTrigger } = useElapsedTimer()
  const { activeSetIndex, totalCount } = useActiveSet()
  const { catalogExercise, videoUrl } = useWorkoutExerciseInsights()

  if (session === null || currentExercise === null) return null

  const exercises = session.plan.exercises
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.status === 'completed').length,
    0
  )
  const progressPct = totalSets > 0 ? completedSets / totalSets : 0
  const pct = Math.round(progressPct * 100)
  const setLabel = `SET ${activeSetIndex + 1}/${totalCount}`
  const isCompleted = isEditMode === true

  const handleTogglePause = () => {
    if (isPaused) {
      resumeWorkout()
    } else {
      pauseWorkout()
    }
  }

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

  const ring = (
    <OrbitRing
      progress={progressPct}
      pct={pct}
      setLabel={setLabel}
      formatted={formatted}
      isPaused={isPaused}
      isCompleted={isCompleted}
      onTogglePause={handleTogglePause}
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
        ringSlot={ring}
      />
    </View>
  )
}
