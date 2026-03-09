import { Text, View } from 'react-native'

interface DayCounterProps {
  currentDay: number
  totalDays: number
}

export const DayCounter = ({ currentDay, totalDays }: DayCounterProps) => (
  <View className="flex-row items-baseline">
    <Text className="text-2xl font-inter-bold text-content-primary">
      DAY {currentDay}
    </Text>
    <Text className="text-base font-inter text-content-secondary ml-1">
      / {totalDays}
    </Text>
  </View>
)
