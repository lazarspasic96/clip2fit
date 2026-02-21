import { Image } from 'expo-image'
import { Dumbbell, GripVertical, Trash2 } from 'lucide-react-native'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import type { SelectedExercise } from '@/types/catalog'
import { MUSCLE_GROUP_LABELS } from '@/types/catalog'

interface BuilderExerciseRowProps {
  exercise: SelectedExercise
  index: number
  onUpdate: (updates: Partial<Pick<SelectedExercise, 'sets' | 'reps'>>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

const DELETE_ACTION_WIDTH = 70
const IMAGE_SIZE = 88

const deleteActionContent = (
  <View
    className="bg-red-500/20 rounded-xl items-center justify-center"
    style={{ width: DELETE_ACTION_WIDTH, height: '100%' }}
  >
    <Trash2 size={20} color="#f87171" pointerEvents="none" />
  </View>
)

export const BuilderExerciseRow = ({
  exercise,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
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

  const hasImage = exercise.catalogExercise.images !== null
  const muscleGroups = exercise.catalogExercise.primaryMuscleGroups.slice(0, 2)

  return (
    <View className="mb-2.5">
      <SwipeableRow
        actionWidth={DELETE_ACTION_WIDTH}
        actionContent={deleteActionContent}
        onAction={onDelete}
      >
        <View
          className="mx-5 bg-background-secondary rounded-2xl flex-row overflow-hidden"
          style={{ borderCurve: 'continuous' }}
        >
          {/* Reorder grip + index badge */}
          <View className="w-9 items-center justify-center gap-1.5">
            <Pressable
              onPress={onMoveUp}
              disabled={isFirst}
              hitSlop={6}
              style={{ opacity: isFirst ? 0.2 : 0.5 }}
            >
              <GripVertical size={14} color={Colors.content.tertiary} pointerEvents="none" />
            </Pressable>
            <View className="w-[22px] h-[22px] rounded-full bg-brand-accent items-center justify-center">
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: 'Inter_700Bold',
                  color: Colors.background.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {index + 1}
              </Text>
            </View>
            <Pressable
              onPress={onMoveDown}
              disabled={isLast}
              hitSlop={6}
              style={{ opacity: isLast ? 0.2 : 0.5 }}
            >
              <GripVertical size={14} color={Colors.content.tertiary} pointerEvents="none" />
            </Pressable>
          </View>

          {/* Content: name, muscles, sets/reps */}
          <View className="flex-1 py-3.5 pr-3 gap-2">
            <Text
              className="text-[15px] font-inter-semibold text-content-primary"
              numberOfLines={2}
            >
              {exercise.catalogExercise.name}
            </Text>

            {muscleGroups.length > 0 && (
              <View className="flex-row gap-1">
                {muscleGroups.map((muscle) => (
                  <View
                    key={muscle}
                    className="bg-brand-accent/10 rounded-md px-[7px] py-0.5"
                    style={{ borderCurve: 'continuous' }}
                  >
                    <Text className="text-[10px] font-inter-medium text-brand-accent tracking-wide">
                      {MUSCLE_GROUP_LABELS[muscle] ?? muscle}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Sets x Reps inline */}
            <View className="flex-row items-center gap-1.5">
              <View
                className="flex-row items-center bg-background-tertiary rounded-[10px] px-2.5 h-[34px] gap-1"
                style={{ borderCurve: 'continuous' }}
              >
                <Text className="text-[11px] font-inter-medium text-content-tertiary">
                  Sets
                </Text>
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

              <Text className="text-[13px] font-inter-medium text-content-tertiary">
                ×
              </Text>

              <View
                className="flex-row items-center bg-background-tertiary rounded-[10px] px-2.5 h-[34px] gap-1"
                style={{ borderCurve: 'continuous' }}
              >
                <Text className="text-[11px] font-inter-medium text-content-tertiary">
                  Reps
                </Text>
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

          {/* Exercise image — right side */}
          <View style={{ width: IMAGE_SIZE, justifyContent: 'center', paddingRight: 12, paddingVertical: 12 }}>
            {hasImage ? (
              <Image
                source={{ uri: exercise.catalogExercise.images?.start }}
                style={{
                  width: IMAGE_SIZE - 12,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View
                style={{
                  width: IMAGE_SIZE - 12,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  backgroundColor: Colors.background.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Dumbbell size={24} color={Colors.content.tertiary} />
              </View>
            )}
          </View>
        </View>
      </SwipeableRow>
    </View>
  )
}
