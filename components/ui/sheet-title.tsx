import { Text, View } from 'react-native'

import { cn } from './cn'

interface SheetTitleProps {
  children: string
  className?: string
}

export const SheetTitle = ({ children, className }: SheetTitleProps) => (
  <View className={cn('flex-row items-center justify-center mb-3', className)}>
    <Text className="text-lg font-inter-bold text-content-primary">{children}</Text>
  </View>
)
