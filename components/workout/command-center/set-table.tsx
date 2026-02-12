import { SetTableRow } from '@/components/workout/command-center/set-table-row'
import type { WorkoutExercise } from '@/types/workout'
import { Text, View } from 'react-native'

interface SetTableProps {
  exercise: WorkoutExercise
}

export const SetTable = ({ exercise }: SetTableProps) => {
  const firstPendingIndex = exercise.sets.findIndex((s) => s.status === 'pending')

  return (
    <View>
      {/* Table header */}
      <View className="flex-row items-center py-1 px-3">
        <Text className="w-8 text-xs font-inter text-content-tertiary text-center">SET</Text>
        <Text className="w-20 text-xs font-inter text-content-tertiary">PREVIOUS</Text>
        {!exercise.isBodyweight && (
          <Text className="w-20 text-xs font-inter text-content-tertiary text-center">KG</Text>
        )}
        <Text className="w-16 text-xs font-inter text-content-tertiary text-center">REPS</Text>
        <View className="flex-1" />
      </View>

      {exercise.sets.map((set, i) => (
        <SetTableRow
          key={set.id}
          set={set}
          exerciseId={exercise.id}
          isBodyweight={exercise.isBodyweight}
          isActiveSet={i === firstPendingIndex}
        />
      ))}
    </View>
  )
}
