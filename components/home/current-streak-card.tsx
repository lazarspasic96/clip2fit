import { Text, View } from 'react-native'

interface CurrentStreakCardProps {
  text: string
}

export const CurrentStreakCard = ({ text }: CurrentStreakCardProps) => {
  return (
    <View className="mx-5 bg-background-tertiary rounded-2xl p-4 flex-row items-center gap-3">
      <Text style={{ fontSize: 24 }}>{'\u{1F525}'}</Text>
      <View className="flex-1">
        <Text className="text-base font-inter-semibold text-content-primary">Current Streak</Text>
        <Text className="text-sm font-inter text-content-secondary mt-0.5">{text}</Text>
      </View>
    </View>
  )
}
