import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActivityHeatmap } from '@/components/home/activity-heatmap'
import { BottomActionButtons } from '@/components/home/bottom-action-buttons'
import { CompletedWorkoutCard } from '@/components/home/completed-workout-card'
import { EmptyWorkoutCard } from '@/components/home/empty-workout-card'
import { HomeHeader } from '@/components/home/home-header'
import { ImportFromSocialsCard } from '@/components/home/import-from-socials-card'
import { RestDayCard } from '@/components/home/rest-day-card'
import { TodaysWorkoutCard } from '@/components/home/todays-workout-card'
import { WeeklyTrainingPlan } from '@/components/home/weekly-training-plan'

import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useWorkoutsQuery } from '@/hooks/use-api'
import { useScheduleQuery } from '@/hooks/use-schedule'
import { buildWeekDaysFromSchedule, getTodayDayOfWeek } from '@/utils/schedule'

const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const { workouts, isLoading: loading } = useWorkoutsQuery()
  const { schedule } = useScheduleQuery()
  const { completedSession } = useActiveWorkout()

  const hasWorkouts = workouts.length > 0
  const todayEntry = schedule.entries[getTodayDayOfWeek()]
  const todaysWorkout = todayEntry.workout

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
    <View className="flex-1 bg-background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader subtitle={subtitle} />

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
      </ScrollView>
    </View>
  )
}

export default HomeScreen
