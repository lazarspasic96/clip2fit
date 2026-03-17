import { ActivityIndicator, View } from 'react-native'
import { useRef } from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActivityHeatmap } from '@/components/home/activity-heatmap'
import { BottomActionButtons } from '@/components/home/bottom-action-buttons'
import { CompletedWorkoutCard } from '@/components/home/completed-workout-card'
import { HomeCollapsingHeader } from '@/components/home/home-collapsing-header'
import { EmptyWorkoutCard } from '@/components/home/empty-workout-card'
import { HomeHeader } from '@/components/home/home-header'
import { ImportFromSocialsCard } from '@/components/home/import-from-socials-card'
import { RestDayCard } from '@/components/home/rest-day-card'
import { TodaysWorkoutCard } from '@/components/home/todays-workout-card'
import { WeeklyTrainingPlan } from '@/components/home/weekly-training-plan'
import { ScreenBlurTarget } from '@/components/ui/screen-blur-target'
import { TAB_CONTENT_BOTTOM_CLEARANCE } from '@/constants/tab-bar'

import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useAuth } from '@/contexts/auth-context'
import { useWorkoutsQuery } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import { useScheduleQuery } from '@/hooks/use-schedule'
import { buildWeekDaysFromSchedule, getTodayDayOfWeek } from '@/utils/schedule'

const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { profile } = useProfileQuery()
  const { workouts, isLoading: loading } = useWorkoutsQuery()
  const { schedule } = useScheduleQuery()
  const { completedSession } = useActiveWorkout()
  const blurTargetRef = useRef<View>(null)
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const hasWorkouts = workouts.length > 0
  const todayEntry = schedule.entries[getTodayDayOfWeek()]
  const todaysWorkout = todayEntry.workout
  const displayName = profile?.fullName?.trim() || 'there'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = displayName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isCompletedToday =
    completedSession !== null && todaysWorkout !== null && completedSession.plan.id === todaysWorkout.id

  const weekDays = buildWeekDaysFromSchedule(schedule, completedSession?.plan.id ?? null)

  const subtitle = hasWorkouts
    ? 'Keep the momentum going!'
    : 'Turn your favorite influencer workouts into real training sessions.'

  if (loading) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" collapsable={false}>
      <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
        <Animated.ScrollView
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + TAB_CONTENT_BOTTOM_CLEARANCE,
            gap: 20,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader avatarUrl={avatarUrl} displayName={displayName} initials={initials} subtitle={subtitle} />
          {isCompletedToday && todaysWorkout !== null ? (
            <CompletedWorkoutCard workout={todaysWorkout} />
          ) : todaysWorkout !== null ? (
            <TodaysWorkoutCard workout={todaysWorkout} />
          ) : !hasWorkouts ? (
            <EmptyWorkoutCard />
          ) : (
            <RestDayCard />
          )}
          <ImportFromSocialsCard />
          <WeeklyTrainingPlan days={weekDays} />
          <ActivityHeatmap />

          <BottomActionButtons />
        </Animated.ScrollView>
      </ScreenBlurTarget>

      <HomeCollapsingHeader
        avatarUrl={avatarUrl}
        blurTarget={blurTargetRef}
        displayName={displayName}
        initials={initials}
        scrollY={scrollY}
        subtitle={subtitle}
      />
    </View>
  )
}

export default HomeScreen
