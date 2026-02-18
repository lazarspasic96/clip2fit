import { Text, View } from 'react-native'

import { formatMuscleLabel } from '@/types/stats'
import type { StatsMuscleGroupDistributionPoint } from '@/types/stats'

interface MusclePercentListProps {
  items: StatsMuscleGroupDistributionPoint[]
  limit?: number
}

export const MusclePercentList = ({ items, limit = 6 }: MusclePercentListProps) => {
  return (
    <View className="gap-3">
      {items.slice(0, limit).map((item) => (
        <View key={item.muscleGroup} className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-inter-medium text-content-primary">
              {formatMuscleLabel(item.muscleGroup)}
            </Text>
            <Text className="text-sm font-inter-semibold text-content-secondary">
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
          <View className="h-2 rounded-full bg-background-primary overflow-hidden">
            <View
              className="h-full rounded-full bg-brand-accent"
              style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  )
}

