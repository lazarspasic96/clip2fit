import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { supabase } from '@/utils/supabase'

export const unstable_settings = {
  anchor: '(tabs)',
}

const ProtectedLayout = () => {

  useEffect(() => {
    const logToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log(session?.access_token)
    }
    logToken()
  }, [])


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
      <Stack.Screen name="workout-detail" options={{ presentation: 'card' }} />
      <Stack.Screen
        name="active-workout"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
          animation: 'slide_from_bottom',
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
  )
}

export default ProtectedLayout
