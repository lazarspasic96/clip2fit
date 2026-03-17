import { BlurView } from 'expo-blur'
import { Alert, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { Button } from '@/components/ui/button'
import { useWorkoutBuilder } from '@/contexts/workout-builder-context'

interface BuilderActionsProps {
  onSave: () => void
  exerciseCount: number
  saving: boolean
}

export const BuilderActions = ({ onSave, exerciseCount, saving }: BuilderActionsProps) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const builder = useWorkoutBuilder()

  const handleDiscard = () => {
    Alert.alert(
      'Discard workout?',
      'Your selections will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            builder.clearAll()
            router.replace('/(protected)/(tabs)/(home)' as never)
          },
        },
      ],
    )
  }

  return (
    <View
      className="border-t border-border-primary overflow-hidden"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <BlurView
        intensity={80}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-row gap-3 px-5 py-3">
        <Button
          variant="ghost"
          onPress={handleDiscard}
          className="flex-1 border border-border-primary"
          textClassName="text-content-primary"
        >
          Discard
        </Button>
        <Button onPress={onSave} loading={saving} disabled={exerciseCount === 0} className="flex-1">
          Create Workout
        </Button>
      </View>
    </View>
  )
}
