import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CommandCenterWorkout } from '@/components/workout/command-center/command-center-workout'
import { ConfirmationSheet } from '@/components/ui/confirmation-sheet'
import { FinishWorkoutOverlay } from '@/components/workout/finish-workout-overlay'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useWorkoutQuery } from '@/hooks/use-api'
import { MOCK_WORKOUT_PLAN } from '@/utils/mock-workout-session'

export const ActiveWorkoutContent = () => {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { session, startWorkout } = useActiveWorkout()
  const [showDiscard, setShowDiscard] = useState(false)

  const { workout, isLoading, error } = useWorkoutQuery(id ?? null)

  // Use real workout if id provided, otherwise fall back to mock
  const workoutPlan = id !== undefined ? workout : MOCK_WORKOUT_PLAN

  useEffect(() => {
    if (workoutPlan !== null) {
      startWorkout(workoutPlan)
    }
  }, [workoutPlan, startWorkout])

  if (isLoading && id !== undefined) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error !== null && id !== undefined) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-base font-inter text-content-secondary text-center">{error}</Text>
        <Text className="text-sm font-inter text-brand-accent mt-4" onPress={() => router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)')}>Go back</Text>
      </View>
    )
  }

  if (session === null) return null

  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(protected)/(tabs)')
    }
  }

  const handleDiscard = () => {
    setShowDiscard(false)
    safeGoBack()
  }

  const handleDone = () => {
    safeGoBack()
  }

  return (
    <View className="flex-1 bg-background-primary">
      <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <CommandCenterWorkout onClose={() => setShowDiscard(true)} />
      </View>

      <FinishWorkoutOverlay onDone={handleDone} />
      <ConfirmationSheet
        visible={showDiscard}
        title="End workout?"
        description="Progress won't be saved."
        confirmLabel="End"
        onCancel={() => setShowDiscard(false)}
        onConfirm={handleDiscard}
      />
    </View>
  )
}
