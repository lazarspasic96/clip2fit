import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'

interface ExerciseBottomCtaProps {
  selected: boolean
  onToggle: () => void
}

export const ExerciseBottomCta = ({ selected, onToggle }: ExerciseBottomCtaProps) => {
  const insets = useSafeAreaInsets()

  const handleToggle = () => {
    Haptics.impactAsync(
      selected ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    )
    onToggle()
  }

  return (
    <BlurView
      intensity={80}
      tint="dark"
      className="absolute bottom-0 left-0 right-0 z-50 border-t border-border-primary overflow-hidden"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="px-5 py-3">
        <Button
          onPress={handleToggle}
          variant={selected ? 'secondary' : 'primary'}
        >
          {selected ? 'Remove from Workout' : 'Add to Workout'}
        </Button>
      </View>
    </BlurView>
  )
}
