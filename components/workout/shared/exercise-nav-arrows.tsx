import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'

export const ExerciseNavArrows = () => {
  const { session, navigateExercise } = useActiveWorkout()

  if (session === null) return null

  const index = session.activeExerciseIndex
  const total = session.plan.exercises.length
  const canGoBack = index > 0
  const canGoForward = index < total - 1

  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        onPress={() => navigateExercise(index - 1)}
        disabled={!canGoBack}
        hitSlop={8}
        style={{ opacity: canGoBack ? 1 : 0.3 }}
      >
        <ChevronLeft size={24} color={Colors.content.primary} pointerEvents="none" />
      </Pressable>
      <Pressable
        onPress={() => navigateExercise(index + 1)}
        disabled={!canGoForward}
        hitSlop={8}
        style={{ opacity: canGoForward ? 1 : 0.3 }}
      >
        <ChevronRight size={24} color={Colors.content.primary} pointerEvents="none" />
      </Pressable>
    </View>
  )
}
