import { View, Text } from 'react-native'

export const AuthDivider = () => {
  return (
    <View className="flex-row items-center my-4">
      <View className="flex-1 h-px bg-border-primary" />
      <Text className="mx-4 text-sm font-inter text-content-tertiary">or</Text>
      <View className="flex-1 h-px bg-border-primary" />
    </View>
  )
}
