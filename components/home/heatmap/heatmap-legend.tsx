import { ScrollView, Text, View } from 'react-native'

import {
  ALL_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '@/types/heatmap'

export const HeatmapLegend = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
    >
      {ALL_CATEGORIES.map((category) => (
        <View key={category} className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[category] }}
          />
          <Text className="text-xs font-inter text-content-tertiary">
            {CATEGORY_LABELS[category]}
          </Text>
        </View>
      ))}
    </ScrollView>
  )
}
