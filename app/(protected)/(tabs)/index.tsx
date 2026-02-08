import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Logo } from '@/components/ui/logo'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-1 justify-center items-center px-6">
        <Logo size="md" />
        <Text className="text-xl font-inter-semibold text-content-primary mt-4 mb-2">Paste a video URL</Text>
        <Text className="text-base font-inter text-content-secondary text-center">
          Share a workout video from TikTok, Instagram, or YouTube and we{`'`}ll convert it into a structured plan.
        </Text>
      </View>
    </View>
  )
}
