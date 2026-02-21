import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { Circle, CircleCheck, Loader2 } from 'lucide-react-native'
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

type StageStatus = 'pending' | 'active' | 'completed'

interface StageIndicatorProps {
  label: string
  status: StageStatus
  index: number
}

const ICON_SIZE = 18

const SpinningLoader = () => {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Loader2 size={ICON_SIZE} color={Colors.brand.accent} pointerEvents="none" />
    </Animated.View>
  )
}

export const StageIndicator = ({ label, status, index }: StageIndicatorProps) => {
  const isActive = status === 'active'

  const textColor =
    status === 'completed'
      ? 'text-brand-accent'
      : status === 'active'
        ? 'text-content-primary'
        : 'text-content-tertiary'

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(300)}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginHorizontal: -12,
            borderRadius: 10,
            borderCurve: 'continuous',
          },
          isActive ? { backgroundColor: 'rgba(132,204,22,0.06)' } : undefined,
        ]}
      >
        <View style={{ width: 24, alignItems: 'center' }}>
          {status === 'completed' && (
            <Animated.View entering={FadeIn.duration(200)}>
              <CircleCheck size={ICON_SIZE} color={Colors.brand.accent} pointerEvents="none" />
            </Animated.View>
          )}
          {status === 'active' && <SpinningLoader />}
          {status === 'pending' && (
            <Circle size={ICON_SIZE} color={Colors.content.tertiary} pointerEvents="none" />
          )}
        </View>
        <Text className={`text-base font-inter ${textColor}`}>{label}</Text>
      </View>
    </Animated.View>
  )
}
