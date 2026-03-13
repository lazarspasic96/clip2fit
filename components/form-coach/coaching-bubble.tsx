import { Text, View } from 'react-native'
import Animated, { FadeOut, SlideInUp } from 'react-native-reanimated'

type CoachingBubbleProps = {
  message: string | null
}

export const CoachingBubble = ({ message }: CoachingBubbleProps) => {
  if (message === null) return null

  return (
    <Animated.View
      entering={SlideInUp.duration(200).springify()}
      exiting={FadeOut.duration(150)}
      className="absolute bottom-48 left-4 right-4 items-center"
      pointerEvents="none"
    >
      <View className="bg-zinc-900/95 rounded-2xl px-5 py-3 border border-lime-500/30 max-w-sm">
        <Text className="text-white text-sm font-inter-medium text-center leading-5">
          {message}
        </Text>
      </View>
    </Animated.View>
  )
}
