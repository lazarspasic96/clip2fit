import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 140
const STROKE_WIDTH = 10
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface PulseRingProps {
  progress: number
  pct: number
  setLabel: string
}

export const PulseRing = ({ progress, pct, setLabel }: PulseRingProps) => {
  const glowScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.6)

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(CIRCUMFERENCE * (1 - progress), { duration: 400 }),
  }))

  // Pulse on progress change
  useEffect(() => {
    if (progress <= 0) return
    glowScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    )
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0.6, { duration: 400 })
    )
  }, [progress, glowScale, glowOpacity])

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))

  return (
    <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            position: 'absolute',
            borderRadius: SIZE / 2,
            shadowColor: Colors.brand.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
          },
          glowStyle,
        ]}
      />
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.background.tertiary}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.brand.accent}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-2xl font-inter-bold text-brand-accent">{pct}%</Text>
        <Text className="text-xs font-inter-semibold text-content-tertiary">{setLabel}</Text>
      </View>
    </View>
  )
}
