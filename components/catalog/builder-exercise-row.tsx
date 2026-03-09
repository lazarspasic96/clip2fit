import { Image } from 'expo-image'
import { Dumbbell, Trash2 } from 'lucide-react-native'
import type { GestureType } from 'react-native-gesture-handler'
import { Text, TextInput, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

import { DragHandle } from '@/components/ui/drag-handle'
import { MuscleChip } from '@/components/ui/muscle-chip'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'
import type { DragState } from '@/hooks/use-draggable-list'
import type { SelectedExercise } from '@/types/catalog'

const SLIDE = { duration: 300, dampingRatio: 1 }
const LIFT = { duration: 200, dampingRatio: 1 }

interface BuilderExerciseRowProps {
  exercise: SelectedExercise
  index: number
  onUpdate: (updates: Partial<Pick<SelectedExercise, 'sets' | 'reps'>>) => void
  onDelete: () => void
  dragGesture?: GestureType
  dragState?: DragState
  itemHeight?: number
}

const DELETE_ACTION_WIDTH = 70

const deleteActionContent = (
  <View className="bg-red-500/20 rounded-xl items-center justify-center w-[70px] h-full">
    <Trash2 size={20} color="#f87171" pointerEvents="none" />
  </View>
)

export const BuilderExerciseRow = ({
  exercise,
  index,
  onUpdate,
  onDelete,
  dragGesture,
  dragState,
  itemHeight = 0,
}: BuilderExerciseRowProps) => {
  const handleSetsChange = (text: string) => {
    const parsed = parseInt(text, 10)
    if (Number.isNaN(parsed)) return
    const clamped = Math.max(1, Math.min(20, parsed))
    onUpdate({ sets: clamped })
  }

  const handleRepsChange = (text: string) => {
    onUpdate({ reps: text })
  }

  const hasThumbnail = exercise.catalogExercise.thumbnailUrl !== null
  const targetMuscle = exercise.catalogExercise.target
  const secondaryMuscles = exercise.catalogExercise.secondaryMuscles.slice(0, 1)

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
          { scale: withSpring(1.03, LIFT) },
        ],
        zIndex: 100,
        shadowOpacity: withSpring(0.12, LIFT),
      }
    }

    const active = activeIndex.value
    const hovered = hoveredIndex.value

    if (active === -1) {
      return {
        transform: [
          { translateY: withSpring(0, SLIDE) },
          { scale: withSpring(1, LIFT) },
        ],
        zIndex: 0,
        shadowOpacity: 0,
      }
    }

    // mb-2.5 = 10px gap between items
    const step = itemHeight + 10
    let shift = 0
    if (active < hovered) {
      if (index > active && index <= hovered) shift = -step
    } else if (active > hovered) {
      if (index >= hovered && index < active) shift = step
    }

    return {
      transform: [
        { translateY: withSpring(shift, SLIDE) },
        { scale: withSpring(1, LIFT) },
      ],
      zIndex: 0,
      shadowOpacity: 0,
    }
  })

  return (
    <Animated.View
      className="mb-2.5"
      style={[dragAnimatedStyle, { shadowColor: '#000', shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }]}
    >
      <SwipeableRow actionWidth={DELETE_ACTION_WIDTH} actionContent={deleteActionContent} onAction={onDelete}>
        <View className="mx-5 bg-background-secondary flex-row overflow-hidden rounded-2xl" style={{ borderCurve: 'continuous' }}>
          {/* Drag handle + index badge */}
          <View className="w-9 items-center justify-center gap-1.5">
            {dragGesture !== undefined && <DragHandle gesture={dragGesture} />}
            <View className="w-[22px] h-[22px] rounded-full bg-brand-accent items-center justify-center">
              <Text
                className="text-[11px] font-inter-bold text-background-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {index + 1}
              </Text>
            </View>
          </View>

          {/* Content: name, muscles, sets/reps */}
          <View className="flex-1 py-3.5 pr-3 gap-2">
            <Text className="text-[15px] font-inter-semibold text-content-primary" numberOfLines={2}>
              {exercise.catalogExercise.name}
            </Text>

            {targetMuscle.length > 0 && (
              <View className="flex-row gap-1">
                <MuscleChip key={targetMuscle} muscle={targetMuscle} size="xs" tone="soft" maxWidth={110} />
                {secondaryMuscles.map((muscle) => (
                  <MuscleChip key={muscle} muscle={muscle} size="xs" tone="soft" maxWidth={110} />
                ))}
              </View>
            )}

            {/* Sets x Reps inline */}
            <View className="flex-row items-center gap-1.5">
              <View
                className="flex-row items-center bg-background-tertiary rounded-[10px] px-2.5 h-[34px] gap-1"
                style={{ borderCurve: 'continuous' }}
              >
                <Text className="text-[11px] font-inter-medium text-content-tertiary">Sets</Text>
                <TextInput
                  style={{
                    fontSize: 15,
                    fontFamily: 'Inter_600SemiBold',
                    color: Colors.content.primary,
                    width: 28,
                    textAlign: 'center',
                    padding: 0,
                    fontVariant: ['tabular-nums'],
                  }}
                  keyboardType="number-pad"
                  value={String(exercise.sets)}
                  onChangeText={handleSetsChange}
                  selectTextOnFocus
                  maxLength={2}
                  placeholderTextColor={Colors.content.tertiary}
                />
              </View>

              <Text className="text-[13px] font-inter-medium text-content-tertiary">×</Text>

              <View
                className="flex-row items-center bg-background-tertiary rounded-[10px] px-2.5 h-[34px] gap-1"
                style={{ borderCurve: 'continuous' }}
              >
                <Text className="text-[11px] font-inter-medium text-content-tertiary">Reps</Text>
                <TextInput
                  style={{
                    fontSize: 15,
                    fontFamily: 'Inter_600SemiBold',
                    color: Colors.content.primary,
                    width: 36,
                    textAlign: 'center',
                    padding: 0,
                    fontVariant: ['tabular-nums'],
                  }}
                  value={exercise.reps}
                  onChangeText={handleRepsChange}
                  selectTextOnFocus
                  placeholderTextColor={Colors.content.tertiary}
                />
              </View>
            </View>
          </View>

          {/* Exercise thumbnail — right side */}
          <View className="w-[88px] justify-center pr-3 py-3">
            {hasThumbnail ? (
              <View
                className="w-[76px] h-[88px] rounded-[12px] overflow-hidden"
                style={{ borderCurve: 'continuous' }}
              >
                <Image
                  source={{ uri: exercise.catalogExercise.thumbnailUrl ?? undefined }}
                  className="w-full h-full"
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </View>
            ) : (
              <View
                className="w-[76px] h-[88px] rounded-[12px] bg-background-tertiary items-center justify-center"
                style={{ borderCurve: 'continuous' }}
              >
                <Dumbbell size={24} color={Colors.content.tertiary} />
              </View>
            )}
          </View>
        </View>
      </SwipeableRow>
    </Animated.View>
  )
}
