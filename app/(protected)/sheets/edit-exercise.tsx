import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { MuscleChip } from '@/components/ui/muscle-chip'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useUpdateWorkoutMutation, useWorkoutQuery } from '@/hooks/use-api'

const EditExerciseScreen = () => {
  const router = useRouter()
  const { workoutId, exerciseIndex: indexParam } = useLocalSearchParams<{
    workoutId: string
    exerciseIndex: string
  }>()

  const exerciseIndex = Number(indexParam)
  const { rawWorkout, isLoading } = useWorkoutQuery(workoutId ?? null)
  const updateMutation = useUpdateWorkoutMutation()

  const exercise = rawWorkout?.exercises[exerciseIndex] ?? null

  const [sets, setSets] = useState(() => (exercise !== null ? String(exercise.sets) : ''))
  const [reps, setReps] = useState(() => exercise?.reps ?? '')
  const [notes, setNotes] = useState(() => exercise?.notes ?? '')

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (exercise === null || rawWorkout === null) return null

  const handleDone = () => {
    const parsedSets = parseInt(sets, 10)
    const updatedExercise = {
      ...exercise,
      sets: isNaN(parsedSets) || parsedSets < 1 ? exercise.sets : parsedSets,
      reps: reps.length > 0 ? reps : exercise.reps,
      notes: notes.length > 0 ? notes : null,
    }

    const updatedList = rawWorkout.exercises.map((ex, i) => (i === exerciseIndex ? updatedExercise : ex))

    updateMutation.mutate(
      { id: workoutId!, payload: { exercises: updatedList } },
      {
        onSuccess: (data) => {
          if (data.id !== workoutId) {
            router.dismiss()
            router.replace(`/(protected)/workout-detail?id=${data.id}`)
          } else {
            router.back()
          }
        },
      },
    )
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <SheetTitle>{exercise.name}</SheetTitle>

      {exercise.muscleGroups.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mb-4">
          {exercise.muscleGroups.map((muscle) => (
            <MuscleChip key={muscle} muscle={muscle} size="xs" tone="soft" />
          ))}
        </View>
      )}

      <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Sets</Text>
      <TextInput
        value={sets}
        onChangeText={setSets}
        keyboardType="number-pad"
        style={[inputStyle, { marginBottom: 16 }]}
        placeholderTextColor={Colors.content.tertiary}
      />

      <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Reps</Text>
      <TextInput
        value={reps}
        onChangeText={setReps}
        style={[inputStyle, { marginBottom: 16 }]}
        placeholder="e.g. 8-10, AMRAP"
        placeholderTextColor={Colors.content.tertiary}
      />

      <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        style={[inputStyle, { marginBottom: 24, minHeight: 80, textAlignVertical: 'top' }]}
        placeholder="Add notes..."
        placeholderTextColor={Colors.content.tertiary}
      />

      <Pressable
        onPress={handleDone}
        disabled={updateMutation.isPending}
        className="items-center justify-center rounded-md py-3.5 bg-background-button-primary"
      >
        <Text className="text-base font-inter-semibold text-content-button-primary">
          {updateMutation.isPending ? 'Saving...' : 'Done'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

const inputStyle = {
  backgroundColor: Colors.background.tertiary,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: Colors.content.primary,
}

export default EditExerciseScreen
