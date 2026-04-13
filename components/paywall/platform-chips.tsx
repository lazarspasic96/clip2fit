import { Text, View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg'

const TikTokIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
      fill="#fafafa"
    />
  </Svg>
)

const InstagramIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 551 551">
    <Defs>
      <LinearGradient id="ig" x1="275" y1="547" x2="275" y2="4" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#E09B3D" />
        <Stop offset="0.3" stopColor="#C74C4D" />
        <Stop offset="0.6" stopColor="#C21975" />
        <Stop offset="1" stopColor="#7024C4" />
      </LinearGradient>
    </Defs>
    <Path
      d="M387 0H164C74 0 0 74 0 164v223c0 90 74 164 164 164h223c90 0 164-74 164-164V164C551 74 477 0 387 0zm112 387c0 62-50 112-112 112H164c-62 0-112-50-112-112V164c0-62 50-112 112-112h223c62 0 112 50 112 112v223z"
      fill="url(#ig)"
    />
    <Path
      d="M276 133c-79 0-143 64-143 143s64 142 143 142 142-64 142-142-64-143-142-143zm0 233c-50 0-90-41-90-90s41-90 90-90 90 41 90 90-41 90-90 90z"
      fill="url(#ig)"
    />
    <Circle cx="418" cy="134" r="34" fill="url(#ig)" />
  </Svg>
)

const YouTubeIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"
      fill="#FF0000"
    />
    <Polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="#fff" />
  </Svg>
)

const PLATFORMS = [
  { name: 'TikTok', Icon: TikTokIcon },
  { name: 'Instagram', Icon: InstagramIcon },
  { name: 'YouTube', Icon: YouTubeIcon },
] as const

export const PlatformChips = () => {
  return (
    <View className="flex-row gap-2">
      {PLATFORMS.map(({ name, Icon }) => (
        <View
          key={name}
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-background-secondary border border-border-primary rounded-[10px] py-2.5 px-2"
        >
          <Icon />
          <Text className="text-xs font-inter-medium text-content-secondary">{name}</Text>
        </View>
      ))}
    </View>
  )
}
