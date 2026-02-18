import { Text, View } from 'react-native'

interface StatsHeaderProps {
  subtitle: string
}

export const StatsHeader = ({ subtitle }: StatsHeaderProps) => {
  return (
    <View className="px-5 gap-1">
      <Text className="text-3xl font-onest text-content-primary">Stats</Text>
      <Text className="text-sm font-inter text-content-secondary">{subtitle}</Text>
    </View>
  )
}
