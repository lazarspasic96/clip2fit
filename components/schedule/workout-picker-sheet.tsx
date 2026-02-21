import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import { X, XCircle } from 'lucide-react-native'
import { forwardRef } from 'react'
import { Pressable, Text, View } from 'react-native'

import { WorkoutPickerItem } from '@/components/schedule/workout-picker-item'
import { Colors } from '@/constants/colors'
import type { DayOfWeek, ScheduleEntry } from '@/types/schedule'
import type { WorkoutPlan } from '@/types/workout'

interface WorkoutPickerSheetProps {
  workouts: WorkoutPlan[]
  scheduleEntries: ScheduleEntry[]
  selectedDayWorkoutId: string | null
  onSelectWorkout: (workoutId: string) => void
  onClear: () => void
  onDismiss: () => void
  showClear: boolean
}

export const WorkoutPickerSheet = forwardRef<BottomSheetModal, WorkoutPickerSheetProps>(
  ({ workouts, scheduleEntries, selectedDayWorkoutId, onSelectWorkout, onClear, onDismiss, showClear }, ref) => {
    // Build a map of workoutId → assigned days
    const workoutDayMap = new Map<string, DayOfWeek[]>()
    for (const entry of scheduleEntries) {
      if (entry.workoutId !== null) {
        const existing = workoutDayMap.get(entry.workoutId) ?? []
        existing.push(entry.dayOfWeek)
        workoutDayMap.set(entry.workoutId, existing)
      }
    }

    const handleSelectWorkout = (workoutId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onSelectWorkout(workoutId)
    }

    const handleClear = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onClear()
    }

    const headerComponent = (
      <View>
        <View className="px-5 pt-2 pb-3">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-inter-bold text-content-primary">Select Workout</Text>
            <Pressable onPress={onDismiss}>
              <X size={20} color={Colors.content.secondary} pointerEvents="none" />
            </Pressable>
          </View>

          {/* Actions */}
          {showClear && (
            <View className="flex-row gap-2">
              <Pressable onPress={handleClear} className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-background-tertiary">
                <XCircle size={16} color={Colors.badge.error.content} pointerEvents="none" />
                <Text className="text-sm font-inter-semibold" style={{ color: Colors.badge.error.content }}>Clear</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Divider — full width, outside the padded container */}
        <View className="h-px bg-border-primary" />
      </View>
    )

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['60%', '90%']}
        enablePanDownToClose
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: Colors.background.secondary }}
        handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
      >
        <BottomSheetFlatList
          data={workouts}
          keyExtractor={(item: WorkoutPlan) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={headerComponent}
          renderItem={({ item }: { item: WorkoutPlan }) => (
            <WorkoutPickerItem
              workout={item}
              assignedDays={workoutDayMap.get(item.id) ?? []}
              isSelected={item.id === selectedDayWorkoutId}
              onSelect={() => handleSelectWorkout(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-sm font-inter text-content-tertiary">No workouts found</Text>
            </View>
          }
        />
      </BottomSheetModal>
    )
  },
)

WorkoutPickerSheet.displayName = 'WorkoutPickerSheet'
