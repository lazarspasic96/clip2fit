import { Plus } from 'lucide-react-native'
import { Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { Colors } from '@/constants/colors'

const TikTokIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.3 0 .59.04.86.12V9.01a6.27 6.27 0 00-.86-.06 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.82a4.84 4.84 0 01-1-.13z"
      fill="#fff"
    />
  </Svg>
)

const InstagramIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      fill="#E4405F"
    />
  </Svg>
)

const YouTubeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      fill="#FF0000"
    />
  </Svg>
)

const XIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="#fff"
    />
  </Svg>
)

export const ImportFromSocialsCard = () => {
  return (
    <View className="mx-5 bg-background-tertiary rounded-2xl p-4">
      <View className="flex-row items-center gap-4">
        <View className="items-center justify-center rounded-full bg-brand-accent" style={{ width: 44, height: 44 }}>
          <Plus size={22} color={Colors.background.primary} strokeWidth={2.5} />
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
    </View>
  )
}
