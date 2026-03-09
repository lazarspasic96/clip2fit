import { useRouter } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { ProposalActions } from '@/components/proposal/proposal-actions'
import { ProposalExerciseRow } from '@/components/proposal/proposal-exercise-row'
import { ProposalHeader } from '@/components/proposal/proposal-header'
import { Colors } from '@/constants/colors'
import { useAddExercisesFlow } from '@/hooks/use-add-exercises-flow'
import { useUpdateWorkoutMutation, useWorkoutQuery } from '@/hooks/use-api'
import { useDraggableList } from '@/hooks/use-draggable-list'
import type { ApiExercise } from '@/types/api'
import { mapCatalogToApiExercise } from '@/utils/exercise-mapper'

const ITEM_HEIGHT = 140
const HIGHLIGHT_DURATION_MS = 2600

interface WorkoutProposalProps {
  workoutId: string
  mode?: 'proposal' | 'edit'
  onSaved: () => void
  onDiscard: () => void
}

export const WorkoutProposal = ({ workoutId, mode = 'proposal', onSaved, onDiscard }: WorkoutProposalProps) => {
  const router = useRouter()
  const { workout, rawWorkout, isLoading } = useWorkoutQuery(workoutId)
  const updateMutation = useUpdateWorkoutMutation()
  const addExercisesFlow = useAddExercisesFlow()

  const [editableExercises, setEditableExercises] = useState<ApiExercise[] | null>(null)
  const [highlightCatalogExerciseIds, setHighlightCatalogExerciseIds] = useState<Set<string>>(new Set())
  const addRequestIdRef = useRef<string | null>(null)
  const scrollRef = useRef<any>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setEditableExercises((prev) => {
      if (prev === null) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next.map((e, i) => ({ ...e, order: i + 1 }))
    })
  }

  const { createGesture, dragState } = useDraggableList({
    itemCount: editableExercises?.length ?? 0,
    itemHeight: ITEM_HEIGHT,
    onReorder: handleReorder,
  })

  useEffect(() => {
    if (rawWorkout !== null && editableExercises === null) {
      setEditableExercises(rawWorkout.exercises.map((exercise) => ({ ...exercise })))
    }
  }, [editableExercises, rawWorkout])

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  const scrollToExercisesEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true })
    })
  }, [])

  const markNewlyAdded = useCallback((catalogExerciseIds: string[]) => {
    if (highlightTimeoutRef.current !== null) {
      clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = null
    }

    setHighlightCatalogExerciseIds(new Set(catalogExerciseIds))
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightCatalogExerciseIds(new Set())
      highlightTimeoutRef.current = null
    }, HIGHLIGHT_DURATION_MS)
  }, [])

  useFocusEffect(
    useCallback(() => {
      const requestId = addRequestIdRef.current
      if (requestId === null) return

      const result = addExercisesFlow.consumeAddExercisesResult(requestId)
      addRequestIdRef.current = null
      if (result === null || result.caller !== 'workout-proposal') return

      const baseExercises = editableExercises ?? rawWorkout?.exercises ?? []
      const existingIds = new Set(
        baseExercises
          .map((exercise) => exercise.catalogExerciseId)
          .filter((catalogExerciseId): catalogExerciseId is string => catalogExerciseId !== null),
      )
      const freshSelections = result.selections.filter((selection) => !existingIds.has(selection.id))
      if (freshSelections.length === 0) return

      const startOrder = baseExercises.length + 1
      const mapped = freshSelections.map((exercise, index) => mapCatalogToApiExercise(exercise, startOrder + index))
      const nextExercises = [...baseExercises, ...mapped]

      setEditableExercises(nextExercises)
      markNewlyAdded(freshSelections.map((exercise) => exercise.id))
      scrollToExercisesEnd()
    }, [addExercisesFlow, editableExercises, markNewlyAdded, rawWorkout?.exercises, scrollToExercisesEnd]),
  )

  if (isLoading || workout === null || editableExercises === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const isDirty = JSON.stringify(editableExercises) !== JSON.stringify(rawWorkout?.exercises)

  const handleAddExercises = () => {
    const existingIds = Array.from(new Set(
      editableExercises
        .map((e) => e.catalogExerciseId)
        .filter((cid): cid is string => cid !== null),
    ))

    const requestId = addExercisesFlow.openAddExercises({
      caller: 'workout-proposal',
      existingCatalogExerciseIds: existingIds,
    })

    addRequestIdRef.current = requestId
    router.push(`/(protected)/add-exercises?requestId=${encodeURIComponent(requestId)}` as never)
  }

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
        ref={scrollRef}
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
              dragGesture={createGesture(index)}
              dragState={dragState}
              itemHeight={ITEM_HEIGHT}
              isNewlyAdded={
                exercise.catalogExerciseId !== null && highlightCatalogExerciseIds.has(exercise.catalogExerciseId)
              }
            />
          ))}
        </View>

        {editableExercises.length === 0 && (
          <View className="items-center py-8 mx-5">
            <Text className="text-sm font-inter text-content-tertiary">No exercises remaining</Text>
          </View>
        )}

        {/* Add exercises button */}
        <Pressable
          onPress={handleAddExercises}
          className="mt-4 rounded-2xl border border-dashed border-border-secondary py-4 flex-row items-center justify-center gap-2"
          style={{ borderCurve: 'continuous' }}
        >
          <Plus size={18} color={Colors.content.tertiary} pointerEvents="none" />
          <Text className="text-sm font-inter-semibold text-content-tertiary">Add Exercises</Text>
        </Pressable>
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
