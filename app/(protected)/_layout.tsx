import { Stack } from 'expo-router'

import { Colors } from '@/constants/colors'
import { ActiveWorkoutProvider } from '@/contexts/active-workout-context'
import { WorkoutBuilderProvider } from '@/contexts/workout-builder-context'

export const unstable_settings = {
  anchor: '(tabs)',
}

const sheetOptions = {
  presentation: 'formSheet' as const,
  gestureDirection: 'vertical' as const,
  sheetGrabberVisible: true,
  sheetCornerRadius: 20,
  headerShown: false,
  contentStyle: { backgroundColor: Colors.background.secondary },
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
            name="process-url"
            options={{
              ...sheetOptions,
              sheetAllowedDetents: [0.6, 0.8],
            }}
          />
          <Stack.Screen
            name="add-workout"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="exercise-catalog" options={{ presentation: 'card' }} />
          <Stack.Screen name="exercise-detail" options={{ presentation: 'card' }} />
          <Stack.Screen name="workout-builder" options={{ presentation: 'card' }} />
          <Stack.Screen name="workout-detail" options={{ presentation: 'card' }} />
          <Stack.Screen name="workout-proposal" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="exercise-history" options={{ presentation: 'card' }} />
          {/* --- formSheet routes --- */}
          <Stack.Screen name="sheets/edit-personal-info" options={{ ...sheetOptions, sheetAllowedDetents: [0.6] }} />
          <Stack.Screen
            name="sheets/edit-body-measurements"
            options={{ ...sheetOptions, sheetAllowedDetents: [0.7] }}
          />
          <Stack.Screen
            name="sheets/edit-fitness-goal"
            options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }}
          />
          <Stack.Screen name="sheets/day-options" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/workout-picker" options={{ ...sheetOptions, sheetAllowedDetents: [0.7, 0.9] }} />
          <Stack.Screen name="sheets/finish-workout" options={{ ...sheetOptions, sheetAllowedDetents: [0.34, 0.8] }} />
          <Stack.Screen name="sheets/exercise-learning" options={{ ...sheetOptions, sheetAllowedDetents: [0.8] }} />
          <Stack.Screen name="sheets/edit-exercise" options={{ ...sheetOptions, sheetAllowedDetents: [0.6] }} />
          <Stack.Screen name="sheets/catalog-filters" options={{ ...sheetOptions, sheetAllowedDetents: [0.7, 0.9] }} />
        </Stack>
      </ActiveWorkoutProvider>
    </WorkoutBuilderProvider>
  )
}

export default ProtectedLayout
