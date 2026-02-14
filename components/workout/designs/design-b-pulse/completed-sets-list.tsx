import * as Haptics from 'expo-haptics'
import { Check, Pencil } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { StepperButton } from '@/components/workout/shared/stepper-button'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import type { WorkoutExercise } from '@/types/workout'

const WEIGHT_STEP = 2.5
const REPS_STEP = 1

interface CompletedSetsListProps {
  exercise: WorkoutExercise
}

export const CompletedSetsList = ({ exercise }: CompletedSetsListProps) => {
  const { editSet } = useActiveWorkout()
  const [editingSetId, setEditingSetId] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState(0)
  const [editReps, setEditReps] = useState(0)

  const startEdit = (setId: string, weight: number, reps: number) => {
    setEditingSetId(setId)
    setEditWeight(weight)
    setEditReps(reps)
  }

  const saveEdit = () => {
    if (editingSetId === null) return
    const isBodyweight = exercise.isBodyweight
    editSet(exercise.id, editingSetId, editReps, isBodyweight ? null : editWeight)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setEditingSetId(null)
  }

  const cancelEdit = () => setEditingSetId(null)

  return (
    <View className="gap-2">
      {exercise.sets.map((s) => {
        const isEditing = editingSetId === s.id
        const weightLabel = exercise.isBodyweight ? 'BW' : `${s.actualWeight ?? 0}kg`
        const repsLabel = `${s.actualReps ?? 0} reps`

        if (isEditing) {
          return (
            <View key={s.id} className="rounded-xl bg-background-tertiary p-4 gap-3">
              <Text className="text-xs font-inter-semibold text-content-secondary text-center">
                Set {s.setNumber}
              </Text>

              {!exercise.isBodyweight && (
                <View className="flex-row items-center justify-between">
                  <StepperButton type="decrement" onPress={() => setEditWeight((w) => Math.max(0, w - WEIGHT_STEP))} />
                  <Text className="text-lg font-inter-bold text-content-primary">{editWeight} kg</Text>
                  <StepperButton type="increment" onPress={() => setEditWeight((w) => w + WEIGHT_STEP)} />
                </View>
              )}

              <View className="flex-row items-center justify-between">
                <StepperButton type="decrement" onPress={() => setEditReps((r) => Math.max(1, r - REPS_STEP))} />
                <Text className="text-lg font-inter-bold text-content-primary">{editReps} reps</Text>
                <StepperButton type="increment" onPress={() => setEditReps((r) => r + REPS_STEP)} />
              </View>

              <View className="flex-row gap-3">
                <Pressable onPress={cancelEdit} className="flex-1 rounded-lg py-2.5 bg-background-secondary items-center">
                  <Text className="text-sm font-inter-semibold text-content-secondary">Cancel</Text>
                </Pressable>
                <Pressable onPress={saveEdit} className="flex-1 rounded-lg py-2.5 bg-brand-accent items-center">
                  <Text className="text-sm font-inter-bold text-background-primary">Save</Text>
                </Pressable>
              </View>
            </View>
          )
        }

        return (
          <Pressable
            key={s.id}
            onPress={() => startEdit(s.id, s.actualWeight ?? 0, s.actualReps ?? 0)}
            className="flex-row items-center justify-between rounded-xl bg-background-tertiary px-4 py-3"
          >
            <View className="flex-row items-center gap-2">
              <Check size={14} color={Colors.brand.accent} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-content-primary">
                Set {s.setNumber}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-inter text-content-secondary">
                {weightLabel} x {repsLabel}
              </Text>
              <Pencil size={14} color={Colors.content.tertiary} pointerEvents="none" />
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
