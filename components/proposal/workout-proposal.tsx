import { useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { ProposalActions } from '@/components/proposal/proposal-actions'
import { ProposalExerciseRow } from '@/components/proposal/proposal-exercise-row'
import { ProposalHeader } from '@/components/proposal/proposal-header'
import { useUpdateWorkoutMutation, useWorkoutQuery } from '@/hooks/use-api'
import type { ApiExercise } from '@/types/api'

interface WorkoutProposalProps {
  workoutId: string
  mode?: 'proposal' | 'edit'
  onSaved: () => void
  onDiscard: () => void
}

export const WorkoutProposal = ({ workoutId, mode = 'proposal', onSaved, onDiscard }: WorkoutProposalProps) => {
  const { workout, rawWorkout, isLoading } = useWorkoutQuery(workoutId)
  const updateMutation = useUpdateWorkoutMutation()

  const [editableExercises, setEditableExercises] = useState<ApiExercise[] | null>(null)

  // Initialize editable state from raw workout data (once)
  if (rawWorkout !== null && editableExercises === null) {
    setEditableExercises(rawWorkout.exercises.map((e) => ({ ...e })))
  }

  if (isLoading || workout === null || editableExercises === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const isDirty = JSON.stringify(editableExercises) !== JSON.stringify(rawWorkout?.exercises)

  const handleUpdateExercise = (index: number, updated: ApiExercise) => {
    setEditableExercises((prev) => {
      if (prev === null) return prev
      const next = [...prev]
      next[index] = updated
      return next
    })
  }

  const handleDeleteExercise = (index: number) => {
    setEditableExercises((prev) => {
      if (prev === null) return prev
      const next = prev.filter((_, i) => i !== index)
      return next.map((e, i) => ({ ...e, order: i + 1 }))
    })
  }

  const handleSave = () => {
    updateMutation.mutate({ id: workoutId, payload: { exercises: editableExercises } }, { onSuccess: onSaved })
  }

  const handleDiscardPress = () => {
    if (isDirty) {
      const title = mode === 'edit' ? 'Discard changes?' : 'Discard edits?'
      const description =
        mode === 'edit' ? 'Your changes will not be saved.' : 'The original workout will still be in your library.'
      Alert.alert(title, description, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onDiscard },
      ])
    } else {
      onDiscard()
    }
  }

  const saveError =
    updateMutation.error !== null
      ? updateMutation.error instanceof Error
        ? updateMutation.error.message
        : 'Failed to save'
      : null

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <ProposalHeader workout={workout} exerciseCount={editableExercises.length} />

        <Text className="text-base font-inter-semibold text-content-primary ml-1 mb-3">Exercises</Text>

        <View className="gap-3">
          {editableExercises.map((exercise, index) => (
            <ProposalExerciseRow
              key={exercise.id}
              exercise={exercise}
              index={index}
              onUpdate={(updated) => handleUpdateExercise(index, updated)}
              onDelete={() => handleDeleteExercise(index)}
            />
          ))}
        </View>

        {editableExercises.length === 0 && (
          <View className="items-center py-8 mx-5">
            <Text className="text-sm font-inter text-content-tertiary">No exercises remaining</Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      <ProposalActions
        onSave={handleSave}
        onDiscard={handleDiscardPress}
        saving={updateMutation.isPending}
        saveError={saveError}
        exerciseCount={editableExercises.length}
        mode={mode}
      />
    </View>
  )
}
