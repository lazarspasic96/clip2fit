import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ScheduleDayRow } from '@/components/schedule/schedule-day-row'
import { TAB_CONTENT_BOTTOM_CLEARANCE } from '@/constants/tab-bar'

import type { FlashAction } from '@/stores/schedule-flash-store'
import type { DayOfWeek, WeeklySchedule } from '@/types/schedule'
import { getTodayDayOfWeek } from '@/utils/schedule'

interface StackLayoutProps {
  schedule: WeeklySchedule
  onDayPress: (day: DayOfWeek) => void
  flashDay: DayOfWeek | null
  flashAction: FlashAction
}

export const StackLayout = ({ schedule, onDayPress, flashDay, flashAction }: StackLayoutProps) => {
  const today = getTodayDayOfWeek()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + TAB_CONTENT_BOTTOM_CLEARANCE }}
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
            flashIcon={flashDay === day ? flashAction : null}
            index={i}
          />
        )
      })}
    </ScrollView>
  )
}
