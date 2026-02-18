import { Pressable, Text, View } from 'react-native'

interface EmptyStatsStateProps {
  onPrimaryAction: () => void
}

export const EmptyStatsState = ({ onPrimaryAction }: EmptyStatsStateProps) => {
  return (
    <View className="mx-5 mt-4 bg-background-secondary rounded-3xl p-6 gap-4">
      <View className="gap-1">
        <Text className="text-xl font-onest text-content-primary">No training data yet</Text>
        <Text className="text-sm font-inter text-content-secondary">
          Complete your first workout to unlock top exercises, muscle distribution, and PR history.
        </Text>
      </View>
      <Pressable
        className="bg-brand-accent rounded-xl py-3 px-4 items-center"
        onPress={onPrimaryAction}
      >
        <Text className="text-sm font-inter-semibold text-background-primary">Start a Workout</Text>
      </Pressable>
    </View>
  )
}

