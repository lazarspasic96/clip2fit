import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { ApiExercise } from '@/types/api'

const screenHeight = Dimensions.get('window').height

interface EditExerciseSheetProps {
  exercise: ApiExercise | null
  visible: boolean
  onDismiss: () => void
  onUpdate: (updated: ApiExercise) => void
  topInset: number
}

export const EditExerciseSheet = ({ exercise, visible, onDismiss, onUpdate, topInset }: EditExerciseSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (visible && exercise !== null) {
      setSets(String(exercise.sets))
      setReps(exercise.reps)
      setNotes(exercise.notes ?? '')
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible, exercise])

  const handleDone = () => {
    if (exercise === null) return
    const parsedSets = parseInt(sets, 10)
    onUpdate({
      ...exercise,
      sets: isNaN(parsedSets) || parsedSets < 1 ? exercise.sets : parsedSets,
      reps: reps.length > 0 ? reps : exercise.reps,
      notes: notes.length > 0 ? notes : null,
    })
    onDismiss()
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      maxDynamicContentSize={screenHeight * 0.7}
      topInset={topInset}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {exercise !== null && (
          <>
            <Text className="text-lg font-inter-bold text-content-primary mb-1">
              {exercise.name}
            </Text>

            {exercise.muscleGroups.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mb-4">
                {exercise.muscleGroups.map((muscle) => (
                  <View key={muscle} className="bg-background-tertiary rounded-full px-2.5 py-0.5">
                    <Text className="text-xs font-inter text-content-secondary">{muscle}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Sets</Text>
            <BottomSheetTextInput
              value={sets}
              onChangeText={setSets}
              keyboardType="number-pad"
              style={{
                backgroundColor: Colors.background.tertiary,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: Colors.content.primary,
                marginBottom: 16,
              }}
              placeholderTextColor={Colors.content.tertiary}
            />

            <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Reps</Text>
            <BottomSheetTextInput
              value={reps}
              onChangeText={setReps}
              style={{
                backgroundColor: Colors.background.tertiary,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: Colors.content.primary,
                marginBottom: 16,
              }}
              placeholder="e.g. 8-10, AMRAP"
              placeholderTextColor={Colors.content.tertiary}
            />

            <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Notes</Text>
            <BottomSheetTextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{
                backgroundColor: Colors.background.tertiary,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: Colors.content.primary,
                marginBottom: 24,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Add notes..."
              placeholderTextColor={Colors.content.tertiary}
            />

            <Pressable
              onPress={handleDone}
              className="items-center justify-center rounded-md py-3.5 bg-background-button-primary"
            >
              <Text className="text-base font-inter-semibold text-content-button-primary">Done</Text>
            </Pressable>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
