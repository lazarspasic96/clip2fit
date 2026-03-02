import { useLocalSearchParams, useRouter } from 'expo-router'
import { Clock, Dumbbell, ExternalLink, Flame, Plus } from 'lucide-react-native'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PlatformBadge } from '@/components/processing/platform-badge'
import { MuscleChip } from '@/components/ui/muscle-chip'
import { DetailExerciseRow } from '@/components/workout-detail/detail-exercise-row'
import { DetailHeader } from '@/components/workout-detail/detail-header'
import { Colors } from '@/constants/colors'
import { useUpdateWorkoutMutation, useWorkoutQuery } from '@/hooks/use-api'
import { useDraggableList } from '@/hooks/use-draggable-list'
import { exercisePickerStore } from '@/stores/exercise-picker-store'
import { mapCatalogToApiExercise } from '@/utils/exercise-mapper'

const ITEM_HEIGHT = 100

export const WorkoutDetailContent = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { workout, rawWorkout, isLoading, error } = useWorkoutQuery(id ?? null)
  const updateMutation = useUpdateWorkoutMutation()

  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const reorderRef = useRef<(from: number, to: number) => void>(() => {})
  const { createGesture, dragState } = useDraggableList({
    itemCount: rawWorkout?.exercises.length ?? 0,
    itemHeight: ITEM_HEIGHT,
    onReorder: (from, to) => reorderRef.current(from, to),
  })

  // Subscribe to picker store for adding exercises
  const pickerVersion = useSyncExternalStore(
    exercisePickerStore.subscribe,
    exercisePickerStore.getSnapshot,
  )
  const lastPickerVersion = useRef(pickerVersion)

  useEffect(() => {
    if (pickerVersion === lastPickerVersion.current) return
    lastPickerVersion.current = pickerVersion

    const selected = exercisePickerStore.consume()
    if (selected.length === 0 || rawWorkout === null || workout === null) return

    const startOrder = rawWorkout.exercises.length + 1
    const mapped = selected.map((c, i) => mapCatalogToApiExercise(c, startOrder + i))
    const updated = [...rawWorkout.exercises, ...mapped]

    const workoutId = workout.id
    updateMutation.mutate(
      { id: workoutId, payload: { exercises: updated } },
      {
        onSuccess: (data: { id: string }) => {
          if (data.id !== workoutId) {
            router.replace(`/(protected)/workout-detail?id=${data.id}`)
          }
        },
      },
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to picker version changes
  }, [pickerVersion])

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

  const existingCatalogIds = exercises
    .map((e) => e.catalogExerciseId)
    .filter((cid): cid is string => cid !== null)
    .join(',')

  const handleAddExercises = () => {
    router.push({
      pathname: '/(protected)/sheets/exercise-picker',
      params: existingCatalogIds.length > 0 ? { existingIds: existingCatalogIds } : undefined,
    })
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
