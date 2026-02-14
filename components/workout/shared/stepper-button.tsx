import * as Haptics from 'expo-haptics'
import { Minus, Plus } from 'lucide-react-native'
import { Pressable } from 'react-native'

import { Colors } from '@/constants/colors'

interface StepperButtonProps {
  type: 'increment' | 'decrement'
  onPress: () => void
}

export const StepperButton = ({ type, onPress }: StepperButtonProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const Icon = type === 'increment' ? Plus : Minus

  return (
    <Pressable
      onPress={handlePress}
      className="w-11 h-11 rounded-lg border border-brand-accent items-center justify-center"
    >
      <Icon size={20} color={Colors.brand.accent} pointerEvents="none" />
    </Pressable>
  )
}
