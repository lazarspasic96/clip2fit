import { Image } from 'expo-image'
import { Dumbbell, GripVertical, Trash2 } from 'lucide-react-native'
import { Pressable, Text, TextInput, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { MuscleChip } from '@/components/ui/muscle-chip'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'
import type { SelectedExercise } from '@/types/catalog'

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

  const hasThumbnail = exercise.catalogExercise.thumbnailUrl !== null
  const targetMuscle = exercise.catalogExercise.target
  const secondaryMuscles = exercise.catalogExercise.secondaryMuscles.slice(0, 1)

  return (
    <View className="mb-2.5">
      <SwipeableRow actionWidth={DELETE_ACTION_WIDTH} actionContent={deleteActionContent} onAction={onDelete}>
        <View className="mx-5 bg-background-secondary flex-row overflow-hidden">
          {/* Reorder grip + index badge */}
          <View className="w-9 items-center justify-center gap-1.5">
            <Pressable
              onPress={onMoveUp}
              disabled={isFirst}
              hitSlop={6}
              className={cn(isFirst ? 'opacity-20' : 'opacity-50')}
            >
              <GripVertical size={14} color={Colors.content.tertiary} pointerEvents="none" />
            </Pressable>
            <View className="w-[22px] h-[22px] rounded-full bg-brand-accent items-center justify-center">
              <Text
                className="text-[11px] font-inter-bold text-background-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {index + 1}
              </Text>
            </View>
            <Pressable
              onPress={onMoveDown}
              disabled={isLast}
              hitSlop={6}
              className={cn(isLast ? 'opacity-20' : 'opacity-50')}
            >
              <GripVertical size={14} color={Colors.content.tertiary} pointerEvents="none" />
            </Pressable>
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
    </View>
  )
}
