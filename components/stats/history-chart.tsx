import { useState } from 'react'
import { Text, View } from 'react-native'
import { LineChart, type lineDataItem } from 'react-native-gifted-charts'

import { cn } from '@/components/ui/cn'
import { Colors } from '@/constants/colors'
import { formatCompactNumber, formatInstantDate, formatWeight } from '@/components/stats/shared/stats-formatters'
import type { StatsPRTimelinePoint } from '@/types/stats'

type HistoryLineDataItem = lineDataItem & {
  sessionId: string
  date: string
  reps: number
  previousWeight: number | null
}

const getDotStep = (count: number) => {
  if (count <= 12) return 1
  if (count <= 24) return 2
  if (count <= 40) return 3
  return Math.ceil(count / 12)
}

export interface HistoryChartProps {
  points: StatsPRTimelinePoint[]
  selectedSessionId: string | null
  onSelectSessionId: (sessionId: string) => void
}

export const HistoryChart = ({ points, selectedSessionId, onSelectSessionId }: HistoryChartProps) => {
  const chartHeight = 210
  const [chartHostWidth, setChartHostWidth] = useState(0)
  const chartWidth = Math.max(0, chartHostWidth - 24)
  const edgeInset = 16

  const pointSpacing = (() => {
    if (points.length <= 1) return 0
    const usableWidth = Math.max(0, chartWidth - edgeInset * 2)
    return usableWidth / (points.length - 1)
  })()

  const paddedMaxValue = (() => {
    if (points.length === 0) return 0
    const weights = points.map((point) => point.weight)
    const maxWeight = Math.max(...weights)
    const minWeight = Math.min(...weights)
    return maxWeight + Math.max(2, (maxWeight - minWeight) * 0.1)
  })()

  const chartData: HistoryLineDataItem[] = (() => {
    const selectedIndex = points.findIndex((point) => point.sessionId === selectedSessionId)
    const lastIndex = points.length - 1
    const dotStep = getDotStep(points.length)

    return points.map((point, index) => ({
      hideDataPoint:
        !(
          point.sessionId === selectedSessionId
          || point.sessionId === points[0]?.sessionId
          || point.sessionId === points[lastIndex]?.sessionId
          || (selectedIndex >= 0 && Math.abs(index - selectedIndex) <= 1)
          || index % dotStep === 0
        ),
      value: point.weight,
      label: '',
      dataPointColor: selectedSessionId === point.sessionId ? Colors.brand.logo : Colors.brand.accent,
      dataPointRadius: selectedSessionId === point.sessionId ? 5.5 : 4.5,
      sessionId: point.sessionId,
      date: point.date,
      reps: point.reps,
      previousWeight: point.previousWeight,
    }))
  })()

  const pointerConfig = {
      pointerColor: Colors.brand.logo,
      radius: 5.5,
      showPointerStrip: true,
      pointerStripWidth: 1,
      pointerStripColor: Colors.border.secondary,
      pointerStripUptoDataPoint: true,
      pointerLabelWidth: 170,
      pointerLabelHeight: 84,
      autoAdjustPointerLabelPosition: true,
      activatePointersOnLongPress: false,
      activatePointersInstantlyOnTouch: true,
      persistPointer: true,
      pointerLabelComponent: (items: HistoryLineDataItem[]) => {
        const selected = items[0]
        if (selected === undefined || typeof selected.value !== 'number') return null

        const isGainOrFirst = selected.previousWeight === null || selected.value >= selected.previousWeight
        const deltaText =
          selected.previousWeight === null
            ? 'First PR'
            : `${selected.value >= selected.previousWeight ? '+' : ''}${(selected.value - selected.previousWeight).toFixed(1)}kg`

        return (
          <View className="bg-background-secondary border border-border-secondary rounded-xl px-3 py-2 gap-1">
            <Text className="text-sm font-inter-semibold text-content-primary">
              {formatWeight(selected.value)}kg x {selected.reps}
            </Text>
            <Text className="text-xs font-inter text-content-tertiary">{formatInstantDate(selected.date)}</Text>
            <Text
              className={cn(
                'text-xs font-inter-semibold',
                isGainOrFirst ? 'text-brand-accent' : 'text-content-badge-error',
              )}
            >
              {deltaText}
            </Text>
          </View>
        )
      },
  }

  if (points.length === 0) {
    return (
      <View className="h-[210] items-center justify-center bg-background-primary rounded-2xl">
        <Text className="text-sm font-inter text-content-tertiary">No PR points in selected period</Text>
      </View>
    )
  }

  return (
    <View className="bg-background-primary rounded-2xl p-3 overflow-hidden">
      <View
        className="overflow-hidden"
        onLayout={(event) => {
          const nextWidth = Math.floor(event.nativeEvent.layout.width)
          setChartHostWidth((prev) => (prev === nextWidth ? prev : nextWidth))
        }}
      >
        {chartWidth > 0 && (
          <View className="w-full">
            <LineChart
              data={chartData}
              width={chartWidth}
              height={chartHeight}
              adjustToWidth={false}
              disableScroll
              noOfSections={4}
              maxValue={paddedMaxValue}
              color={Colors.brand.accent}
              thickness={3}
              areaChart
              startFillColor={Colors.brand.logo}
              endFillColor={Colors.background.primary}
              startOpacity={0.25}
              endOpacity={0.04}
              curved
              isAnimated
              animationDuration={900}
              animateOnDataChange
              onDataChangeAnimationDuration={550}
              yAxisColor={Colors.border.secondary}
              xAxisColor={Colors.border.secondary}
              rulesColor={Colors.border.primary}
              rulesType="dashed"
              dashWidth={4}
              dashGap={4}
              dataPointsColor={Colors.background.primary}
              dataPointsRadius={4.5}
              focusedDataPointColor={Colors.brand.logo}
              focusedDataPointRadius={5.5}
              yAxisLabelSuffix="kg"
              yAxisLabelWidth={42}
              initialSpacing={edgeInset}
              endSpacing={edgeInset}
              spacing={pointSpacing}
              xAxisLabelsHeight={20}
              xAxisTextNumberOfLines={6}
              yAxisTextStyle={{ color: Colors.content.tertiary, fontSize: 11 }}
              xAxisLabelTextStyle={{ color: Colors.content.tertiary, fontSize: 11 }}
              formatYLabel={(label) => formatCompactNumber(Number(label))}
              pointerConfig={pointerConfig}
              onPress={(item: lineDataItem) => {
                const sessionId = (item as Partial<HistoryLineDataItem>).sessionId
                if (typeof sessionId === 'string') onSelectSessionId(sessionId)
              }}
            />
          </View>
        )}
      </View>
      <View className="flex-row justify-between px-2">
        <Text className="text-xs font-inter text-content-tertiary">{formatInstantDate(points[0]?.date ?? '')}</Text>
        <Text className="text-xs font-inter text-content-tertiary">
          {formatInstantDate(points[points.length - 1]?.date ?? '')}
        </Text>
      </View>
    </View>
  )
}
