import { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import { Colors } from '@/constants/colors'
import { PlatformBadge } from '@/components/processing/platform-badge'
import type { ProcessingStage } from '@/types/processing'
import type { SupportedPlatform } from '@/utils/url-validation'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 120
const STROKE_WIDTH = 6
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface HeroProgressRingProps {
  progress: number
  platform: SupportedPlatform
  stage: ProcessingStage
}

export const HeroProgressRing = ({ progress, platform, stage }: HeroProgressRingProps) => {
  const normalizedProgress = Math.min(Math.max(progress / 100, 0), 1)
  const ringScale = useSharedValue(1)
  const prevStageRef = useRef(stage)

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(CIRCUMFERENCE * (1 - normalizedProgress), {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  }))

  // Subtle scale pulse + haptic on stage transitions
  useEffect(() => {
    if (stage === prevStageRef.current) return
    prevStageRef.current = stage

    ringScale.value = withSequence(
      withTiming(1.02, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 250, easing: Easing.out(Easing.cubic) })
    )
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [stage, ringScale])

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }))

  const displayPercent = Math.round(progress)

  return (
    <Animated.View
      style={[
        scaleStyle,
        { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      {/* Subtle radial glow */}
      <View
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: 100,
          experimental_backgroundImage:
            'radial-gradient(circle, rgba(132,204,22,0.08) 0%, transparent 70%)',
        }}
        pointerEvents="none"
      />

      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
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

      <View style={{ alignItems: 'center', gap: 2 }}>
        <PlatformBadge platform={platform} size={32} />
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Inter_700Bold',
            color: Colors.brand.accent,
            fontVariant: ['tabular-nums'],
          }}
        >
          {displayPercent}%
        </Text>
      </View>
    </Animated.View>
  )
}
