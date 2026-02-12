import { Image } from 'expo-image'
import { Text, View } from 'react-native'

const PLATFORM_ICONS: Record<string, string> = {
  instagram:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png',
  tiktok: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
  youtube:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/120px-YouTube_full-color_icon_%282017%29.svg.png',
}

interface CreatorAttributionProps {
  platform: 'tiktok' | 'instagram' | 'youtube'
  handle: string
}

export const CreatorAttribution = ({ platform, handle }: CreatorAttributionProps) => {
  return (
    <View className="flex-row items-center gap-1.5">
      {PLATFORM_ICONS[platform] !== undefined && (
        <Image source={{ uri: PLATFORM_ICONS[platform] }} style={{ width: 14, height: 14 }} />
      )}
      <Text className="text-xs font-inter text-content-secondary">{handle}</Text>
    </View>
  )
}
