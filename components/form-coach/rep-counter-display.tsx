import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type RepCounterDisplayProps = {
  count: number
}

export const RepCounterDisplay = ({ count }: RepCounterDisplayProps) => {
  const insets = useSafeAreaInsets()
  const scale = useSharedValue(1)

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 300 }),
        withTiming(1, { duration: 200 }),
      )
    }
  }, [count, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      style={[{ position: 'absolute', top: insets.top + 16, alignSelf: 'center' }, animatedStyle]}
    >
      <View className="w-16 h-16 rounded-full bg-black/60 items-center justify-center border-2 border-lime-400">
        <Text className="text-white text-2xl font-inter-bold">{count}</Text>
      </View>
    </Animated.View>
  )
}
