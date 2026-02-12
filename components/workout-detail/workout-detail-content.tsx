import { useLocalSearchParams, useRouter } from 'expo-router'
import { Clock, Dumbbell, ExternalLink, Flame } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PlatformBadge } from '@/components/processing/platform-badge'
import { Button } from '@/components/ui/button'
import { DetailExerciseRow } from '@/components/workout-detail/detail-exercise-row'
import { DetailHeader } from '@/components/workout-detail/detail-header'
import { EditExerciseSheet } from '@/components/workout-detail/edit-exercise-sheet'
import { Colors } from '@/constants/colors'
import { useUpdateWorkoutMutation, useWorkoutQuery } from '@/hooks/use-api'
import type { ApiExercise } from '@/types/api'

export const WorkoutDetailContent = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { workout, rawWorkout, isLoading, error } = useWorkoutQuery(id ?? null)
  const updateMutation = useUpdateWorkoutMutation()

  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error !== null || workout === null || rawWorkout === null) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-base font-inter text-content-secondary text-center">{error ?? 'Workout not found'}</Text>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)')} className="mt-4">
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

  const handleDeleteExercise = (index: number) => {
    const exercise = exercises[index]
    if (exercise === undefined) return

    Alert.alert('Delete exercise?', `Remove "${exercise.name}" from this workout?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = exercises
            .filter((_, i) => i !== index)
            .map((ex, i) => ({ ...ex, order: i + 1 }))
          updateMutation.mutate(
            { id: workout.id, payload: { exercises: updated } },
            { onSuccess: navigateToForkIfNeeded },
          )
        },
      },
    ])
  }

  const handleUpdateExercise = (updated: ApiExercise) => {
    const updatedList = exercises.map((ex) => (ex.id === updated.id ? updated : ex))
    updateMutation.mutate(
      { id: workout.id, payload: { exercises: updatedList } },
      { onSuccess: navigateToForkIfNeeded },
    )
  }

  const handleStartWorkout = () => {
    router.push(`/(protected)/active-workout?id=${workout.id}`)
  }

  const handleOpenSource = () => {
    if (workout.sourceUrl.length > 0) {
      Linking.openURL(workout.sourceUrl)
    }
  }

  const creatorDisplay = workout.creatorName !== null
    ? `${workout.creatorName} (${workout.creatorHandle})`
    : workout.creatorHandle

  const difficultyColor =
    workout.difficulty === 'beginner'
      ? 'text-green-400'
      : workout.difficulty === 'intermediate'
        ? 'text-yellow-400'
        : 'text-red-400'

  const selectedExercise = selectedExerciseIndex !== null ? exercises[selectedExerciseIndex] ?? null : null

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <DetailHeader onBack={() => router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)')} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View className="px-6 pb-4">
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
                <Text className="text-sm font-inter text-content-secondary">{workout.estimatedDurationMinutes} min</Text>
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
                <View key={muscle} className="bg-background-tertiary rounded-full px-3 py-1">
                  <Text className="text-xs font-inter text-content-secondary">{muscle}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Exercises */}
        <Text className="text-base font-inter-semibold text-content-primary px-6 mb-3">Exercises</Text>
        {exercises.map((exercise, index) => (
          <DetailExerciseRow
            key={exercise.id}
            exercise={exercise}
            onEdit={() => setSelectedExerciseIndex(index)}
            onDelete={() => handleDeleteExercise(index)}
          />
        ))}
      </ScrollView>

      {/* Sticky footer */}
      <View className="px-6 pt-4 border-t border-border-primary" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Button onPress={handleStartWorkout}>Start Workout</Button>
      </View>

      <EditExerciseSheet
        exercise={selectedExercise}
        visible={selectedExerciseIndex !== null}
        onDismiss={() => setSelectedExerciseIndex(null)}
        onUpdate={handleUpdateExercise}
        topInset={insets.top + 16}
      />
    </View>
  )
}
