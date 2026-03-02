import { View } from 'react-native'

import { BackButton } from '@/components/ui/back-button'

interface DetailHeaderProps {
  onBack: () => void
}

export const DetailHeader = ({ onBack }: DetailHeaderProps) => (
  <View className="flex-row items-center px-4 py-3">
    <BackButton onPress={onBack} />
  </View>
)
