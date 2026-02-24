import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { CalendarDays, XCircle } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { OptionRow } from '@/components/schedule/option-row'
import { Colors } from '@/constants/colors'
import { useAssignScheduleDay, useScheduleQuery } from '@/hooks/use-schedule'
import { scheduleFlashStore } from '@/stores/schedule-flash-store'
import type { DayOfWeek } from '@/types/schedule'
import { DAY_LABELS } from '@/utils/schedule'

const DayOptionsScreen = () => {
  const router = useRouter()
  const { dayOfWeek: dayParam } = useLocalSearchParams<{ dayOfWeek: string }>()
  const dayOfWeek = Number(dayParam) as DayOfWeek

  const { schedule } = useScheduleQuery()
  const assignDay = useAssignScheduleDay(schedule)

  const entry = schedule.entries[dayOfWeek]
  const hasWorkout = entry !== undefined && entry.workoutId !== null

  const withHaptic = (fn: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    fn()
  }

  const handleChangeWorkout = () => {
    router.replace(`/(protected)/sheets/workout-picker?dayOfWeek=${dayOfWeek}`)
  }

  const handleAssignWorkout = () => {
    router.replace(`/(protected)/sheets/workout-picker?dayOfWeek=${dayOfWeek}`)
  }

  const handleClear = () => {
    assignDay(dayOfWeek, null)
    scheduleFlashStore.flash(dayOfWeek, 'clear')
    router.back()
  }

  return (
    <View className="px-6 pb-8 pt-2">
      <Text className="text-lg font-inter-bold text-content-primary text-center mb-4">
        {DAY_LABELS[dayOfWeek] ?? ''}
      </Text>

      <View className="gap-2">
        {hasWorkout ? (
          <>
            <OptionRow
              icon={<CalendarDays size={20} color={Colors.content.primary} pointerEvents="none" />}
              label="Change Workout"
              onPress={withHaptic(handleChangeWorkout)}
            />
            <OptionRow
              icon={<XCircle size={20} color={Colors.badge.error.content} pointerEvents="none" />}
              label="Clear"
              onPress={withHaptic(handleClear)}
              destructive
            />
          </>
        ) : (
          <OptionRow
            icon={<CalendarDays size={20} color={Colors.content.primary} pointerEvents="none" />}
            label="Assign Workout"
            onPress={withHaptic(handleAssignWorkout)}
          />
        )}
      </View>
    </View>
  )
}

export default DayOptionsScreen
