import { useState, useSyncExternalStore } from 'react'
import { Alert, Keyboard, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { ChevronLeft, Plus } from 'lucide-react-native'

import { Colors } from '@/constants/colors'
import { Input } from '@/components/ui/input'
import { BuilderExerciseRow } from '@/components/catalog/builder-exercise-row'
import { BuilderActions } from '@/components/catalog/builder-actions'
import { useWorkoutBuilder } from '@/contexts/workout-builder-context'
import type { ManualWorkoutPayload } from '@/types/catalog'

const WorkoutBuilderScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const builder = useWorkoutBuilder()

  // Subscribe to builder state changes via useSyncExternalStore
  useSyncExternalStore(builder.subscribe, builder.getSnapshot)

  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const exercises = builder.getOrderedExercises()

  const handleDelete = (id: string) => {
    builder.removeExercise(id)
  }

  const handleMoveUp = (fromIndex: number) => {
    if (fromIndex <= 0) return
    builder.reorderExercises(fromIndex, fromIndex - 1)
  }

  const handleMoveDown = (fromIndex: number) => {
    if (fromIndex >= exercises.length - 1) return
    builder.reorderExercises(fromIndex, fromIndex + 1)
  }

  const handleCreate = () => {
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise to create a workout.')
      return
    }

    setSaving(true)

    const payload: ManualWorkoutPayload = {
      title: title.trim() || 'My Workout',
      exercises: exercises.map((e, index) => ({
        catalogExerciseId: e.catalogExercise.id,
        name: e.catalogExercise.name,
        sets: e.sets,
        reps: e.reps,
        restBetweenSets: e.restSeconds !== null ? `${e.restSeconds}s` : null,
        order: index + 1,
        muscleGroups: e.catalogExercise.primaryMuscleGroups,
        isBodyweight: e.catalogExercise.isBodyweight,
      })),
    }

    // TODO: Replace with actual API call
    setSaving(false)
    Alert.alert(
      'Workout Created',
      `"${payload.title}" with ${payload.exercises.length} exercises`,
      [
        {
          text: 'OK',
          onPress: () => {
            builder.clearAll()
            router.replace('/(protected)/(tabs)/(home)' as never)
          },
        },
      ],
    )
  }

  const handleAddMore = () => {
    Keyboard.dismiss()
    router.back()
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 bg-background-secondary rounded-full items-center justify-center"
        >
          <ChevronLeft size={20} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
        <Text className="text-lg font-inter-semibold text-content-primary ml-3">
          Build Workout
        </Text>
      </View>

      {/* Scrollable content */}
      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={Keyboard.dismiss}>
          {/* Title input */}
          <View className="mx-5 mt-4">
            <Text className="text-sm font-inter-semibold text-content-secondary mb-2">Title</Text>
            <Input
              placeholder="e.g. Push Day, Full Body..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Exercise count header */}
          <Text className="text-base font-inter-semibold text-content-primary px-5 mt-6 mb-3">
            Exercises ({exercises.length})
          </Text>

          {/* Exercise list or empty state */}
          {exercises.length === 0 ? (
            <EmptyState onAddPress={handleAddMore} />
          ) : (
            exercises.map((exercise, index) => (
              <BuilderExerciseRow
                key={exercise.catalogExercise.id}
                exercise={exercise}
                index={index}
                onUpdate={(updates) => builder.updateExercise(exercise.catalogExercise.id, updates)}
                onDelete={() => handleDelete(exercise.catalogExercise.id)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === exercises.length - 1}
              />
            ))
          )}

          {/* Add more button (only when exercises exist) */}
          {exercises.length > 0 && (
            <Pressable
              onPress={handleAddMore}
              className="mx-5 mt-4 mb-2 py-3 rounded-xl border border-dashed border-border-secondary items-center flex-row justify-center gap-2"
            >
              <Plus size={16} color={Colors.content.secondary} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-content-secondary">
                Add More Exercises
              </Text>
            </Pressable>
          )}
        </Pressable>
      </KeyboardAwareScrollView>

      {/* Bottom action bar */}
      <BuilderActions
        onSave={handleCreate}
        exerciseCount={exercises.length}
        saving={saving}
      />
    </View>
  )
}

// Extracted to keep the screen under 350 lines
const EmptyState = ({ onAddPress }: { onAddPress: () => void }) => (
  <View className="items-center justify-center py-16 px-5">
    <Text className="text-base font-inter text-content-tertiary text-center">
      No exercises selected yet.
    </Text>
    <Text className="text-sm font-inter text-content-tertiary text-center mt-1 mb-4">
      Go back to the catalog to pick exercises.
    </Text>
    <Pressable
      onPress={onAddPress}
      className="flex-row items-center gap-2 bg-background-secondary rounded-xl px-5 py-3"
    >
      <Plus size={16} color={Colors.content.primary} pointerEvents="none" />
      <Text className="text-sm font-inter-semibold text-content-primary">Browse Catalog</Text>
    </Pressable>
  </View>
)

export default WorkoutBuilderScreen
