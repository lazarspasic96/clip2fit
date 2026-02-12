import { Trash2 } from 'lucide-react-native'
import { Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown, Layout, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { Colors } from '@/constants/colors'
import type { ApiExercise } from '@/types/api'

interface ProposalExerciseRowProps {
  exercise: ApiExercise
  index: number
  onUpdate: (updated: ApiExercise) => void
  onDelete: () => void
}

const SLIDE_WIDTH = 70

export const ProposalExerciseRow = ({ exercise, index, onUpdate, onDelete }: ProposalExerciseRowProps) => {
  const slideX = useSharedValue(0)
  const isRevealed = useSharedValue(false)

  const handleTrashPress = () => {
    if (isRevealed.value) {
      slideX.value = withTiming(0)
      isRevealed.value = false
    } else {
      slideX.value = withTiming(-SLIDE_WIDTH)
      isRevealed.value = true
    }
  }

  const handleConfirmDelete = () => {
    onDelete()
  }

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }))

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
      className="mb-3 mx-6"
    >
      <View className="overflow-hidden rounded-2xl">
        {/* Delete button revealed behind */}
        <View className="absolute right-0 top-0 bottom-0 justify-center" style={{ width: SLIDE_WIDTH }}>
          <Pressable onPress={handleConfirmDelete} className="flex-1 bg-red-600 items-center justify-center">
            <Text className="text-sm font-inter-semibold text-white">Delete</Text>
          </Pressable>
        </View>

        {/* Main card content */}
        <Animated.View style={slideStyle} className="bg-background-secondary rounded-2xl p-4">
          {/* Header: order + name + trash */}
          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-inter-bold text-content-tertiary w-7">{index + 1}</Text>
            <Text className="text-base font-inter-semibold text-content-primary flex-1" numberOfLines={1}>
              {exercise.name}
            </Text>
            <Pressable onPress={handleTrashPress} hitSlop={8}>
              <Trash2 size={18} color={Colors.content.tertiary} pointerEvents="none" />
            </Pressable>
          </View>

          {/* Muscle group pills */}
          {exercise.muscleGroups.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {exercise.muscleGroups.map((muscle) => (
                <View key={muscle} className="bg-background-tertiary rounded-full px-2.5 py-0.5">
                  <Text className="text-xs font-inter text-content-secondary">{muscle}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Editable fields row */}
          <View className="flex-row items-center gap-3 mb-2">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-inter text-content-secondary">Sets:</Text>
              <TextInput
                value={exercise.sets.toString()}
                onChangeText={(text) => {
                  const parsed = parseInt(text, 10)
                  if (!isNaN(parsed) && parsed > 0) {
                    onUpdate({ ...exercise, sets: parsed })
                  } else if (text === '') {
                    onUpdate({ ...exercise, sets: 0 })
                  }
                }}
                keyboardType="number-pad"
                className="text-sm font-inter text-content-primary border-b border-border-secondary w-10 text-center py-0.5"
                placeholderTextColor={Colors.content.tertiary}
              />
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-inter text-content-secondary">Reps:</Text>
              <TextInput
                value={exercise.reps}
                onChangeText={(text) => onUpdate({ ...exercise, reps: text })}
                className="text-sm font-inter text-content-primary border-b border-border-secondary w-16 text-center py-0.5"
                placeholderTextColor={Colors.content.tertiary}
                placeholder="e.g. 8-10"
              />
            </View>

            {exercise.restBetweenSets !== null && exercise.restBetweenSets.length > 0 && (
              <Text className="text-sm font-inter text-content-tertiary">Rest: {exercise.restBetweenSets}</Text>
            )}
          </View>

          {/* Notes (editable) */}
          {exercise.notes !== null && exercise.notes.length > 0 && (
            <TextInput
              value={exercise.notes}
              onChangeText={(text) => onUpdate({ ...exercise, notes: text })}
              multiline
              className="text-sm font-inter text-content-secondary mt-1 py-1"
              placeholderTextColor={Colors.content.tertiary}
              placeholder="Add notes..."
            />
          )}
        </Animated.View>
      </View>
    </Animated.View>
  )
}
