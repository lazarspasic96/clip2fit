import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActiveWorkoutShell } from '@/components/workout/active-workout-shell'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useWorkoutQuery } from '@/hooks/use-api'
import { mapApiWorkout } from '@/types/api'

export const ActiveWorkoutContent = () => {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { session, startWorkout, clearSession } = useActiveWorkout()
  const hasStarted = useRef(false)

  const { rawWorkout, isLoading, error } = useWorkoutQuery(id ?? null)

  useEffect(() => {
    if (id === undefined) {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/(protected)/(tabs)' as never)
      }
      return
    }

    if (hasStarted.current) return

    // Already have an active session for this workout — resume
    if (session !== null && session.plan.id === id) {
      hasStarted.current = true
      return
    }

    // Different workout — silently clear old session, start fresh
    if (session !== null && session.plan.id !== id) {
      clearSession()
      hasStarted.current = false
      return
    }

    // No session — normal startup
    if (rawWorkout === null) return

    hasStarted.current = true
    const enrichedPlan = mapApiWorkout(rawWorkout)
    startWorkout(enrichedPlan)
  }, [id, rawWorkout, startWorkout, clearSession, session, router])

  if (isLoading && id !== undefined) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error !== null && id !== undefined) {
    return (
      <View
        className="flex-1 bg-background-primary justify-center items-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-base font-inter text-content-secondary text-center">{error}</Text>
        <Text
          className="text-sm font-inter text-brand-accent mt-4"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)' as never))}
        >
          Go back
        </Text>
      </View>
    )
  }

  if (session === null) return null

  return (
    <View className="flex-1 bg-background-primary">
      <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActiveWorkoutShell onBack={() => router.back()} />
      </View>
    </View>
  )
}
