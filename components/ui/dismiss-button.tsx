import { X } from 'lucide-react-native'
import { Pressable } from 'react-native'

import { Colors } from '@/constants/colors'

import { cn } from './cn'

interface DismissButtonProps {
  onPress: () => void
  className?: string
}

export const DismissButton = ({ onPress, className }: DismissButtonProps) => (
  <Pressable onPress={onPress} hitSlop={12} className={cn('p-1', className)}>
    <X size={24} color={Colors.content.primary} pointerEvents="none" />
  </Pressable>
)
