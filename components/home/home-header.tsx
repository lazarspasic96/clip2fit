import { Image } from 'expo-image'
import { Text, View } from 'react-native'

interface HomeHeaderProps {
  avatarUrl?: string
  displayName: string
  initials: string
  subtitle: string
}

export const HomeHeader = ({ avatarUrl, displayName, initials, subtitle }: HomeHeaderProps) => {
  return (
    <View className="px-5">
      <View className="flex-row items-center gap-3 mb-1">
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

      <Text className="text-sm font-inter text-content-secondary mt-1">{subtitle}</Text>
    </View>
  )
}
