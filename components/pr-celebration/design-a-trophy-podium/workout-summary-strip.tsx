import { Clock, Dumbbell, Flame, Repeat } from 'lucide-react-native'
import { Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'

import { formatCompactNumber } from '@/components/stats/shared/stats-formatters'
import type { WorkoutSummary } from '@/components/pr-celebration/shared/workout-summary-builder'
import { Colors } from '@/constants/colors'

interface WorkoutSummaryStripProps {
  summary: WorkoutSummary
  entryDelay: number
}

const METRICS = [
  { key: 'duration', icon: Clock, getValue: (s: WorkoutSummary) => `${s.durationMinutes}m` },
  { key: 'volume', icon: Flame, getValue: (s: WorkoutSummary) => formatCompactNumber(s.totalVolume) },
  { key: 'exercises', icon: Dumbbell, getValue: (s: WorkoutSummary) => String(s.exercisesCompleted) },
  { key: 'sets', icon: Repeat, getValue: (s: WorkoutSummary) => String(s.setsCompleted) },
] as const

export const WorkoutSummaryStrip = ({ summary, entryDelay }: WorkoutSummaryStripProps) => (
  <Animated.View entering={FadeInUp.delay(entryDelay).duration(400)}>
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
      }}
    >
      {METRICS.map(({ key, icon: Icon, getValue }) => (
        <View
          key={key}
          style={{
            flex: 1,
            backgroundColor: Colors.background.secondary,
            borderRadius: 16,
            padding: 12,
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: Colors.border.primary,
            borderCurve: 'continuous',
          }}
        >
          <Icon size={16} color={Colors.content.tertiary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter-Bold',
              color: Colors.content.primary,
              fontVariant: ['tabular-nums'],
            }}
          >
            {getValue(summary)}
          </Text>
        </View>
      ))}
    </View>
  </Animated.View>
)
