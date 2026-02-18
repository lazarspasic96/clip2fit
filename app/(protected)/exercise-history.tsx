import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import Svg, { Circle, Line, Polyline } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PeriodSelector } from '@/components/stats/shared/period-selector'
import { formatCompactNumber } from '@/components/stats/shared/stats-formatters'
import { Colors } from '@/constants/colors'
import { useExerciseHistory } from '@/hooks/use-stats'
import { parseUtcInstantMs, type StatsPRTimelinePoint, type StatsPeriod } from '@/types/stats'

const parseSingleParam = (value: string | string[] | undefined) => {
  if (value === undefined) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

const filterTimelineByPeriod = (timeline: StatsPRTimelinePoint[], period: StatsPeriod) => {
  if (period === 'all') return timeline

  const now = Date.now()
  const daysByPeriod: Record<Exclude<StatsPeriod, 'all'>, number> = {
    '7d': 7,
    '30d': 30,
    '6m': 182,
    '1y': 365,
  }

  const threshold = now - daysByPeriod[period] * 24 * 60 * 60 * 1000

  return timeline.filter((point) => {
    const ts = parseUtcInstantMs(point.date)
    return Number.isFinite(ts) && ts >= threshold
  })
}

const sortTimelineByInstant = (timeline: StatsPRTimelinePoint[]): StatsPRTimelinePoint[] => (
  timeline
    .slice()
    .sort((a, b) => parseUtcInstantMs(a.date) - parseUtcInstantMs(b.date))
)

const formatInstantDate = (value: string): string => {
  const timestamp = parseUtcInstantMs(value)
  if (!Number.isFinite(timestamp)) return 'N/A'
  return new Date(timestamp).toLocaleDateString()
}

interface HistoryChartProps {
  points: StatsPRTimelinePoint[]
  width: number
}

const HistoryChart = ({ points, width }: HistoryChartProps) => {
  const chartHeight = 210
  const chartPadding = 20

  if (points.length === 0) {
    return (
      <View className="h-[210] items-center justify-center bg-background-primary rounded-2xl">
        <Text className="text-sm font-inter text-content-tertiary">No PR points in selected period</Text>
      </View>
    )
  }

  const weights = points.map((point) => point.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const range = Math.max(1, maxWeight - minWeight)

  const chartPoints = points.map((point, index) => {
    const x = chartPadding + (index / Math.max(1, points.length - 1)) * (width - chartPadding * 2)
    const y = chartPadding + ((maxWeight - point.weight) / range) * (chartHeight - chartPadding * 2)
    return { x, y, point }
  })

  const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <View className="bg-background-primary rounded-2xl p-2">
      <Svg width={width} height={chartHeight}>
        <Line x1={chartPadding} y1={chartPadding} x2={chartPadding} y2={chartHeight - chartPadding} stroke="#3f3f46" strokeWidth={1} />
        <Line
          x1={chartPadding}
          y1={chartHeight - chartPadding}
          x2={width - chartPadding}
          y2={chartHeight - chartPadding}
          stroke="#3f3f46"
          strokeWidth={1}
        />
        <Polyline points={polylinePoints} fill="none" stroke="#84cc16" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {chartPoints.map(({ x, y, point }) => (
          <Circle key={point.sessionId} cx={x} cy={y} r={4.5} fill="#bef264" />
        ))}
      </Svg>
      <View className="flex-row justify-between px-2">
        <Text className="text-xs font-inter text-content-tertiary">{formatInstantDate(points[0]?.date ?? '')}</Text>
        <Text className="text-xs font-inter text-content-tertiary">{formatInstantDate(points[points.length - 1]?.date ?? '')}</Text>
      </View>
    </View>
  )
}

const ExerciseHistoryScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const params = useLocalSearchParams<{ catalogExerciseId?: string; exerciseName?: string }>()

  const catalogExerciseId = parseSingleParam(params.catalogExerciseId)
  const exerciseName = parseSingleParam(params.exerciseName)
  const [period, setPeriod] = useState<StatsPeriod>('30d')

  const { history, isLoading, error, refetch } = useExerciseHistory(catalogExerciseId, exerciseName, period)

  const filteredTimeline = useMemo(() => {
    if (history === null) return []
    const sortedTimeline = sortTimelineByInstant(history.prTimeline)
    return filterTimelineByPeriod(sortedTimeline, period)
  }, [history, period])

  const latestPoint = filteredTimeline[filteredTimeline.length - 1] ?? null

  return (
    <View className="flex-1 bg-background-primary">
      <View
        className="px-5 gap-4"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)/stats' as never))}
            className="w-10 h-10 rounded-full bg-background-secondary items-center justify-center"
          >
            <ChevronLeft size={18} color={Colors.content.primary} />
          </Pressable>
        </View>

        <View className="gap-1">
          <Text className="text-sm font-inter text-content-tertiary">Exercise History</Text>
          <Text className="text-2xl font-onest text-content-primary">
            {exerciseName ?? history?.exerciseName ?? 'Unknown Exercise'}
          </Text>
        </View>

        <PeriodSelector period={period} onChange={setPeriod} />
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 16),
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View className="pt-8 items-center">
            <ActivityIndicator size="large" />
          </View>
        )}

        {error !== null && !isLoading && (
          <View className="bg-background-secondary rounded-3xl p-5 gap-3">
            <Text className="text-base font-inter-semibold text-content-primary">Couldn{`'`}t load exercise history</Text>
            <Text className="text-sm font-inter text-content-secondary">{error}</Text>
            <Pressable className="bg-brand-accent rounded-xl py-3 items-center" onPress={() => { void refetch() }}>
              <Text className="text-sm font-inter-semibold text-background-primary">Retry</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && error === null && history !== null && (
          <View className="gap-4">
            <View className="bg-background-secondary rounded-3xl p-5 gap-4">
              <HistoryChart points={filteredTimeline} width={windowWidth - 62} />

              <View className="flex-row gap-3">
                <View className="flex-1 bg-background-primary rounded-2xl p-3 gap-1">
                  <Text className="text-xs font-inter text-content-tertiary">Current PR</Text>
                  <Text className="text-xl font-inter-bold text-content-primary">{formatCompactNumber(history.currentPr)}</Text>
                </View>
                <View className="flex-1 bg-background-primary rounded-2xl p-3 gap-1">
                  <Text className="text-xs font-inter text-content-tertiary">PR Entries</Text>
                  <Text className="text-xl font-inter-bold text-content-primary">{history.prTimeline.length}</Text>
                </View>
                <View className="flex-1 bg-background-primary rounded-2xl p-3 gap-1">
                  <Text className="text-xs font-inter text-content-tertiary">Latest</Text>
                  <Text className="text-base font-inter-semibold text-content-primary">
                    {latestPoint !== null ? `${latestPoint.weight}kg x ${latestPoint.reps}` : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-background-secondary rounded-3xl p-5 gap-3">
              <Text className="text-base font-inter-semibold text-content-primary">PR Milestones</Text>
              {filteredTimeline.length === 0 && (
                <Text className="text-sm font-inter text-content-secondary">No PR milestones found in selected period.</Text>
              )}
              {filteredTimeline.slice().reverse().map((point) => (
                <View key={point.sessionId} className="bg-background-primary rounded-2xl p-3 flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-inter-semibold text-content-primary">{point.weight}kg x {point.reps}</Text>
                    <Text className="text-xs font-inter text-content-tertiary">{formatInstantDate(point.date)}</Text>
                  </View>
                  <Text className="text-xs font-inter-semibold text-brand-accent">
                    {point.previousWeight !== null ? `+${(point.weight - point.previousWeight).toFixed(1)}kg` : 'First PR'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {!isLoading && error === null && history === null && (
          <View className="bg-background-secondary rounded-3xl p-6">
            <Text className="text-base font-inter-semibold text-content-primary">No history found</Text>
            <Text className="text-sm font-inter text-content-secondary mt-1">
              This exercise does not have tracked PR progress yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default ExerciseHistoryScreen
