import { Pencil, Trash2 } from 'lucide-react-native'
import type { GestureType } from 'react-native-gesture-handler'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'

import { DragHandle } from '@/components/ui/drag-handle'
import { MuscleChip } from '@/components/ui/muscle-chip'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'
import type { DragState } from '@/hooks/use-draggable-list'
import type { ApiExercise } from '@/types/api'

const DELETE_ACTION_WIDTH = 72
const SPRING = { damping: 20, stiffness: 250 }

interface DetailExerciseRowProps {
  exercise: ApiExercise
  index: number
  onEdit: () => void
  onDelete: () => void
  dragGesture?: GestureType
  dragState?: DragState
  itemHeight?: number
}

const DeleteAction = () => (
  <View
    className="items-center justify-center h-full bg-destructive rounded-2xl"
    style={{ width: DELETE_ACTION_WIDTH }}
  >
    <Trash2 size={18} color="#fff" pointerEvents="none" />
    <Text className="text-xs font-inter-semibold text-white mt-0.5">Delete</Text>
  </View>
)

export const DetailExerciseRow = ({
  exercise,
  index,
  onEdit,
  onDelete,
  dragGesture,
  dragState,
  itemHeight = 0,
}: DetailExerciseRowProps) => {
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

    // mb-3 = 12px gap between items
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
      className="mx-5 mb-3"
      style={[dragAnimatedStyle, { shadowColor: '#000', shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }]}
    >
      <SwipeableRow actionWidth={DELETE_ACTION_WIDTH} actionContent={<DeleteAction />} onAction={onDelete}>
        <View className="bg-background-secondary p-4">
          <View className="flex-row items-center mb-1">
            {dragGesture !== undefined && <DragHandle gesture={dragGesture} />}
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
                <MuscleChip key={muscle} muscle={muscle} size="xs" tone="soft" />
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
    </Animated.View>
  )
}
