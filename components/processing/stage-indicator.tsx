import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { Circle, CircleCheck, Loader2 } from 'lucide-react-native'
import Animated, {
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

export const StageIndicator = ({ label, status }: StageIndicatorProps) => {
  const textColor =
    status === 'completed'
      ? 'text-brand-accent'
      : status === 'active'
        ? 'text-content-primary'
        : 'text-content-tertiary'

  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="w-6 items-center">
        {status === 'completed' && (
          <CircleCheck size={ICON_SIZE} color={Colors.brand.accent} pointerEvents="none" />
        )}
        {status === 'active' && <SpinningLoader />}
        {status === 'pending' && (
          <Circle size={ICON_SIZE} color={Colors.content.tertiary} pointerEvents="none" />
        )}
      </View>
      <Text className={`text-base font-inter ${textColor}`}>{label}</Text>
    </View>
  )
}
