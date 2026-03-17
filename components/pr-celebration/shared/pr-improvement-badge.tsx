import { Text, View } from 'react-native'

interface PrImprovementBadgeProps {
  newWeight: number
  previousWeight: number | null
}

export const PrImprovementBadge = ({ newWeight, previousWeight }: PrImprovementBadgeProps) => {
  if (previousWeight === null) {
    return (
      <View className="self-start rounded-full bg-background-badge-success px-3 py-1">
        <Text className="text-xs font-inter-semibold text-brand-accent">First PR</Text>
      </View>
    )
  }

  const diff = newWeight - previousWeight
  const pct = previousWeight > 0 ? (diff / previousWeight) * 100 : 0

  return (
    <View className="self-start rounded-full bg-background-badge-success px-3 py-1">
      <Text className="text-xs font-inter-semibold text-brand-accent">
        +{diff.toFixed(1)}kg ({pct.toFixed(1)}%)
      </Text>
    </View>
  )
}
