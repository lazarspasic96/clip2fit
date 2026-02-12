import { ChevronLeft } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Colors } from '@/constants/colors'

interface DetailHeaderProps {
  onBack: () => void
}

export const DetailHeader = ({ onBack }: DetailHeaderProps) => (
  <View className="flex-row items-center px-4 py-3">
    <Pressable onPress={onBack} hitSlop={12} className="p-1">
      <ChevronLeft size={24} color={Colors.content.primary} pointerEvents="none" />
    </Pressable>
  </View>
)
