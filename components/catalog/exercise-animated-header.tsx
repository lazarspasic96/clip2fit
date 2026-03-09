import { BlurView } from 'expo-blur'
import { Text } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HERO_HEIGHT } from './exercise-hero-image'

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const FADE_START = HERO_HEIGHT - 80
const FADE_END = HERO_HEIGHT

interface ExerciseAnimatedHeaderProps {
  title: string
  scrollY: SharedValue<number>
}

export const ExerciseAnimatedHeader = ({ title, scrollY }: ExerciseAnimatedHeaderProps) => {
  const insets = useSafeAreaInsets()

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [FADE_START, FADE_END], [0, 1], Extrapolation.CLAMP),
  }))

  return (
    <AnimatedBlurView
      intensity={80}
      tint="dark"
      className="absolute top-0 left-0 right-0 z-10 border-b border-border-primary"
      style={[
        { paddingTop: insets.top },
        animatedStyle,
      ]}
    >
      <Text
        className="text-base font-onest text-content-primary text-center py-3 px-16"
        numberOfLines={1}
      >
        {title}
      </Text>
    </AnimatedBlurView>
  )
}
