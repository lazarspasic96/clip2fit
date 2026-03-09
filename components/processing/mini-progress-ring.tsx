import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, { useAnimatedProps } from 'react-native-reanimated'

import { Colors } from '@/constants/colors'
import { PlatformBadge } from '@/components/processing/platform-badge'
import { useSmoothProgress } from '@/hooks/use-smooth-progress'
import type { ProcessingStage } from '@/types/processing'
import type { SupportedPlatform } from '@/utils/url-validation'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 36
const STROKE_WIDTH = 3
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface MiniProgressRingProps {
  targetProgress: number
  platform: SupportedPlatform
  stage: ProcessingStage
  isCompleted: boolean
  isError: boolean
}

export const MiniProgressRing = ({
  targetProgress,
  platform,
  stage,
  isCompleted,
  isError,
}: MiniProgressRingProps) => {
  const smoothProgress = useSmoothProgress({ targetProgress, stage })

  const animatedProps = useAnimatedProps(() => {
    const normalized = Math.min(Math.max(smoothProgress.value / 100, 0), 1)
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - normalized),
    }
  })

  const strokeColor = isError
    ? '#f87171'
    : Colors.brand.accent

  return (
    <View
      className="items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
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
      </View>
      <PlatformBadge platform={platform} size={18} />
    </View>
  )
}
