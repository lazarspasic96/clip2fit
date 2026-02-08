import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

interface ProgressBarProps {
  step: number
  total: number
}

export const ProgressBar = ({ step, total }: ProgressBarProps) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(step / total, { duration: 300 })
  }, [step, total, progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  return (
    <View className="h-1.5 bg-background-secondary rounded-full overflow-hidden mx-6">
      <Animated.View className="h-full bg-brand-accent rounded-full" style={animatedStyle} />
    </View>
  )
}
