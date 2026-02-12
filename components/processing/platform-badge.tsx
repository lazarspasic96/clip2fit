import { View } from 'react-native'

import type { SupportedPlatform } from '@/utils/url-validation'
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '@/components/ui/platform-icons'

interface PlatformBadgeProps {
  platform: SupportedPlatform
  size?: number
}

export const PlatformBadge = ({ platform, size = 28 }: PlatformBadgeProps) => {
  const iconSize = size * 0.6

  const renderIcon = () => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon size={iconSize} />
      case 'tiktok':
        return <TikTokIcon size={iconSize} />
      case 'youtube':
        return <YouTubeIcon size={iconSize} />
      case 'facebook':
        return <FacebookIcon size={iconSize} />
      case 'twitter':
        return <XIcon size={iconSize} />
      default:
        return null
    }
  }

  if (platform === 'unknown') return null

  return (
    <View
      className="items-center justify-center rounded-full bg-background-tertiary"
      style={{ width: size, height: size }}
    >
      {renderIcon()}
    </View>
  )
}
