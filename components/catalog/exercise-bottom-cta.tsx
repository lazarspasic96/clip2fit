import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'

interface ExerciseBottomCtaProps {
  selected: boolean
  onToggle: () => void
}

export const ExerciseBottomCta = ({ selected, onToggle }: ExerciseBottomCtaProps) => {
  const insets = useSafeAreaInsets()

  return (
    <BlurView
      intensity={80}
      tint="dark"
      className="absolute bottom-0 left-0 right-0 border-t border-border-primary px-5 py-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <Button
        onPress={onToggle}
        variant={selected ? 'secondary' : 'primary'}
      >
        {selected ? 'Remove from Workout' : 'Add to Workout'}
      </Button>
    </BlurView>
  )
}
