import { ProgressBar } from '@/components/ui/progress-bar'
import { ProfileFormProvider } from '@/contexts/profile-form-context'
import { Stack, useSegments } from 'expo-router'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PROGRESS_SCREENS = [
  'goal',
  'experience',
  'workout-location',
  'equipment',
  'frequency',
  'duration',
  'training-style',
  'focus-areas',
  'injuries',
  'activity-level',
  'about-you',
] as const

const FULL_SCREEN_STEPS = new Set(['demo-conversion', 'paywall'])

const ProfileLayout = () => {
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const currentScreen = segments[segments.length - 1] ?? 'goal'
  const isFullScreen = FULL_SCREEN_STEPS.has(currentScreen)
  const step = Math.max(PROGRESS_SCREENS.indexOf(currentScreen as (typeof PROGRESS_SCREENS)[number]) + 1, 1)

  return (
    <ProfileFormProvider>
      <View className="flex-1 bg-background-primary" style={isFullScreen ? undefined : { paddingTop: insets.top }}>
        {!isFullScreen && (
          <>
            <View className="pt-4 pb-1">
              <ProgressBar step={step} total={PROGRESS_SCREENS.length} />
            </View>
            <Text className="text-xs font-inter text-content-tertiary mx-6 mb-1">
              Step {step} of {PROGRESS_SCREENS.length}
            </Text>
          </>
        )}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="goal" />
          <Stack.Screen name="experience" />
          <Stack.Screen name="workout-location" />
          <Stack.Screen name="equipment" />
          <Stack.Screen name="frequency" />
          <Stack.Screen name="duration" />
          <Stack.Screen name="training-style" />
          <Stack.Screen name="focus-areas" />
          <Stack.Screen name="injuries" />
          <Stack.Screen name="activity-level" />
          <Stack.Screen name="about-you" />
          <Stack.Screen name="demo-conversion" options={{ gestureEnabled: false }} />
          <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
        </Stack>
      </View>
    </ProfileFormProvider>
  )
}

export default ProfileLayout
