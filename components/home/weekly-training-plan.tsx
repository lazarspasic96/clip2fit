import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'

import type { WeekDay } from '@/types/schedule'
import { getTodayDayOfWeek } from '@/utils/schedule'

import { DayCounter } from './day-picker/day-counter'
import { SegmentedStrip } from './day-picker/segmented-strip'

interface WeeklyTrainingPlanProps {
  days: WeekDay[]
}

export const WeeklyTrainingPlan = ({ days }: WeeklyTrainingPlanProps) => {
  const router = useRouter()
  const todayIndex = getTodayDayOfWeek()

  const now = new Date()
  const currentDay = now.getDate()
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const todayWorkout = days[todayIndex]
  const trainingName = todayWorkout.workoutLabel

  const navigateToSchedule = () =>
    router.push('/(protected)/(tabs)/schedule' as never)

  return (
    <View className="mx-5">
      <View className="flex-row items-baseline justify-between mb-3">
        <DayCounter currentDay={currentDay} totalDays={totalDays} />

        {trainingName !== undefined ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: todayWorkout.dotColor ?? '#71717a',
              }}
            />
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontFamily: 'Inter_600SemiBold',
                color: '#a1a1aa',
                maxWidth: 140,
              }}
            >
              {trainingName}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'Inter_400Regular',
              color: '#3f3f46',
            }}
          >
            Rest day
          </Text>
        )}
      </View>

      <SegmentedStrip days={days} todayIndex={todayIndex} onDayPress={navigateToSchedule} />
    </View>
  )
}
