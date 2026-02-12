import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BottomActionButtons } from '@/components/home/bottom-action-buttons'
import { CurrentStreakCard } from '@/components/home/current-streak-card'
import { EmptyWorkoutCard } from '@/components/home/empty-workout-card'
import { HomeHeader } from '@/components/home/home-header'
import { ImportFromSocialsCard } from '@/components/home/import-from-socials-card'
import { RestDayCard } from '@/components/home/rest-day-card'
import { TodaysWorkoutCard } from '@/components/home/todays-workout-card'
import { WeeklyTrainingPlan } from '@/components/home/weekly-training-plan'
import { TAB_BAR_HEIGHT } from '@/constants/layout'
import { useWorkoutsQuery } from '@/hooks/use-api'
import { useScheduleQuery } from '@/hooks/use-schedule'
import { buildWeekDaysFromSchedule, getTodayDayOfWeek } from '@/utils/schedule'

const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const { workouts, isLoading: loading } = useWorkoutsQuery()
  const { schedule } = useScheduleQuery()

  const hasWorkouts = workouts.length > 0
  const weekDays = buildWeekDaysFromSchedule(schedule)
  const todayEntry = schedule.entries[getTodayDayOfWeek()]
  const todaysWorkout = todayEntry.workout

  const subtitle = hasWorkouts
    ? 'Keep the momentum going!'
    : 'Turn your favorite influencer workouts into real training sessions.'
  const streakText = hasWorkouts
    ? `${workouts.length} workout${workouts.length === 1 ? '' : 's'} saved`
    : 'No data. Start collecting!'

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
          paddingBottom: TAB_BAR_HEIGHT + 16,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader subtitle={subtitle} />

        {todaysWorkout !== null ? (
          <TodaysWorkoutCard workout={todaysWorkout} />
        ) : !hasWorkouts ? (
          <EmptyWorkoutCard />
        ) : (
          <RestDayCard />
        )}

        <WeeklyTrainingPlan days={weekDays} />
        <CurrentStreakCard text={streakText} />
        <ImportFromSocialsCard />
        <BottomActionButtons />
      </ScrollView>
    </View>
  )
}

export default HomeScreen
