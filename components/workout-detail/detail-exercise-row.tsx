import { Pencil, Trash2 } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'
import type { ApiExercise } from '@/types/api'

interface DetailExerciseRowProps {
  exercise: ApiExercise
  onEdit: () => void
  onDelete: () => void
}

const DELETE_ACTION_WIDTH = 72

const DeleteAction = () => (
  <View
    className="items-center justify-center h-full bg-destructive rounded-tr-2xl rounded-br-2xl"
    style={{ width: DELETE_ACTION_WIDTH }}
  >
    <Trash2 size={18} color="#fff" pointerEvents="none" />
    <Text className="text-xs font-inter-semibold text-white mt-0.5">Delete</Text>
  </View>
)

export const DetailExerciseRow = ({ exercise, onEdit, onDelete }: DetailExerciseRowProps) => (
  <View className="mx-5 mb-3">
    <SwipeableRow actionWidth={DELETE_ACTION_WIDTH} actionContent={<DeleteAction />} onAction={onDelete}>
      <View className="bg-background-secondary p-4">
        <View className="flex-row items-center mb-1">
          <Text className="text-sm font-inter-bold text-content-tertiary w-7">{exercise.order}</Text>
          <Text className="text-base font-inter-semibold text-content-primary flex-1" numberOfLines={1}>
            {exercise.name}
          </Text>
          <Pressable onPress={onEdit} hitSlop={12}>
            <Pencil size={14} color={Colors.content.tertiary} pointerEvents="none" />
          </Pressable>
        </View>

        {exercise.muscleGroups.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 ml-7 mb-2">
            {exercise.muscleGroups.map((muscle) => (
              <View key={muscle} className="bg-background-tertiary rounded-full px-2.5 py-0.5">
                <Text className="text-xs font-inter text-content-secondary">{muscle}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row items-center gap-3 ml-7">
          <Text className="text-sm font-inter text-content-secondary">
            {exercise.sets} x {exercise.reps}
          </Text>
          {exercise.targetWeight !== null && (
            <Text className="text-sm font-inter text-content-tertiary">{exercise.targetWeight} kg</Text>
          )}
        </View>

        {exercise.notes !== null && exercise.notes.length > 0 && (
          <Text className="text-sm font-inter text-content-tertiary ml-7 mt-2">{exercise.notes}</Text>
        )}
      </View>
    </SwipeableRow>
  </View>
)
