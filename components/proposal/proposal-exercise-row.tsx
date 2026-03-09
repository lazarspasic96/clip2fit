import { Trash2 } from 'lucide-react-native'
import type { GestureType } from 'react-native-gesture-handler'
import { Pressable, Text, TextInput, View } from 'react-native'
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { DragHandle } from '@/components/ui/drag-handle'
import { MuscleChip } from '@/components/ui/muscle-chip'
import { Colors } from '@/constants/colors'
import type { DragState } from '@/hooks/use-draggable-list'
import type { ApiExercise } from '@/types/api'

const SPRING = { damping: 20, stiffness: 250 }
const SLIDE_WIDTH = 70

interface ProposalExerciseRowProps {
  exercise: ApiExercise
  index: number
  onUpdate: (updated: ApiExercise) => void
  onDelete: () => void
  dragGesture?: GestureType
  dragState?: DragState
  itemHeight?: number
  isNewlyAdded?: boolean
}

export const ProposalExerciseRow = ({
  exercise,
  index,
  onUpdate,
  onDelete,
  dragGesture,
  dragState,
  itemHeight = 0,
  isNewlyAdded = false,
}: ProposalExerciseRowProps) => {
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

  const dragAnimatedStyle = useAnimatedStyle(() => {
    if (dragState === undefined) {
      return { transform: [{ translateY: 0 }, { scale: 1 }], zIndex: 0, shadowOpacity: 0 }
    }

    const { activeIndex, hoveredIndex, translateY } = dragState
    const isActive = activeIndex.value === index

    if (isActive) {
      return {
        transform: [
          { translateY: translateY.value },
          { scale: withTiming(1.03, { duration: 150 }) },
        ],
        zIndex: 100,
        shadowOpacity: withTiming(0.2, { duration: 150 }),
      }
    }

    const active = activeIndex.value
    const hovered = hoveredIndex.value

    if (active === -1) {
      return {
        transform: [
          { translateY: withSpring(0, SPRING) },
          { scale: withTiming(1, { duration: 150 }) },
        ],
        zIndex: 0,
        shadowOpacity: 0,
      }
    }

    // Gap between items (gap-3 = 12px)
    const step = itemHeight + 12
    let shift = 0
    if (active < hovered) {
      if (index > active && index <= hovered) shift = -step
    } else if (active > hovered) {
      if (index >= hovered && index < active) shift = step
    }

    return {
      transform: [
        { translateY: withSpring(shift, SPRING) },
        { scale: withTiming(1, { duration: 150 }) },
      ],
      zIndex: 0,
      shadowOpacity: 0,
    }
  })

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
      style={[dragAnimatedStyle, { shadowColor: '#000', shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }]}
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
          {isNewlyAdded && (
            <View className="absolute inset-0 border border-brand-accent rounded-2xl" pointerEvents="none" />
          )}
          {/* Header: drag handle + order + name + trash */}
          <View className="flex-row items-center mb-2">
            {dragGesture !== undefined && <DragHandle gesture={dragGesture} />}
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
                <MuscleChip key={muscle} muscle={muscle} size="xs" tone="soft" />
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
                style={{ textAlign: 'center' }}
                className="text-sm font-inter text-content-primary border-b border-border-secondary w-10 py-0.5"
                placeholderTextColor={Colors.content.tertiary}
              />
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-inter text-content-secondary">Reps:</Text>
              <TextInput
                value={exercise.reps}
                onChangeText={(text) => onUpdate({ ...exercise, reps: text })}
                style={{ textAlign: 'center' }}
                className="text-sm font-inter text-content-primary border-b border-border-secondary w-16 py-0.5"
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
