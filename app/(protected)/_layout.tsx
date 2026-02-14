import { Stack } from 'expo-router'

import { ActiveWorkoutProvider } from '@/contexts/active-workout-context'

export const unstable_settings = {
  anchor: '(tabs)',
}

const ProtectedLayout = () => {
  return (
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
          name="workout-detail"
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
      </Stack>
    </ActiveWorkoutProvider>
  )
}

export default ProtectedLayout
