import { Check } from 'lucide-react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

const SIZES = {
  sm: { container: 18, icon: 12 },
  md: { container: 24, icon: 16 },
} as const

interface CatalogSelectedBadgeProps {
  isSelected: boolean
  size?: 'sm' | 'md'
}

export const CatalogSelectedBadge = ({ isSelected, size = 'md' }: CatalogSelectedBadgeProps) => {
  if (!isSelected) {
    return null
  }

  const dimensions = SIZES[size]

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="absolute bg-brand-accent rounded-full items-center justify-center"
      style={{ width: dimensions.container, height: dimensions.container }}
    >
      <Check size={dimensions.icon} color="#09090b" pointerEvents="none" />
    </Animated.View>
  )
}
