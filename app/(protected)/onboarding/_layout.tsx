import { ProgressBar } from '@/components/ui/progress-bar'
import { ProfileFormProvider } from '@/contexts/profile-form-context'
import { Stack, useSegments } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SCREENS = ['demographics', 'goal'] as const

export default function ProfileLayout() {
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const currentScreen = segments[segments.length - 1] ?? 'demographics'
  const step = SCREENS.indexOf(currentScreen as (typeof SCREENS)[number]) + 1

  return (
    <ProfileFormProvider>
      <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
        <View className="pt-4 pb-2">
          <ProgressBar step={step} total={SCREENS.length} />
        </View>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="demographics" />
          <Stack.Screen name="goal" />
        </Stack>
      </View>
    </ProfileFormProvider>
  )
}
