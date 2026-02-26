import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { formatCompactNumber } from '@/components/stats/shared/stats-formatters'
import type { StatsOverviewProps } from '@/components/stats/shared/stats-view-types'
import { TopExerciseCard } from '@/components/stats/shared/top-exercise-card'
import { formatMuscleLabel } from '@/types/stats'
import { getMuscleColor } from '@/utils/muscle-color'

export const PerformanceLabOverview = ({ summary, onPressExercise }: StatsOverviewProps) => {
  const muscleRows = useMemo(() => {
    const sorted = summary.muscleGroupDistribution
      .slice()
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6)

    const maxPercent = sorted[0]?.percentage ?? 0

    return sorted.map((muscle) => {
      const relativePercent = maxPercent > 0 ? (muscle.percentage / maxPercent) * 100 : 0
      return {
        muscle,
        color: getMuscleColor(muscle.muscleGroup),
        relativePercent,
      }
    })
  }, [summary.muscleGroupDistribution])

  const topMuscle = muscleRows[0]?.muscle ?? null

  return (
    <View className="px-5 gap-4">
      <View className="bg-background-secondary rounded-2xl p-4 gap-4 border border-border-secondary">
        <Text className="text-xs font-inter uppercase text-content-tertiary">Performance Lab</Text>
        <View className="flex-row flex-wrap gap-3">
          <View className="bg-background-primary rounded-xl p-3 gap-1 w-[48%]">
            <Text className="text-xs font-inter text-content-tertiary">Sessions</Text>
            <Text className="text-xl font-inter-bold text-content-primary">{summary.totalSessions}</Text>
          </View>
          <View className="bg-background-primary rounded-xl p-3 gap-1 w-[48%]">
            <Text className="text-xs font-inter text-content-tertiary">Volume</Text>
            <Text className="text-xl font-inter-bold text-content-primary">{formatCompactNumber(summary.totalVolume)}</Text>
          </View>
          <View className="bg-background-primary rounded-xl p-3 gap-1 w-[48%]">
            <Text className="text-xs font-inter text-content-tertiary">Current Streak</Text>
            <Text className="text-xl font-inter-bold text-content-primary">{summary.currentStreakWeeks}w</Text>
          </View>
          <View className="bg-background-primary rounded-xl p-3 gap-1 w-[48%]">
            <Text className="text-xs font-inter text-content-tertiary">Best Streak</Text>
            <Text className="text-xl font-inter-bold text-content-primary">{summary.bestStreakWeeks}w</Text>
          </View>
        </View>
      </View>

      <View className="bg-background-secondary rounded-2xl p-4 gap-4 border border-border-secondary">
        <Text className="text-base font-inter-semibold text-content-primary">Top Exercises</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {summary.topExercises.slice(0, 6).map((exercise, index) => (
            <View key={exercise.exerciseName} className="w-[190px]">
              <TopExerciseCard
                exercise={exercise}
                index={index}
                tone="lab"
                onPress={onPressExercise}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="bg-background-secondary rounded-2xl p-4 gap-4 border border-border-secondary">
        <View className="gap-1">
          <Text className="text-base font-inter-semibold text-content-primary">Muscle Focus</Text>
          <Text className="text-xs font-inter text-content-tertiary">
            {topMuscle !== null
              ? `Top focus: ${formatMuscleLabel(topMuscle.muscleGroup)} (${topMuscle.percentage.toFixed(1)}%)`
              : 'Complete workouts to unlock muscle focus breakdown.'}
          </Text>
        </View>

        <View className="gap-3">
          {muscleRows.map((row) => (
            <View key={row.muscle.muscleGroup} className="gap-1.5">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-2 flex-1 min-w-0">
                  <View className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                  <Text numberOfLines={1} className="text-sm font-inter text-content-secondary">
                    {formatMuscleLabel(row.muscle.muscleGroup)}
                  </Text>
                </View>
                <Text className="text-xs font-inter-semibold text-content-primary">
                  {row.muscle.percentage.toFixed(1)}%
                </Text>
              </View>
              <View className="h-2 rounded-full bg-background-primary overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(6, row.relativePercent))}%`,
                    backgroundColor: row.color,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
