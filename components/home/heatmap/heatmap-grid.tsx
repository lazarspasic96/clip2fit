import { ScrollView, Text, View } from 'react-native'

import type { HeatmapDay } from '@/types/heatmap'
import { buildHeatmapGrid, getCellColor, getSecondaryColor } from './heatmap-utils'

const CELL_SIZE = 12
const CELL_GAP = 2

interface HeatmapGridProps {
  days: HeatmapDay[]
}

export const HeatmapGrid = ({ days }: HeatmapGridProps) => {
  const weeks = buildHeatmapGrid(days, 52)

  return (
    <View>
      {/* Month labels — only Jan (left) and Dec (right) */}
      <View className="flex-row justify-between mb-1">
        <Text className="text-[10px] font-inter text-content-tertiary">Jan</Text>
        <Text className="text-[10px] font-inter text-content-tertiary">Dec</Text>
      </View>

      {/* Scrollable grid — no day labels */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        <View className="flex-row" style={{ gap: CELL_GAP }}>
          {weeks.map((week, weekIdx) => (
            <View key={weekIdx} style={{ gap: CELL_GAP }}>
              {week.cells.map((cell) => {
                const bgColor = getCellColor(cell.categories)
                const borderColor = getSecondaryColor(cell.categories)
                const opacity = cell.count === 0 ? 1 : cell.count > 1 ? 1 : 0.85

                return (
                  <View
                    key={cell.date}
                    className="rounded-xs"
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: bgColor,
                      opacity,
                      borderWidth: borderColor !== null ? 1.5 : 0,
                      borderColor: borderColor ?? 'transparent',
                    }}
                  />
                )
              })}

              {/* Pad incomplete last week */}
              {week.cells.length < 7 &&
                Array.from({ length: 7 - week.cells.length }).map((_, i) => (
                  <View
                    key={`pad-${i}`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  />
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
