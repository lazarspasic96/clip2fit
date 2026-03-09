import { ProgressBar } from '@/components/ui/progress-bar'
import { Colors } from '@/constants/colors'
import { ProfileFormProvider } from '@/contexts/profile-form-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SCREENS = ['demographics', 'goal'] as const

const ProfileLayout = () => {
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const currentScreen = segments[segments.length - 1] ?? 'demographics'
  const step = SCREENS.indexOf(currentScreen as (typeof SCREENS)[number]) + 1

  return (
    <ProfileFormProvider>
      <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center pt-4 pb-2 gap-3">
          <View className="flex-1">
            <ProgressBar step={step} total={SCREENS.length} />
          </View>
          <Pressable
            onPress={() => router.push('/(protected)/settings')}
            className="pr-4"
            hitSlop={8}
          >
            <Settings size={22} color={Colors.text.tertiary} pointerEvents="none" />
          </Pressable>
        </View>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="demographics" />
          <Stack.Screen name="goal" />
        </Stack>
      </View>
    </ProfileFormProvider>
  )
}

export default ProfileLayout
