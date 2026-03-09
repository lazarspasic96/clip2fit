import { Stack } from 'expo-router'
import { Platform } from 'react-native'

import { Colors } from '@/constants/colors'
import { ActiveWorkoutProvider } from '@/contexts/active-workout-context'
import { WorkoutBuilderProvider } from '@/contexts/workout-builder-context'

const IS_ANDROID = Platform.OS === 'android'

export const unstable_settings = {
  anchor: '(tabs)',
}

// formSheet guaranteed on Expo 54 (iOS 16+, Android via react-native-screens 4.23).
// Fallback: presentation 'modal' + animation 'slide_from_bottom' (see add-workout screen).
const sheetOptions = {
  presentation: 'formSheet' as const,
  gestureDirection: 'vertical' as const,
  sheetGrabberVisible: true,
  headerShown: false,
  contentStyle: { backgroundColor: Colors.background.secondary },
  ...(IS_ANDROID && { sheetCornerRadius: 20 }),
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
          <Stack.Screen name="add-exercises" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="exercise-history" options={{ presentation: 'card' }} />
          {/* --- formSheet routes --- */}
          <Stack.Screen name="sheets/edit-name" options={{ ...sheetOptions, sheetAllowedDetents: [0.35] }} />
          <Stack.Screen name="sheets/edit-gender" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/edit-date-of-birth" options={{ ...sheetOptions, sheetAllowedDetents: [0.4] }} />
          <Stack.Screen name="sheets/edit-height" options={{ ...sheetOptions, sheetAllowedDetents: [0.45] }} />
          <Stack.Screen name="sheets/edit-weight" options={{ ...sheetOptions, sheetAllowedDetents: [0.4] }} />
          <Stack.Screen
            name="sheets/edit-fitness-goal"
            options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }}
          />
          <Stack.Screen name="sheets/day-options" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/workout-picker" options={{ ...sheetOptions, sheetAllowedDetents: [0.7, 0.9] }} />
          <Stack.Screen name="sheets/finish-workout" options={{ ...sheetOptions, sheetAllowedDetents: [0.34, 0.8] }} />
          <Stack.Screen name="sheets/exercise-learning" options={{ ...sheetOptions, sheetAllowedDetents: [0.8, 1] }} />
          <Stack.Screen name="sheets/edit-exercise" options={{ ...sheetOptions, sheetAllowedDetents: [0.6] }} />
          <Stack.Screen name="sheets/catalog-filters" options={{ ...sheetOptions, sheetAllowedDetents: [0.7, 0.9] }} />
          <Stack.Screen name="sheets/picker-filters" options={{ ...sheetOptions, sheetAllowedDetents: [0.7, 0.9] }} />
          <Stack.Screen name="sheets/edit-experience" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/edit-activity-level" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/edit-workout-location" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/edit-equipment" options={{ ...sheetOptions, sheetAllowedDetents: [0.6, 0.85] }} />
          <Stack.Screen name="sheets/edit-schedule" options={{ ...sheetOptions, sheetAllowedDetents: [0.7, 1] }} />
          <Stack.Screen name="sheets/edit-training-style" options={{ ...sheetOptions, sheetAllowedDetents: [0.55, 0.8] }} />
          <Stack.Screen name="sheets/edit-focus-areas" options={{ ...sheetOptions, sheetAllowedDetents: 'fitToContents' }} />
          <Stack.Screen name="sheets/edit-injuries" options={{ ...sheetOptions, sheetAllowedDetents: [0.6, 0.85] }} />
          <Stack.Screen name="sheets/delete-account" options={{ ...sheetOptions, sheetAllowedDetents: [0.45] }} />
        </Stack>
      </ActiveWorkoutProvider>
    </WorkoutBuilderProvider>
  )
}

export default ProtectedLayout
