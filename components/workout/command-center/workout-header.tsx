import { CreatorAttribution } from '@/components/workout/creator-attribution'
import { SegmentedProgressBar } from '@/components/workout/segmented-progress-bar'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { Colors } from '@/constants/colors'
import { X } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

interface WorkoutHeaderProps {
  onClose: () => void
}

export const WorkoutHeader = ({ onClose }: WorkoutHeaderProps) => {
  const { session } = useActiveWorkout()

  if (session === null) return null

  return (
    <View className="px-5 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-inter-bold text-content-primary">{session.plan.title}</Text>
        <Pressable onPress={onClose} className="p-2">
          <X size={20} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      </View>

      <CreatorAttribution platform={session.plan.platform} handle={session.plan.creatorHandle} />

      <View className="mt-3">
        <SegmentedProgressBar segments={session.plan.exercises.map((e) => ({ status: e.status }))} />
      </View>
    </View>
  )
}
