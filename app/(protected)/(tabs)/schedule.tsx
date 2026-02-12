import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DayOptionsSheet } from '@/components/schedule/day-options-sheet'
import { EmptyScheduleState } from '@/components/schedule/empty-schedule-state'
import { StackLayout } from '@/components/schedule/layouts/stack-layout'
import { WorkoutPickerSheet } from '@/components/schedule/workout-picker-sheet'
import { useWorkoutsQuery } from '@/hooks/use-api'
import { useScheduleQuery, useUpdateScheduleMutation } from '@/hooks/use-schedule'
import type { DayOfWeek } from '@/types/schedule'
import { scheduleToPayload } from '@/utils/schedule'

const ScheduleScreen = () => {
  const insets = useSafeAreaInsets()
  const { schedule, isLoading: scheduleLoading } = useScheduleQuery()
  const { workouts, isLoading: workoutsLoading } = useWorkoutsQuery()
  const updateMutation = useUpdateScheduleMutation()

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null)
  const [checkmarkDay, setCheckmarkDay] = useState<DayOfWeek | null>(null)

  const optionsRef = useRef<BottomSheetModal>(null)
  const pickerRef = useRef<BottomSheetModal>(null)

  const handleDayPress = (day: DayOfWeek) => {
    const entry = schedule.entries[day]
    setSelectedDay(day)
    // Unassigned days go straight to picker
    if (entry.workoutId === null) {
      pickerRef.current?.present()
    } else {
      optionsRef.current?.present()
    }
  }

  const flashCheckmark = (day: DayOfWeek) => {
    setCheckmarkDay(day)
    setTimeout(() => setCheckmarkDay(null), 1200)
  }

  const handleAssign = (day: DayOfWeek, workoutId: string | null) => {
    const updated = { ...schedule, entries: [...schedule.entries] }
    updated.entries[day] = {
      ...updated.entries[day],
      workoutId,
      isRestDay: false,
      workout: workoutId !== null
        ? workouts.find((w) => w.id === workoutId) ?? null
        : null,
    }

    updateMutation.mutate(scheduleToPayload(updated), {
      onSuccess: () => flashCheckmark(day),
    })
  }

  const handleSelectWorkout = (workoutId: string) => {
    if (selectedDay === null) return
    handleAssign(selectedDay, workoutId)
    pickerRef.current?.dismiss()
    optionsRef.current?.dismiss()
  }

  const handleClear = () => {
    if (selectedDay === null) return
    handleAssign(selectedDay, null)
    pickerRef.current?.dismiss()
    optionsRef.current?.dismiss()
  }

  const handleChangeWorkout = () => {
    optionsRef.current?.dismiss()
    setTimeout(() => pickerRef.current?.present(), 300)
  }

  const handleAssignFromOptions = () => {
    optionsRef.current?.dismiss()
    setTimeout(() => pickerRef.current?.present(), 300)
  }

  const isLoading = scheduleLoading || workoutsLoading

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <Text className="text-sm font-inter text-content-secondary">Loading schedule...</Text>
      </View>
    )
  }

  if (workouts.length === 0) {
    return (
      <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
        <EmptyScheduleState />
      </View>
    )
  }

  const selectedEntry = selectedDay !== null ? schedule.entries[selectedDay] : null

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-inter-bold text-content-primary">My Schedule</Text>
      </View>

      <StackLayout schedule={schedule} onDayPress={handleDayPress} checkmarkDay={checkmarkDay} />

      {/* Bottom sheets */}
      <DayOptionsSheet
        ref={optionsRef}
        dayOfWeek={selectedDay}
        entry={selectedEntry}
        onChangeWorkout={handleChangeWorkout}
        onAssignWorkout={handleAssignFromOptions}
        onClear={handleClear}
        onDismiss={() => setSelectedDay(null)}
      />
      <WorkoutPickerSheet
        ref={pickerRef}
        workouts={workouts}
        scheduleEntries={schedule.entries}
        selectedDayWorkoutId={selectedEntry?.workoutId ?? null}
        onSelectWorkout={handleSelectWorkout}
        onClear={handleClear}
        onDismiss={() => setSelectedDay(null)}
        showClear={selectedEntry?.workoutId !== null}
      />
    </View>
  )
}

export default ScheduleScreen
