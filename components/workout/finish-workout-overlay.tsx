import { useActiveWorkout } from '@/contexts/active-workout-context'
import { Pressable, Text, View } from 'react-native'

interface FinishWorkoutOverlayProps {
  onDone: () => void
}

export const FinishWorkoutOverlay = ({ onDone }: FinishWorkoutOverlayProps) => {
  const { session, progress } = useActiveWorkout()

  if (session === null || session.status !== 'completed') return null

  const durationMs = (session.completedAt ?? Date.now()) - session.startedAt
  const durationMin = Math.round(durationMs / 60000)
  const exercisesCompleted = session.plan.exercises.filter((e) => e.status === 'completed').length

  return (
    <View className="absolute inset-0 bg-background-primary/95 items-center justify-center z-50">
      <Text className="text-3xl font-inter-bold text-content-primary">Workout Complete</Text>

      <View className="flex-row gap-8 mt-8">
        <View className="items-center">
          <Text className="text-4xl font-inter-bold text-brand-accent">{durationMin}</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1">minutes</Text>
        </View>
        <View className="items-center">
          <Text className="text-4xl font-inter-bold text-brand-accent">
            {exercisesCompleted}/{progress.total}
          </Text>
          <Text className="text-sm font-inter text-content-secondary mt-1">exercises</Text>
        </View>
      </View>

      <Pressable onPress={onDone} className="bg-brand-accent rounded-md px-8 py-3 mt-10">
        <Text className="text-base font-inter-semibold text-background-primary">Done</Text>
      </Pressable>
    </View>
  )
}
