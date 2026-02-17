import { ChevronRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

interface SettingsRowProps {
  label: string
  value?: string
  onPress: () => void
  showValue?: boolean
}

export const SettingsRow = ({ label, value, onPress, showValue = true }: SettingsRowProps) => {
  const hasValue = value !== undefined && value.length > 0

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-background-secondary rounded-md px-4 py-3.5"
    >
      <Text className="text-base font-inter text-content-secondary">{label}</Text>
      <View className="flex-row items-center gap-2">
        {showValue && (
          <Text
            className={`text-base font-inter ${hasValue ? 'text-content-primary' : 'text-content-tertiary'}`}
            numberOfLines={1}
          >
            {hasValue ? value : 'Not set'}
          </Text>
        )}
        <ChevronRight size={18} color={Colors.content.tertiary} pointerEvents="none" />
      </View>
    </Pressable>
  )
}
