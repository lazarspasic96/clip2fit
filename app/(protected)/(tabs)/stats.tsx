import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PerformanceLabOverview } from '@/components/stats/design-c-performance-lab/overview'
import { EmptyStatsState } from '@/components/stats/empty-stats-state'
import { StatsLoadingSkeletons } from '@/components/stats/shared/loading-skeletons'
import { PeriodSelector } from '@/components/stats/shared/period-selector'
import { StatsHeader } from '@/components/stats/shared/stats-header'
import { Colors } from '@/constants/colors'

import { useStatsSummary } from '@/hooks/use-stats'
import type { StatsPeriod, StatsTopExercise } from '@/types/stats'

const TAB_BAR_CLEARANCE = 64

const StatsScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [period, setPeriod] = useState<StatsPeriod>('30d')
  const { summary, isLoading, isRefetching, error, refetch } = useStatsSummary(period)
  const totalSessions = summary?.totalSessions ?? 0

  const subtitle = useMemo(() => {
    if (summary === null) return 'Track top exercises, muscle focus, and progression trends.'
    if (totalSessions <= 0) return 'Complete workouts to unlock your training analytics.'
    return `${totalSessions} sessions analyzed for this period.`
  }, [summary, totalSessions])

  const handlePressExercise = (exercise: StatsTopExercise) => {
    const params = new URLSearchParams()
    params.set('exerciseName', exercise.exerciseName)
    if (exercise.catalogExerciseId !== null) params.set('catalogExerciseId', exercise.catalogExerciseId)
    router.push(`/(protected)/exercise-history?${params.toString()}` as never)
  }

  return (
    <View className="flex-1 bg-background-primary">
      <View
        className="gap-4"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
        }}
      >
        <StatsHeader subtitle={subtitle} />
        <View className="px-5">
          <PeriodSelector period={period} onChange={setPeriod} />
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={Colors.content.secondary}
          />
        }
      >
        {isLoading && <StatsLoadingSkeletons />}

        {error !== null && !isLoading && (
          <View className="mx-5 bg-background-secondary rounded-3xl p-5 gap-3">
            <Text className="text-base font-inter-semibold text-content-primary">Couldn{`'`}t load stats</Text>
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

        {!isLoading && error === null && summary !== null && totalSessions <= 0 && (
          <EmptyStatsState onPrimaryAction={() => router.push('/(protected)/add-workout')} />
        )}

        {!isLoading && error === null && summary !== null && totalSessions > 0 && (
          <PerformanceLabOverview summary={summary} onPressExercise={handlePressExercise} />
        )}
      </ScrollView>
    </View>
  )
}

export default StatsScreen
