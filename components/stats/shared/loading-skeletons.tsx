import { View } from 'react-native'

export const StatsLoadingSkeletons = () => {
  return (
    <View className="px-5 gap-4">
      <View className="h-28 rounded-3xl bg-background-secondary" />
      <View className="h-28 rounded-3xl bg-background-secondary" />
      <View className="h-56 rounded-3xl bg-background-secondary" />
    </View>
  )
}

