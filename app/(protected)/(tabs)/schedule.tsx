import { useFocusEffect, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyScheduleState } from '@/components/schedule/empty-schedule-state'
import { StackLayout } from '@/components/schedule/layouts/stack-layout'
import { useWorkoutsQuery } from '@/hooks/use-api'
import { useScheduleQuery } from '@/hooks/use-schedule'
import { type FlashAction, scheduleFlashStore } from '@/stores/schedule-flash-store'
import type { DayOfWeek } from '@/types/schedule'

interface FlashState {
  day: DayOfWeek
  action: FlashAction
}

const ScheduleScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { schedule, isLoading: scheduleLoading } = useScheduleQuery()
  const { workouts, isLoading: workoutsLoading } = useWorkoutsQuery()

  const [flash, setFlash] = useState<FlashState | null>(null)

  useFocusEffect(() => {
    const state = scheduleFlashStore.consume()
    if (state !== null) {
      setFlash(state)
      const timer = setTimeout(() => setFlash(null), 1200)
      return () => clearTimeout(timer)
    }
  })

  const handleDayPress = (day: DayOfWeek) => {
    const entry = schedule.entries[day]
    if (entry.workoutId === null) {
      router.push(`/(protected)/sheets/workout-picker?dayOfWeek=${day}`)
    } else {
      router.push(`/(protected)/sheets/day-options?dayOfWeek=${day}`)
    }
  }

  const isLoading = scheduleLoading || workoutsLoading

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <Text className="text-sm font-inter text-content-secondary">Loading schedule...</Text>
      </View>
    )
  }

  if (workouts.length === 0) {
    return (
      <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
        <EmptyScheduleState />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-inter-bold text-content-primary">My Schedule</Text>
      </View>

      <StackLayout schedule={schedule} onDayPress={handleDayPress} flashDay={flash?.day ?? null} flashAction={flash?.action ?? 'assign'} />
    </View>
  )
}

export default ScheduleScreen
