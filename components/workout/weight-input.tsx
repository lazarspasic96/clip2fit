import { TextInput, View, Text } from 'react-native'

import { Colors } from '@/constants/colors'

interface WeightInputProps {
  value: string
  placeholder: string
  onChangeText: (text: string) => void
}

export const WeightInput = ({ value, placeholder, onChangeText }: WeightInputProps) => {
  return (
    <View className="flex-row items-center">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.content.tertiary}
        keyboardType="numeric"
        className="text-base font-inter text-content-primary border-b border-border-secondary w-12 text-center pb-1"
      />
      <Text className="text-xs font-inter text-content-tertiary ml-1">kg</Text>
    </View>
  )
}
