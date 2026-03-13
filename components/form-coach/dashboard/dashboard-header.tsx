import { ChevronDown } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

type DashboardHeaderProps = {
  exerciseName: string | null
  coachingMessage: string | null
  isResting: boolean
  onExercisePress: () => void
}

export const DashboardHeader = ({
  exerciseName,
  coachingMessage,
  isResting,
  onExercisePress,
}: DashboardHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between px-3 py-2">
      {exerciseName !== null && (
        <Pressable
          onPress={onExercisePress}
          className="flex-row items-center bg-zinc-800 rounded-full px-3 py-1.5 gap-1"
        >
          <Text className="text-white text-sm font-inter-bold">{exerciseName}</Text>
          <ChevronDown size={14} color="#a1a1aa" pointerEvents="none" />
        </Pressable>
      )}

      <View className="flex-1 ml-3 items-end">
        {isResting ? (
          <Text className="text-zinc-400 text-xs font-inter-medium">
            Resting — start moving to resume
          </Text>
        ) : coachingMessage !== null ? (
          <Animated.Text
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="text-zinc-300 text-xs font-inter-medium"
            numberOfLines={1}
          >
            {coachingMessage}
          </Animated.Text>
        ) : null}
      </View>
    </View>
  )
}
