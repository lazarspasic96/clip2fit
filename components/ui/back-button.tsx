import { ChevronLeft } from 'lucide-react-native'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'

import { Colors } from '@/constants/colors'

import { cn } from './cn'

interface BackButtonProps {
  onPress: () => void
  className?: string
  style?: StyleProp<ViewStyle>
}

export const BackButton = ({ onPress, className, style }: BackButtonProps) => (
  <Pressable
    onPress={onPress}
    hitSlop={12}
    className={cn('w-10 h-10 bg-background-secondary rounded-full items-center justify-center', className)}
    style={style}
  >
    <ChevronLeft size={20} color={Colors.content.primary} pointerEvents="none" />
  </Pressable>
)
