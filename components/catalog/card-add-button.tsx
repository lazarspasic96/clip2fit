import * as Haptics from 'expo-haptics'
import { Check, Plus } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const BG_UNSELECTED = 'rgba(24, 24, 27, 0.85)'
const BG_SELECTED = '#84cc16'
const ICON_UNSELECTED = '#fafafa'
const ICON_SELECTED = '#09090b'
const ICON_SIZE = 14

interface CardAddButtonProps {
  isSelected: boolean
  onToggle: () => void
  position?: 'bottom-right' | 'top-right'
}

export const CardAddButton = ({
  isSelected,
  onToggle,
  position = 'bottom-right',
}: CardAddButtonProps) => {
  const scale = useSharedValue(1)
  const progress = useSharedValue(isSelected ? 1 : 0)
  const spin = useSharedValue(isSelected ? 1 : 0)

  progress.value = withTiming(isSelected ? 1 : 0, { duration: 200 })
  spin.value = withTiming(isSelected ? 1 : 0, {
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [BG_UNSELECTED, BG_SELECTED]),
  }))

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${spin.value * 180}deg` }],
    opacity: 1 - spin.value,
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${(1 - spin.value) * -180}deg` }],
    opacity: spin.value,
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.85, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }

  const handlePress = () => {
    const style = isSelected
      ? Haptics.ImpactFeedbackStyle.Light
      : Haptics.ImpactFeedbackStyle.Medium
    Haptics.impactAsync(style)
    onToggle()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={isSelected ? 'Remove from workout' : 'Add to workout'}
      accessibilityState={{ selected: isSelected }}
      style={[
        animatedStyle,
        {
          position: 'absolute',
          ...(position === 'top-right' ? { top: 8 } : { bottom: 8 }),
          right: 8,
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 4,
        },
      ]}
    >
      <View style={{ width: ICON_SIZE, height: ICON_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[{ position: 'absolute' }, plusStyle]}>
          <Plus size={ICON_SIZE} color={ICON_UNSELECTED} pointerEvents="none" />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute' }, checkStyle]}>
          <Check size={ICON_SIZE} color={ICON_SELECTED} pointerEvents="none" />
        </Animated.View>
      </View>
    </AnimatedPressable>
  )
}
