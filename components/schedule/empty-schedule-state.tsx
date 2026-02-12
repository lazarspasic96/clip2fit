import { useRouter } from 'expo-router'
import { CalendarDays } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

export const EmptyScheduleState = () => {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center px-8">
      <CalendarDays size={48} color={Colors.content.tertiary} pointerEvents="none" />
      <Text className="text-lg font-inter-bold text-content-primary mt-4 text-center">
        No workouts yet
      </Text>
      <Text className="text-sm font-inter text-content-secondary mt-2 text-center">
        Import your first workout to start planning your weekly schedule
      </Text>
      <Pressable
        onPress={() => router.push('/(protected)/add-workout')}
        className="mt-6 px-6 py-3 rounded-lg bg-brand-accent"
      >
        <Text className="text-sm font-inter-bold text-background-primary">
          Import Workout
        </Text>
      </Pressable>
    </View>
  )
}
