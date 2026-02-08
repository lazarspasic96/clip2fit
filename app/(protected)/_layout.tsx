import { Stack } from 'expo-router'

export default function ProtectedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="settings"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="add-workout"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  )
}
