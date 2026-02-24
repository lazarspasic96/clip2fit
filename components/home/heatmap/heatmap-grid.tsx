import { ScrollView, Text, View } from 'react-native'

import type { HeatmapDay } from '@/types/heatmap'
import { buildHeatmapGrid, getCellColor, getMonthLabels, getSecondaryColor } from './heatmap-utils'

const CELL_SIZE = 12
const GAP = 2

interface HeatmapGridProps {
  days: HeatmapDay[]
}

export const HeatmapGrid = ({ days }: HeatmapGridProps) => {
  const weeks = buildHeatmapGrid(days)
  const monthLabels = getMonthLabels(weeks)
  const totalWidth = weeks.length * (CELL_SIZE + GAP)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      <View style={{ width: totalWidth }}>
        {/* Month labels — scroll with grid */}
        <View style={{ height: 16, position: 'relative' }}>
          {monthLabels.map(({ label, weekIndex }) => (
            <Text
              key={`${label}-${weekIndex}`}
              className="text-[10px] font-inter text-content-tertiary"
              style={{
                position: 'absolute',
                left: weekIndex * (CELL_SIZE + GAP),
              }}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Grid cells */}
        <View className="flex-row gap-0.5">
          {weeks.map((week, weekIdx) => (
            <View key={weekIdx} className="gap-0.5">
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

              {/* Pad incomplete weeks */}
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
      </View>
    </ScrollView>
  )
}
