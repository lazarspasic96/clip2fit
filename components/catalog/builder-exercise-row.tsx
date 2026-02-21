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
    <View style={{ marginBottom: 10 }}>
      <SwipeableRow
        actionWidth={DELETE_ACTION_WIDTH}
        actionContent={deleteActionContent}
        onAction={onDelete}
      >
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: Colors.background.secondary,
            borderRadius: 16,
            borderCurve: 'continuous',
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {/* Reorder grip + index badge */}
          <View
            style={{
              width: 36,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Pressable
              onPress={onMoveUp}
              disabled={isFirst}
              hitSlop={6}
              style={{ opacity: isFirst ? 0.2 : 0.5 }}
            >
              <GripVertical size={14} color={Colors.content.tertiary} pointerEvents="none" />
            </Pressable>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: Colors.brand.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
          <View style={{ flex: 1, paddingVertical: 14, paddingRight: 12, gap: 8 }}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Inter_600SemiBold',
                color: Colors.content.primary,
              }}
              numberOfLines={2}
            >
              {exercise.catalogExercise.name}
            </Text>

            {muscleGroups.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {muscleGroups.map((muscle) => (
                  <View
                    key={muscle}
                    style={{
                      backgroundColor: 'rgba(132,204,22,0.1)',
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderCurve: 'continuous',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Inter_500Medium',
                        color: Colors.brand.accent,
                        letterSpacing: 0.2,
                      }}
                    >
                      {MUSCLE_GROUP_LABELS[muscle] ?? muscle}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Sets x Reps inline */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.background.tertiary,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  paddingHorizontal: 10,
                  height: 34,
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'Inter_500Medium',
                    color: Colors.content.tertiary,
                  }}
                >
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

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter_500Medium',
                  color: Colors.content.tertiary,
                }}
              >
                ×
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.background.tertiary,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  paddingHorizontal: 10,
                  height: 34,
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'Inter_500Medium',
                    color: Colors.content.tertiary,
                  }}
                >
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
