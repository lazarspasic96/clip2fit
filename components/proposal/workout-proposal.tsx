import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { ConfirmationSheet } from '@/components/ui/confirmation-sheet'
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
  const [showDiscardModal, setShowDiscardModal] = useState(false)

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
    updateMutation.mutate(
      { id: workoutId, payload: { exercises: editableExercises } },
      { onSuccess: onSaved },
    )
  }

  const handleDiscardPress = () => {
    if (isDirty) {
      setShowDiscardModal(true)
    } else {
      onDiscard()
    }
  }

  const saveError = updateMutation.error !== null
    ? (updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to save')
    : null

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <ProposalHeader workout={workout} exerciseCount={editableExercises.length} />

        <Text className="text-base font-inter-semibold text-content-primary px-6 mb-3">Exercises</Text>

        {editableExercises.map((exercise, index) => (
          <ProposalExerciseRow
            key={exercise.id}
            exercise={exercise}
            index={index}
            onUpdate={(updated) => handleUpdateExercise(index, updated)}
            onDelete={() => handleDeleteExercise(index)}
          />
        ))}

        {editableExercises.length === 0 && (
          <View className="items-center py-8 mx-6">
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

      <ConfirmationSheet
        visible={showDiscardModal}
        title={mode === 'edit' ? 'Discard changes?' : 'Discard edits?'}
        description={mode === 'edit' ? 'Your changes will not be saved.' : 'The original workout will still be in your library.'}
        confirmLabel="Discard"
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={() => {
          setShowDiscardModal(false)
          onDiscard()
        }}
      />
    </View>
  )
}
