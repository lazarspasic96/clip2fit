import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { XCircle } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

import { WorkoutPickerItem } from '@/components/schedule/workout-picker-item'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useWorkoutsQuery } from '@/hooks/use-api'
import { useAssignScheduleDay, useScheduleQuery } from '@/hooks/use-schedule'
import { scheduleFlashStore } from '@/stores/schedule-flash-store'
import type { DayOfWeek } from '@/types/schedule'

const WorkoutPickerScreen = () => {
  const router = useRouter()
  const { dayOfWeek: dayParam } = useLocalSearchParams<{ dayOfWeek: string }>()
  const dayOfWeek = Number(dayParam) as DayOfWeek

  const { workouts } = useWorkoutsQuery()
  const { schedule } = useScheduleQuery()
  const assignDay = useAssignScheduleDay(schedule)

  const entry = schedule.entries[dayOfWeek]
  const showClear = entry !== undefined && entry.workoutId !== null

  const workoutDayMap = schedule.entries.reduce<Map<string, DayOfWeek[]>>((map, e) => {
    if (e.workoutId !== null) {
      map.set(e.workoutId, [...(map.get(e.workoutId) ?? []), e.dayOfWeek])
    }
    return map
  }, new Map())

  const handleAssign = (workoutId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    assignDay(dayOfWeek, workoutId)
    scheduleFlashStore.flash(dayOfWeek, workoutId === null ? 'clear' : 'assign')
    router.back()
  }

  return (
    <FlashList
      data={workouts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <View>
          <View className="px-5 pt-4 pb-3">
            <SheetTitle>Select Workout</SheetTitle>

            {showClear && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleAssign(null)}
                  className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-background-tertiary"
                >
                  <XCircle size={16} color={Colors.badge.error.content} pointerEvents="none" />
                  <Text className="text-sm font-inter-semibold" style={{ color: Colors.badge.error.content }}>
                    Clear
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
          <View className="h-px bg-border-primary" />
        </View>
      }
      renderItem={({ item }) => (
        <WorkoutPickerItem
          workout={item}
          assignedDays={workoutDayMap.get(item.id) ?? []}
          isSelected={item.id === entry?.workoutId}
          onSelect={() => handleAssign(item.id)}
        />
      )}
      ListEmptyComponent={
        <View className="items-center justify-center py-8">
          <Text className="text-sm font-inter text-content-tertiary">No workouts found</Text>
        </View>
      }
    />
  )
}

export default WorkoutPickerScreen
