import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import { Colors } from '@/constants/colors'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 140
const STROKE_WIDTH = 10
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const INNER_RADIUS = RADIUS - 12

const LIME = Colors.brand.accent
const REST_BLUE = Colors.status.rest
const REST_BLUE_60 = 'rgba(2,132,199,0.6)'

interface OrbitRingProps {
  progress: number
  pct: number
  setLabel: string
  formatted: string
  isPaused: boolean
  isCompleted: boolean
  onTogglePause: () => void
  flashTrigger: SharedValue<number>
}

export const OrbitRing = ({
  progress,
  pct,
  setLabel,
  formatted,
  isPaused,
  isCompleted,
  onTogglePause,
  flashTrigger,
}: OrbitRingProps) => {
  const glowScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.6)
  const tapScale = useSharedValue(1)

  // Pause state drives color and orbit visibility
  const pauseTransition = useSharedValue(isPaused ? 1 : 0)
  const orbitOpacity = useSharedValue(isPaused ? 1 : 0)
  const orbitRotation = useSharedValue(0)

  useEffect(() => {
    pauseTransition.value = withTiming(isPaused ? 1 : 0, { duration: 400 })
    orbitOpacity.value = withTiming(isPaused ? 1 : 0, { duration: 400 })
  }, [isPaused, pauseTransition, orbitOpacity])

  // Continuous orbit rotation
  useEffect(() => {
    orbitRotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1
    )
  }, [orbitRotation])

  // Pulse glow on progress change
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

  // Outer ring stroke color interpolation (lime -> rest-blue)
  const outerStrokeColor = useDerivedValue(() =>
    interpolateColor(pauseTransition.value, [0, 1], [LIME, REST_BLUE])
  )

  // Glow shadow color interpolation
  const glowColor = useDerivedValue(() =>
    interpolateColor(pauseTransition.value, [0, 1], [LIME, REST_BLUE])
  )

  const outerRingProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(CIRCUMFERENCE * (1 - progress), { duration: 400 }),
    stroke: outerStrokeColor.value,
  }))

  // Inner orbit ring animated props
  const innerOrbitProps = useAnimatedProps(() => ({
    opacity: orbitOpacity.value,
  }))

  const innerOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
    shadowColor: glowColor.value,
  }))

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }))

  // Timer text color: base color from pause state + flash overlay
  const timerTextStyle = useAnimatedStyle(() => {
    const baseColor = interpolateColor(
      pauseTransition.value,
      [0, 1],
      [Colors.content.primary, REST_BLUE]
    )
    return {
      color: interpolateColor(flashTrigger.value, [0, 1], [baseColor, LIME]),
    }
  })

  // Pct text color driven by pause transition
  const pctTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      pauseTransition.value,
      [0, 1],
      [Colors.content.tertiary, REST_BLUE_60]
    ),
  }))

  const handlePress = () => {
    if (isCompleted) return

    tapScale.value = withSequence(
      withSpring(0.92, { damping: 10 }),
      withSpring(1.0, { damping: 8 })
    )

    if (isPaused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    onTogglePause()
  }

  return (
    <Animated.View style={containerStyle}>
      <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        {/* Glow shadow */}
        <Animated.View
          style={[
            {
              width: SIZE,
              height: SIZE,
              position: 'absolute',
              borderRadius: SIZE / 2,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
            },
            glowStyle,
          ]}
        />

        <Svg width={SIZE} height={SIZE}>
          {/* Background track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.background.tertiary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Progress ring */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={outerRingProps}
            strokeLinecap="round"
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />

          {/* Inner orbit ring (visible when paused) */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={INNER_RADIUS}
            stroke={REST_BLUE}
            strokeWidth={3}
            strokeDasharray="4 8"
            fill="none"
            animatedProps={innerOrbitProps}
          />
        </Svg>

        {/* Rotation overlay for inner orbit — Animated.View for reliable rotation */}
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', width: SIZE, height: SIZE },
            innerOrbitStyle,
          ]}
        />

        {/* Center content with tap interaction */}
        <Pressable
          onPress={handlePress}
          disabled={isCompleted}
          className="absolute items-center justify-center"
          style={{ width: SIZE * 0.7, height: SIZE * 0.7, borderRadius: SIZE * 0.35 }}
        >
          <Animated.Text
            style={[
              {
                fontSize: 20,
                fontFamily: 'Inter-Bold',
                textAlign: 'center',
              },
              timerTextStyle,
            ]}
          >
            {formatted}
          </Animated.Text>
          <Animated.Text
            style={[
              {
                fontSize: 10,
                fontFamily: 'Inter-SemiBold',
                textAlign: 'center',
              },
              pctTextStyle,
            ]}
          >
            {pct}%
          </Animated.Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}
