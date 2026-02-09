import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useAuth } from '@/contexts/auth-context'

interface HomeHeaderProps {
  subtitle: string
}

export const HomeHeader = ({ subtitle }: HomeHeaderProps) => {
  const { user } = useAuth()
  const router = useRouter()

  const displayName = (user?.user_metadata?.fullName as string) || 'there'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <View className="px-5">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <View
              className="items-center justify-center rounded-full bg-background-tertiary"
              style={{ width: 40, height: 40 }}
            >
              <Text className="text-sm font-inter-semibold text-content-primary">{initials}</Text>
            </View>
          )}
          <Text className="text-xl font-inter-bold text-content-primary">
            Hi, {displayName}!{'\u{1F44B}'}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/(protected)/settings')}
          hitSlop={12}
        >
          <Settings size={22} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      </View>

      <Text className="text-sm font-inter text-content-secondary mt-1">{subtitle}</Text>
    </View>
  )
}
