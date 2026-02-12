import { useRouter } from 'expo-router'
import { Calendar } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { WeekDay } from '@/types/schedule'

import { DayCard } from './day-card'

interface WeeklyTrainingPlanProps {
  days: WeekDay[]
}

export const WeeklyTrainingPlan = ({ days }: WeeklyTrainingPlanProps) => {
  const router = useRouter()

  return (
    <View className="mx-5">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-inter text-content-primary">Weekly Training Plan</Text>
        <Pressable onPress={() => router.push('/(protected)/(tabs)/schedule')} className="flex-row items-center gap-1">
          <Text className="text-xs font-inter text-content-secondary">View</Text>
          <Calendar size={16} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      </View>

      <View className="flex-row gap-1">
        {days.map((day, index) => (
          <DayCard key={index} day={day} />
        ))}
      </View>
    </View>
  )
}
