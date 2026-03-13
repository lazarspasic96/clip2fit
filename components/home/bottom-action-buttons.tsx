import { useRouter } from 'expo-router'
import { Download, ScanLine, Video } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useWorkoutsQuery } from '@/hooks/use-api'

export const BottomActionButtons = () => {
  const router = useRouter()
  const { workouts } = useWorkoutsQuery()

  const handleFormCoach = () => {
    const hasExercises = workouts.some((w) => w.exercises.length > 0)
    if (hasExercises) {
      router.push('/(protected)/sheets/form-coach-exercise' as never)
    } else {
      router.push('/(protected)/form-coach' as never)
    }
  }

  return (
    <View className="flex-row mx-5 gap-3">
      <Pressable
        onPress={() => router.push('/(protected)/add-workout')}
        className="flex-1 bg-background-tertiary rounded-2xl p-4 items-center gap-2"
      >
        <Video size={24} color={Colors.brand.accent} pointerEvents="none" />
        <Text className="text-sm font-inter text-content-primary text-center">Import from video</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(protected)/exercise-catalog' as never)}
        className="flex-1 bg-background-tertiary rounded-2xl p-4 items-center gap-2"
      >
        <Download size={24} color={Colors.brand.accent} pointerEvents="none" />
        <Text className="text-sm font-inter text-content-primary text-center">Import manually</Text>
      </Pressable>

      <Pressable
        onPress={handleFormCoach}
        className="flex-1 bg-background-tertiary rounded-2xl p-4 items-center gap-2"
      >
        <ScanLine size={24} color={Colors.brand.accent} pointerEvents="none" />
        <Text className="text-sm font-inter text-content-primary text-center">Form Coach</Text>
      </Pressable>
    </View>
  )
}
