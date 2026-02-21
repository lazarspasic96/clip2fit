import { Text, View } from 'react-native'

import { useHeatmap } from '@/hooks/use-heatmap'

import { HeatmapGrid } from './heatmap/heatmap-grid'
import { HeatmapLegend } from './heatmap/heatmap-legend'

export const ActivityHeatmap = () => {
  const { days, totalSessions, isLoading } = useHeatmap('1y')

  if (isLoading) return null

  return (
    <View className="mx-5 gap-3">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-inter-semibold text-content-primary">
          Activity
        </Text>
        {totalSessions > 0 ? (
          <Text className="text-xs font-inter text-content-tertiary">
            {totalSessions} session{totalSessions === 1 ? '' : 's'}
          </Text>
        ) : null}
      </View>

      {/* Grid */}
      {days.length === 0 ? (
        <View className="bg-background-tertiary rounded-2xl p-6 items-center justify-center">
          <Text className="text-sm font-inter text-content-tertiary">
            No activity yet
          </Text>
        </View>
      ) : (
        <HeatmapGrid days={days} />
      )}

      {/* Legend */}
      <HeatmapLegend />
    </View>
  )
}
