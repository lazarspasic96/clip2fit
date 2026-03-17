import { useFocusEffect, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

import { EmptyScheduleState } from '@/components/schedule/empty-schedule-state'
import { StackLayout } from '@/components/schedule/layouts/stack-layout'
import { ScreenBlurTarget } from '@/components/ui/screen-blur-target'
import {
  BlurredScreenHeader,
  getBlurredScreenHeaderHeight,
} from '@/components/ui/blurred-screen-header'
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

  const blurTargetRef = useRef<View>(null)
  const [flash, setFlash] = useState<FlashState | null>(null)
  const headerHeight = getBlurredScreenHeaderHeight(insets.top)
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

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
      <View className="flex-1 bg-background-primary" collapsable={false}>
        <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
          <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
            <Text className="text-sm font-inter text-content-secondary">Loading schedule...</Text>
          </View>
        </ScreenBlurTarget>
        <BlurredScreenHeader blurTarget={blurTargetRef} title="My Schedule" scrollY={scrollY} />
      </View>
    )
  }

  if (workouts.length === 0) {
    return (
      <View className="flex-1 bg-background-primary" collapsable={false}>
        <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
          <View className="flex-1 px-5" style={{ paddingTop: headerHeight + 12 }}>
            <EmptyScheduleState />
          </View>
        </ScreenBlurTarget>
        <BlurredScreenHeader blurTarget={blurTargetRef} title="My Schedule" scrollY={scrollY} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" collapsable={false}>
      <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
        <StackLayout
          headerHeight={headerHeight}
          onScroll={scrollHandler}
          schedule={schedule}
          onDayPress={handleDayPress}
          flashDay={flash?.day ?? null}
          flashAction={flash?.action ?? 'assign'}
        />
      </ScreenBlurTarget>
      <BlurredScreenHeader blurTarget={blurTargetRef} title="My Schedule" scrollY={scrollY} />
    </View>
  )
}

export default ScheduleScreen
