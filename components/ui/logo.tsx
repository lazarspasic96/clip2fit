import { Text } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { cn } from '@/components/ui/cn'

const SIZE_CLASSES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
} as const

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  delay?: number
  className?: string
}

export const Logo = ({ size = 'md', animated = false, delay = 0, className }: LogoProps) => {
  const textElement = (
    <Text className={cn('text-brand-logo font-onest', SIZE_CLASSES[size], className)}>clip2fit</Text>
  )

  if (animated) {
    return <Animated.View entering={FadeInDown.delay(delay).springify()}>{textElement}</Animated.View>
  }

  return textElement
}
