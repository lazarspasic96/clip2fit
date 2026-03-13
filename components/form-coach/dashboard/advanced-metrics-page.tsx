import { Text, View } from 'react-native'

import type { FormSeverity } from '@/types/form-rules'
import { formSessionStore } from '@/stores/form-session-store'

import { BarbellMiniChart } from './barbell-mini-chart'

const SEVERITY_DOT_COLORS: Record<FormSeverity, string> = {
  good: 'bg-lime-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
}

type AdvancedMetricsPageProps = {
  debugAngles: Record<string, number>
  barbellPath: { x: number; y: number }[]
  barbellDrifting: boolean
  isBarbell: boolean
  skippedChecks: string[]
  isLandscape: boolean
}

export const AdvancedMetricsPage = ({
  debugAngles,
  barbellPath,
  barbellDrifting,
  isBarbell,
  skippedChecks,
  isLandscape,
}: AdvancedMetricsPageProps) => {
  const session = formSessionStore.getSession()
  const currentSet = session?.currentSet
  const repScores = currentSet?.repScores ?? []

  return (
    <View className={`flex-1 px-3 py-2 gap-2 ${isLandscape ? '' : ''}`}>
      {/* Barbell chart */}
      {isBarbell && (
        <View className="gap-1">
          <Text className="text-zinc-500 text-[10px] font-inter-medium uppercase tracking-wider">
            Barbell Path
          </Text>
          <BarbellMiniChart path={barbellPath} isDrifting={barbellDrifting} />
        </View>
      )}

      {/* All angles */}
      {Object.keys(debugAngles).length > 0 && (
        <View className="gap-1">
          <Text className="text-zinc-500 text-[10px] font-inter-medium uppercase tracking-wider">
            All Angles
          </Text>
          {Object.entries(debugAngles).map(([name, value]) => (
            <View key={name} className="flex-row items-center justify-between">
              <Text className="text-zinc-400 text-xs font-inter-medium">{name}</Text>
              <Text className="text-white text-xs font-mono">{Math.round(value)}°</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skipped checks */}
      {skippedChecks.length > 0 && (
        <View className="gap-1">
          <Text className="text-zinc-500 text-[10px] font-inter-medium uppercase tracking-wider">
            Skipped
          </Text>
          <Text className="text-yellow-500/70 text-xs font-inter-medium">
            {skippedChecks.join(', ')}
          </Text>
        </View>
      )}

      {/* Rep quality dots */}
      {repScores.length > 0 && (
        <View className="gap-1 mt-auto">
          <Text className="text-zinc-500 text-[10px] font-inter-medium uppercase tracking-wider">
            Rep Quality
          </Text>
          <View className="flex-row gap-1.5 flex-wrap">
            {repScores.map((score, i) => (
              <View
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${SEVERITY_DOT_COLORS[score.overallSeverity]}`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
