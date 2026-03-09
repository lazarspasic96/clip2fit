import { useRouter } from 'expo-router'
import { CalendarDays } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button'
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
      <Button onPress={() => router.push('/(protected)/add-workout')} size="sm" className="mt-6">
        Import Workout
      </Button>
    </View>
  )
}
