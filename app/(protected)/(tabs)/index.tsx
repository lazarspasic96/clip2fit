import { ScrollView, View } from 'react-native'
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
import { MOCK_DATA, type HomeScreenState } from '@/utils/mock-data'

// Change this to 'active' or 'rest' to preview other states
const CURRENT_STATE: HomeScreenState = 'rest'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const data = MOCK_DATA[CURRENT_STATE]

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
        <HomeHeader subtitle={data.subtitle} />

        {CURRENT_STATE === 'empty' && <EmptyWorkoutCard />}
        {CURRENT_STATE === 'active' && data.workout && <TodaysWorkoutCard workout={data.workout} />}
        {CURRENT_STATE === 'rest' && <RestDayCard />}

        <WeeklyTrainingPlan days={[...data.week]} />
        <CurrentStreakCard text={data.streakText} />
        <ImportFromSocialsCard />
        <BottomActionButtons />
      </ScrollView>
    </View>
  )
}
