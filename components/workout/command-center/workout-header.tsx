import { ChevronLeft } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { SegmentedProgressBar } from '@/components/workout/segmented-progress-bar'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface WorkoutHeaderProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const WorkoutHeader = ({ onBack, onFinish, isEditMode }: WorkoutHeaderProps) => {
  const { session, navigateExercise } = useActiveWorkout()

  if (session === null) return null

  return (
    <View className="px-5 mb-3">
      <View className="flex-row items-center mb-2">
        <Pressable onPress={onBack} hitSlop={12} className="p-1 mr-2">
          <ChevronLeft size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
        <Text className="flex-1 text-xl font-inter-bold text-content-primary" numberOfLines={1}>
          {session.plan.title}
        </Text>

        <Pressable onPress={onFinish} className="rounded-full px-4 py-1.5 bg-brand-accent">
          <Text className="text-sm font-inter-bold text-background-primary">
            {isEditMode === true ? 'Save' : 'Finish'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-1">
        <SegmentedProgressBar
          activeIndex={session.activeExerciseIndex}
          total={session.plan.exercises.length}
          onPress={navigateExercise}
        />
      </View>
    </View>
  )
}
