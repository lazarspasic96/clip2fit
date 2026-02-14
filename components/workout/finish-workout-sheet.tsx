import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { WorkoutSession } from '@/types/workout'

interface FinishWorkoutSheetProps {
  visible: boolean
  session: WorkoutSession
  onDismiss: () => void
  onConfirm: () => void
  loading: boolean
  error: string | null
}

export const FinishWorkoutSheet = ({
  visible,
  session,
  onDismiss,
  onConfirm,
  loading,
  error,
}: FinishWorkoutSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const exercises = session.plan.exercises
  const completed = exercises.filter((e) => e.status === 'completed').length
  const skipped = exercises.filter((e) => e.status === 'skipped').length
  const pending = exercises.filter((e) => e.status === 'pending' || e.status === 'active').length

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}>
        <Text className="text-lg font-inter-bold text-content-primary text-center">Finish Workout?</Text>

        <View className="mt-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-sm font-inter text-content-secondary">Completed</Text>
            <Text className="text-sm font-inter-semibold text-brand-accent">{completed}</Text>
          </View>
          {skipped > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-sm font-inter text-content-secondary">Skipped</Text>
              <Text className="text-sm font-inter-semibold text-content-tertiary">{skipped}</Text>
            </View>
          )}
          {pending > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-sm font-inter text-content-secondary">Pending</Text>
              <Text className="text-sm font-inter-semibold text-yellow-400">{pending}</Text>
            </View>
          )}
        </View>

        {pending > 0 && (
          <Text className="text-xs font-inter text-yellow-400 text-center mt-3">
            {pending} exercise{pending > 1 ? 's' : ''} still pending
          </Text>
        )}

        {error !== null && (
          <Text className="text-sm font-inter text-red-400 text-center mt-2">{error}</Text>
        )}

        <View className="flex-row gap-3 mt-6">
          <Pressable onPress={onDismiss} disabled={loading} className="flex-1 rounded-md py-2.5 bg-background-tertiary">
            <Text className="text-sm font-inter-semibold text-content-primary text-center">Keep Going</Text>
          </Pressable>
          <Pressable onPress={onConfirm} disabled={loading} className="flex-1 rounded-md py-2.5 bg-brand-accent">
            {loading ? (
              <ActivityIndicator size="small" color={Colors.background.primary} />
            ) : (
              <Text className="text-sm font-inter-semibold text-background-primary text-center">Finish Workout</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
