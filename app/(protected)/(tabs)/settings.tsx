import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Colors } from '@/constants/colors'

export default function SettingsScreen() {
  const { user, onboardingComplete, signOut } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const displayName = user?.user_metadata?.fullName as string | undefined

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-inter-bold text-content-primary mb-8">Settings</Text>

        <View>
          {displayName && <Text className="text-lg font-inter-semibold text-content-primary">{displayName}</Text>}
          <Text className="text-base font-inter text-content-secondary">{user?.email}</Text>
        </View>

        <View className="mt-6 gap-3">
          {!onboardingComplete && (
            <Pressable
              onPress={() => router.push('/(protected)/onboarding/name')}
              className="flex-row items-center justify-between bg-background-secondary rounded-md px-4 py-4"
            >
              <Text className="text-base font-inter text-content-primary">Complete Profile</Text>
              <ChevronRight color={Colors.content.tertiary} size={20} />
            </Pressable>
          )}
        </View>

        <View className="mt-auto" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
          <Button variant="secondary" onPress={signOut}>
            Sign Out
          </Button>
        </View>
      </View>
    </View>
  )
}
