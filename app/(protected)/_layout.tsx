import { Stack } from 'expo-router'

import { ActiveWorkoutProvider } from '@/contexts/active-workout-context'
import { WorkoutBuilderProvider } from '@/contexts/workout-builder-context'

export const unstable_settings = {
  anchor: '(tabs)',
}

const ProtectedLayout = () => {
  return (
    <WorkoutBuilderProvider>
      <ActiveWorkoutProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="settings" options={{}} />
          <Stack.Screen
            name="add-workout"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="exercise-catalog"
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="exercise-detail"
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="workout-builder"
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="workout-detail"
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="exercise-history"
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="process-url"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="form-coach"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </ActiveWorkoutProvider>
    </WorkoutBuilderProvider>
  )
}

export default ProtectedLayout
