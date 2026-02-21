import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated'

import { Colors } from '@/constants/colors'
import { PlatformBadge } from '@/components/processing/platform-badge'
import type { SupportedPlatform } from '@/utils/url-validation'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 36
const STROKE_WIDTH = 3
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface MiniProgressRingProps {
  progress: number
  platform: SupportedPlatform
  isCompleted: boolean
  isError: boolean
}

export const MiniProgressRing = ({
  progress,
  platform,
  isCompleted,
  isError,
}: MiniProgressRingProps) => {
  const normalizedProgress = Math.min(Math.max(progress / 100, 0), 1)

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(CIRCUMFERENCE * (1 - normalizedProgress), { duration: 400 }),
  }))

  const strokeColor = isError
    ? '#f87171'
    : isCompleted
      ? Colors.brand.accent
      : Colors.brand.accent

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
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
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <PlatformBadge platform={platform} size={18} />
    </View>
  )
}
