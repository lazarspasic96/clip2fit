import { Plus } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Colors } from '@/constants/colors'
import { TikTokIcon, InstagramIcon, YouTubeIcon, XIcon } from '@/components/ui/platform-icons'

export const ImportFromSocialsCard = () => {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push('/(protected)/process-url' as never)}
      className="mx-5 bg-background-tertiary rounded-2xl p-4"
    >
      <View className="flex-row items-center gap-4">
        <View className="w-11 h-11 items-center justify-center rounded-full bg-brand-accent">
          <Plus size={22} color={Colors.background.primary} strokeWidth={2.5} pointerEvents="none" />
        </View>

        <View className="flex-1">
          <Text className="text-base font-inter text-content-primary">Import workout directly from</Text>
          <View className="flex-row items-center gap-2 mt-1.5">
            <Text className="text-base font-inter-bold text-content-primary">Socials</Text>
            <TikTokIcon />
            <InstagramIcon />
            <YouTubeIcon />
            <XIcon />
          </View>
        </View>
      </View>

      <Text className="text-sm font-inter text-content-secondary mt-3">
        Only with{' '}
        <Text className="text-sm font-inter-semibold text-brand-accent bg-background-tertiary rounded px-1">
          Premium
        </Text>{' '}
        AI enhanced!
      </Text>
    </Pressable>
  )
}
