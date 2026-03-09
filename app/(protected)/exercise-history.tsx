import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HistoryChart } from '@/components/stats/history-chart'
import { PeriodSelector } from '@/components/stats/shared/period-selector'
import { formatCompactNumber, formatInstantDate } from '@/components/stats/shared/stats-formatters'
import { BackButton } from '@/components/ui/back-button'
import { useExerciseHistory } from '@/hooks/use-stats'
import type { StatsPRTimelinePoint, StatsPeriod } from '@/types/stats'
import { parseUtcInstantMs } from '@/utils/stats-mappers'

const parseSingleParam = (value: string | string[] | undefined) => {
  if (value === undefined) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
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

const sortTimelineByInstant = (timeline: StatsPRTimelinePoint[]): StatsPRTimelinePoint[] =>
  timeline.slice().sort((a, b) => parseUtcInstantMs(a.date) - parseUtcInstantMs(b.date))

const ExerciseHistoryScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ catalogExerciseId?: string; exerciseName?: string }>()

  const catalogExerciseId = parseSingleParam(params.catalogExerciseId)
  const exerciseName = parseSingleParam(params.exerciseName)
  const [period, setPeriod] = useState<StatsPeriod>('30d')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const { history, isLoading, error, refetch } = useExerciseHistory(catalogExerciseId, exerciseName, period)

  const filteredTimeline = (() => {
    if (history === null) return []
    const sortedTimeline = sortTimelineByInstant(history.prTimeline)
    return filterTimelineByPeriod(sortedTimeline, period)
  })()

  const latestPoint = filteredTimeline[filteredTimeline.length - 1] ?? null
  const selectedPoint = (() => {
    if (selectedSessionId === null) return latestPoint
    return filteredTimeline.find((point) => point.sessionId === selectedSessionId) ?? latestPoint
  })()

  useEffect(() => {
    if (filteredTimeline.length === 0) {
      if (selectedSessionId !== null) setSelectedSessionId(null)
      return
    }

    if (selectedSessionId === null || !filteredTimeline.some((point) => point.sessionId === selectedSessionId)) {
      setSelectedSessionId(filteredTimeline[filteredTimeline.length - 1]?.sessionId ?? null)
    }
  }, [filteredTimeline, selectedSessionId])

  return (
    <View className="flex-1 bg-background-primary">
      <View
        className="px-5 gap-4 pb-3"
        style={{
          paddingTop: insets.top + 8,
        }}
      >
        <View className="flex-row items-center justify-between">
          <BackButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)/stats' as never))}
          />
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
          gap: 16,
          paddingBottom: Math.max(insets.bottom, 16),
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
            <Text className="text-base font-inter-semibold text-content-primary">
              Couldn{`'`}t load exercise history
            </Text>
            <Text className="text-sm font-inter text-content-secondary">{error}</Text>
            <Pressable
              className="bg-brand-accent rounded-xl py-3 items-center"
              onPress={() => {
                void refetch()
              }}
            >
              <Text className="text-sm font-inter-semibold text-background-primary">Retry</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && error === null && history !== null && (
          <View className="gap-4">
            <View className="bg-background-secondary rounded-3xl p-5 gap-4">
              <HistoryChart
                points={filteredTimeline}
                selectedSessionId={selectedSessionId}
                onSelectSessionId={setSelectedSessionId}
              />

              <View className="flex-row gap-3">
                <View className="flex-1 bg-background-primary rounded-2xl p-3 gap-1">
                  <Text className="text-xs font-inter text-content-tertiary">Current PR</Text>
                  <Text className="text-xl font-inter-bold text-content-primary">
                    {formatCompactNumber(history.currentPr)}
                  </Text>
                </View>
                <View className="flex-1 bg-background-primary rounded-2xl p-3 gap-1">
                  <Text className="text-xs font-inter text-content-tertiary">PR Entries</Text>
                  <Text className="text-xl font-inter-bold text-content-primary">{history.prTimeline.length}</Text>
                </View>
                <View className="flex-1 bg-background-primary rounded-2xl p-3 gap-1">
                  <Text className="text-xs font-inter text-content-tertiary">
                    {selectedPoint?.sessionId === latestPoint?.sessionId ? 'Latest' : 'Selected'}
                  </Text>
                  <Text className="text-base font-inter-semibold text-content-primary">
                    {selectedPoint !== null ? `${selectedPoint.weight}kg x ${selectedPoint.reps}` : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-background-secondary rounded-3xl p-5 gap-3">
              <Text className="text-base font-inter-semibold text-content-primary">PR Milestones</Text>
              {filteredTimeline.length === 0 && (
                <Text className="text-sm font-inter text-content-secondary">
                  No PR milestones found in selected period.
                </Text>
              )}
              {filteredTimeline
                .slice()
                .reverse()
                .map((point) => (
                  <View
                    key={point.sessionId}
                    className="bg-background-primary rounded-2xl p-3 flex-row items-center justify-between"
                  >
                    <View>
                      <Text className="text-sm font-inter-semibold text-content-primary">
                        {point.weight}kg x {point.reps}
                      </Text>
                      <Text className="text-xs font-inter text-content-tertiary">{formatInstantDate(point.date)}</Text>
                    </View>
                    <Text className="text-xs font-inter-semibold text-brand-accent">
                      {point.previousWeight !== null
                        ? `+${(point.weight - point.previousWeight).toFixed(1)}kg`
                        : 'First PR'}
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
