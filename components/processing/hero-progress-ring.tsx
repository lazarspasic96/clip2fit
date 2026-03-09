import { useEffect, useRef } from 'react'
import { View } from 'react-native'
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
import { PulseRings } from '@/components/processing/pulse-rings'
import { useSmoothProgress } from '@/hooks/use-smooth-progress'
import type { ProcessingStage } from '@/types/processing'
import type { SupportedPlatform } from '@/utils/url-validation'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 120
const STROKE_WIDTH = 6
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface HeroProgressRingProps {
  targetProgress: number
  platform: SupportedPlatform
  stage: ProcessingStage
}

export const HeroProgressRing = ({ targetProgress, platform, stage }: HeroProgressRingProps) => {
  const smoothProgress = useSmoothProgress({ targetProgress, stage })
  const ringScale = useSharedValue(1)
  const prevStageRef = useRef(stage)

  const animatedProps = useAnimatedProps(() => {
    const normalized = Math.min(Math.max(smoothProgress.value / 100, 0), 1)
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - normalized),
    }
  })

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

  return (
    <Animated.View
      style={[
        scaleStyle,
        { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
      ]}
    >
      {/* Shazam-like pulse rings */}
      <PulseRings size={SIZE} isAnimating={stage !== 'complete' && stage !== 'error'} />

      <View className="absolute inset-0">
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
      </View>

      <View className="absolute inset-0 items-center justify-center">
        <PlatformBadge platform={platform} size={36} />
      </View>
    </Animated.View>
  )
}
