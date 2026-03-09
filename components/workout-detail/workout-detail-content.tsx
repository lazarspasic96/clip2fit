import { useLocalSearchParams, useRouter } from 'expo-router'
import { Clock, Dumbbell, ExternalLink, Flame, Plus } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PlatformBadge } from '@/components/processing/platform-badge'
import { MuscleChip } from '@/components/ui/muscle-chip'
import { DetailExerciseRow } from '@/components/workout-detail/detail-exercise-row'
import { DetailHeader } from '@/components/workout-detail/detail-header'
import { Colors } from '@/constants/colors'
import { useAddExercisesFlow } from '@/hooks/use-add-exercises-flow'
import { useUpdateWorkoutMutation, useWorkoutQuery } from '@/hooks/use-api'
import { useDraggableList } from '@/hooks/use-draggable-list'
import { mapCatalogToApiExercise } from '@/utils/exercise-mapper'

const ITEM_HEIGHT = 100
const HIGHLIGHT_DURATION_MS = 2600

export const WorkoutDetailContent = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { workout, rawWorkout, isLoading, error } = useWorkoutQuery(id ?? null)
  const updateMutation = useUpdateWorkoutMutation()
  const addExercisesFlow = useAddExercisesFlow()

  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [highlightCatalogExerciseIds, setHighlightCatalogExerciseIds] = useState<Set<string>>(new Set())
  const addRequestIdRef = useRef<string | null>(null)
  const scrollRef = useRef<ScrollView>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reorderRef = useRef<(from: number, to: number) => void>(() => {})
  const { createGesture, dragState } = useDraggableList({
    itemCount: rawWorkout?.exercises.length ?? 0,
    itemHeight: ITEM_HEIGHT,
    onReorder: (from, to) => reorderRef.current(from, to),
  })

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  const scrollToExercisesEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
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
      if (requestId === null || workout === null || rawWorkout === null) {
        return
      }

      const result = addExercisesFlow.consumeAddExercisesResult(requestId)
      addRequestIdRef.current = null
      if (result === null || result.caller !== 'workout-detail') return

      const existingIds = new Set(
        rawWorkout.exercises
          .map((exercise) => exercise.catalogExerciseId)
          .filter((catalogExerciseId): catalogExerciseId is string => catalogExerciseId !== null),
      )

      const freshSelections = result.selections.filter((selection) => !existingIds.has(selection.id))
      if (freshSelections.length === 0) return

      const startOrder = rawWorkout.exercises.length + 1
      const mapped = freshSelections.map((exercise, index) => mapCatalogToApiExercise(exercise, startOrder + index))
      const updated = [...rawWorkout.exercises, ...mapped]
      const workoutId = workout.id
      const addedCatalogIds = freshSelections.map((exercise) => exercise.id)

      updateMutation.mutate(
        { id: workoutId, payload: { exercises: updated } },
        {
          onSuccess: (data: { id: string }) => {
            markNewlyAdded(addedCatalogIds)
            scrollToExercisesEnd()

            if (data.id !== workoutId) {
              router.replace(`/(protected)/workout-detail?id=${data.id}`)
            }
          },
        },
      )
    }, [addExercisesFlow, markNewlyAdded, rawWorkout, router, scrollToExercisesEnd, updateMutation, workout]),
  )

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error !== null || workout === null || rawWorkout === null) {
    return (
      <View
        className="flex-1 bg-background-primary justify-center items-center px-5"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-base font-inter text-content-secondary text-center">{error ?? 'Workout not found'}</Text>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)' as never))}
          className="mt-4"
        >
          <Text className="text-base font-inter-semibold text-brand-accent">Go back</Text>
        </Pressable>
      </View>
    )
  }

  const exercises = rawWorkout.exercises

  const navigateToForkIfNeeded = (data: { id: string }) => {
    if (data.id !== workout.id) {
      router.replace(`/(protected)/workout-detail?id=${data.id}`)
    }
  }

  const handleAddExercises = () => {
    const existingIds = Array.from(new Set(
      exercises
        .map((e) => e.catalogExerciseId)
        .filter((cid): cid is string => cid !== null),
    ))

    const requestId = addExercisesFlow.openAddExercises({
      caller: 'workout-detail',
      existingCatalogExerciseIds: existingIds,
    })

    addRequestIdRef.current = requestId
    router.push(`/(protected)/add-exercises?requestId=${encodeURIComponent(requestId)}` as never)
  }

  reorderRef.current = (fromIndex: number, toIndex: number) => {
    const next = [...exercises]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    const reordered = next.map((ex, i) => ({ ...ex, order: i + 1 }))

    updateMutation.mutate(
      { id: workout.id, payload: { exercises: reordered } },
      { onSuccess: navigateToForkIfNeeded },
    )
  }

  const handleDeleteExercise = (index: number) => {
    const exercise = exercises[index]
    if (exercise === undefined) return

    Alert.alert('Delete exercise?', `Remove "${exercise.name}" from this workout?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i + 1 }))
          updateMutation.mutate(
            { id: workout.id, payload: { exercises: updated } },
            { onSuccess: navigateToForkIfNeeded },
          )
        },
      },
    ])
  }

  const handleOpenSource = () => {
    if (workout.sourceUrl !== null && workout.sourceUrl.length > 0) {
      Linking.openURL(workout.sourceUrl)
    }
  }

  const creatorDisplay =
    workout.creatorName !== null ? `${workout.creatorName} (${workout.creatorHandle})` : workout.creatorHandle

  const difficultyColor =
    workout.difficulty === 'beginner'
      ? 'text-green-400'
      : workout.difficulty === 'intermediate'
        ? 'text-yellow-400'
        : 'text-red-400'

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <DetailHeader
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)' as never))}
      />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View className="px-5 pb-4">
          <View className="flex-row items-center gap-3 mb-2">
            <PlatformBadge platform={workout.platform} size={36} />
            <View className="flex-1">
              {creatorDisplay.length > 0 && (
                <Text className="text-sm font-inter text-content-secondary">{creatorDisplay}</Text>
              )}
            </View>
          </View>

          {workout.sourceUrl.length > 0 && (
            <Pressable onPress={handleOpenSource} className="flex-row items-center gap-2 mb-3">
              <ExternalLink size={16} color={Colors.brand.accent} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-brand-accent">Watch Original Video</Text>
            </Pressable>
          )}

          <Text className="text-xl font-inter-bold text-content-primary mb-2">{workout.title}</Text>

          {workout.description.length > 0 && (
            <Pressable onPress={() => setDescriptionExpanded((prev) => !prev)}>
              <Text
                className="text-sm font-inter text-content-secondary mb-1"
                numberOfLines={descriptionExpanded ? undefined : 2}
              >
                {workout.description}
              </Text>
              {!descriptionExpanded && workout.description.length > 100 && (
                <Text className="text-sm font-inter-semibold text-brand-accent">Read more</Text>
              )}
            </Pressable>
          )}

          {/* Stats row */}
          <View className="flex-row items-center gap-4 mt-3">
            <View className="flex-row items-center gap-1.5">
              <Dumbbell size={14} color={Colors.content.secondary} pointerEvents="none" />
              <Text className="text-sm font-inter text-content-secondary">{exercises.length} exercises</Text>
            </View>
            {workout.estimatedDurationMinutes > 0 && (
              <View className="flex-row items-center gap-1.5">
                <Clock size={14} color={Colors.content.secondary} pointerEvents="none" />
                <Text className="text-sm font-inter text-content-secondary">
                  {workout.estimatedDurationMinutes} min
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1.5">
              <Flame size={14} color={Colors.content.secondary} pointerEvents="none" />
              <Text className={`text-sm font-inter-semibold ${difficultyColor}`}>{workout.difficulty}</Text>
            </View>
          </View>

          {/* Target muscle pills */}
          {workout.targetMuscles !== undefined && workout.targetMuscles.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {workout.targetMuscles.map((muscle) => (
                <MuscleChip key={muscle} muscle={muscle} size="sm" tone="soft" />
              ))}
            </View>
          )}
        </View>

        {/* Exercises */}
        <Text className="text-base font-inter-semibold text-content-primary px-5 mb-3">Exercises</Text>
        {exercises.map((exercise, index) => (
          <DetailExerciseRow
            key={exercise.id}
            exercise={exercise}
            index={index}
            onEdit={() => router.push({ pathname: '/(protected)/sheets/edit-exercise', params: { workoutId: id!, exerciseIndex: String(index) } })}
            onDelete={() => handleDeleteExercise(index)}
            dragGesture={createGesture(index)}
            dragState={dragState}
            itemHeight={ITEM_HEIGHT}
            isNewlyAdded={exercise.catalogExerciseId !== null && highlightCatalogExerciseIds.has(exercise.catalogExerciseId)}
          />
        ))}

        {/* Add exercises button */}
        <Pressable
          onPress={handleAddExercises}
          className="mx-5 mt-2 mb-4 rounded-2xl border border-dashed border-border-secondary py-4 flex-row items-center justify-center gap-2"
          style={{ borderCurve: 'continuous' }}
        >
          <Plus size={18} color={Colors.content.tertiary} pointerEvents="none" />
          <Text className="text-sm font-inter-semibold text-content-tertiary">Add Exercises</Text>
        </Pressable>
      </ScrollView>

    </View>
  )
}
