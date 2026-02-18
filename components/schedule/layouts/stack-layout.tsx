import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ScheduleDayRow } from '@/components/schedule/schedule-day-row'

import type { DayOfWeek, WeeklySchedule } from '@/types/schedule'
import { getTodayDayOfWeek } from '@/utils/schedule'

interface StackLayoutProps {
  schedule: WeeklySchedule
  onDayPress: (day: DayOfWeek) => void
  checkmarkDay: DayOfWeek | null
}

export const StackLayout = ({ schedule, onDayPress, checkmarkDay }: StackLayoutProps) => {
  const today = getTodayDayOfWeek()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {schedule.entries.map((entry, i) => {
        const day = i as DayOfWeek
        return (
          <ScheduleDayRow
            key={day}
            entry={entry}
            dayOfWeek={day}
            isToday={day === today}
            onPress={() => onDayPress(day)}
            showCheckmark={checkmarkDay === day}
            index={i}
          />
        )
      })}
    </ScrollView>
  )
}
