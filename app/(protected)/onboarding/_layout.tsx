import { ProgressBar } from '@/components/ui/progress-bar'
import { ProfileFormProvider } from '@/contexts/profile-form-context'
import { Stack, useSegments } from 'expo-router'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SCREENS = [
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

const ProfileLayout = () => {
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const currentScreen = segments[segments.length - 1] ?? 'goal'
  const step = Math.max(SCREENS.indexOf(currentScreen as (typeof SCREENS)[number]) + 1, 1)

  return (
    <ProfileFormProvider>
      <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
        <View className="pt-4 pb-1">
          <ProgressBar step={step} total={SCREENS.length} />
        </View>
        <Text className="text-xs font-inter text-content-tertiary mx-6 mb-1">
          Step {step} of {SCREENS.length}
        </Text>
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
        </Stack>
      </View>
    </ProfileFormProvider>
  )
}

export default ProfileLayout
