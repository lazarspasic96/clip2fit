import { Colors } from '@/constants/colors'
import * as Haptics from 'expo-haptics'
import { Check } from 'lucide-react-native'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface SetCheckButtonProps {
  checked: boolean
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const SetCheckButton = ({ checked, onPress }: SetCheckButtonProps) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    if (checked) return
    scale.value = withSpring(1.3, { damping: 6, stiffness: 300 }, () => {
      scale.value = withSpring(1)
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className={`w-8 h-8 rounded-full items-center justify-center ${
        checked ? 'bg-brand-accent' : 'bg-background-tertiary border border-border-secondary'
      }`}
    >
      {checked && <Check size={16} color={Colors.background.primary} pointerEvents="none" />}
    </AnimatedPressable>
  )
}
