import { Alert, Pressable, Text, View } from 'react-native'
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
      className="bg-background-primary border-t border-border-primary px-5 py-3"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable onPress={handleDiscard} hitSlop={12}>
          <Text className="text-sm font-inter-semibold text-content-secondary">Discard</Text>
        </Pressable>

        <Button
          onPress={onSave}
          loading={saving}
          disabled={exerciseCount === 0}
          className="px-8"
        >
          Create Workout
        </Button>
      </View>
    </View>
  )
}
