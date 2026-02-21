import Svg, { Circle, Polygon } from 'react-native-svg'
import { ScrollView, Text, View } from 'react-native'

import { formatCompactNumber } from '@/components/stats/shared/stats-formatters'
import type { StatsOverviewProps } from '@/components/stats/shared/stats-view-types'
import { TopExerciseCard } from '@/components/stats/shared/top-exercise-card'
import { Colors } from '@/constants/colors'
import { formatMuscleLabel } from '@/types/stats'

const RADAR_SIZE = 210
const RADAR_RADIUS = 82
const RADAR_CENTER = RADAR_SIZE / 2

const MUSCLE_COLORS = [
  Colors.chart.lime,
  Colors.chart.cyan,
  Colors.chart.blue,
  Colors.chart.amber,
  Colors.chart.pink,
  Colors.chart.purple,
]

const toRadarPoint = (angle: number, radius: number) => {
  const x = RADAR_CENTER + radius * Math.cos(angle)
  const y = RADAR_CENTER + radius * Math.sin(angle)
  return { x, y }
}

export const PerformanceLabOverview = ({ summary, onPressExercise }: StatsOverviewProps) => {
  const muscles = summary.muscleGroupDistribution.slice(0, 6)
  const maxPercent = muscles[0]?.percentage ?? 1

  const radarRows = muscles.map((muscle, index) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / Math.max(1, muscles.length)
    const ratio = maxPercent > 0 ? muscle.percentage / maxPercent : 0
    const valuePoint = toRadarPoint(angle, RADAR_RADIUS * ratio)
    const outerPoint = toRadarPoint(angle, RADAR_RADIUS)
    return {
      muscle,
      angle,
      ratio,
      valuePoint,
      outerPoint,
      color: MUSCLE_COLORS[index % MUSCLE_COLORS.length] ?? '#84cc16',
    }
  })

  const renderRadar = () => (
    <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
      <Circle cx={RADAR_CENTER} cy={RADAR_CENTER} r={RADAR_RADIUS} fill="none" stroke="#3f3f46" strokeWidth={1} />
      <Circle cx={RADAR_CENTER} cy={RADAR_CENTER} r={RADAR_RADIUS * 0.55} fill="none" stroke="#3f3f46" strokeWidth={1} />
      {radarRows.map((row, index) => {
        const next = radarRows[(index + 1) % Math.max(1, radarRows.length)]
        if (next === undefined) return null
        return (
          <Polygon
            key={`slice-${row.muscle.muscleGroup}`}
            points={`${RADAR_CENTER},${RADAR_CENTER} ${row.valuePoint.x},${row.valuePoint.y} ${next.valuePoint.x},${next.valuePoint.y}`}
            fill={row.color}
            fillOpacity={0.2}
            stroke={row.color}
            strokeOpacity={0.5}
            strokeWidth={1}
          />
        )
      })}
      {radarRows.map((row) => (
        <Circle
          key={`dot-${row.muscle.muscleGroup}`}
          cx={row.valuePoint.x}
          cy={row.valuePoint.y}
          r={4}
          fill={row.color}
        />
      ))}
    </Svg>
  )

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

      <View className="bg-background-secondary rounded-2xl p-4 gap-4 border border-border-secondary items-center">
        <Text className="text-base font-inter-semibold text-content-primary self-start">Muscle Radar</Text>
        <View className="items-center justify-center">
          {renderRadar()}
        </View>
        <View className="w-full gap-2">
          {radarRows.map((row) => (
            <View key={row.muscle.muscleGroup} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                <Text className="text-xs font-inter text-content-secondary">
                  {formatMuscleLabel(row.muscle.muscleGroup)}
                </Text>
              </View>
              <Text className="text-xs font-inter-semibold text-content-primary">
                {row.muscle.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
