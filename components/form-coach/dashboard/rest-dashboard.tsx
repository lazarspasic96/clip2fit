import { Text, View } from 'react-native'

import type { FormSeverity } from '@/types/form-rules'

const SEVERITY_DOT_COLORS: Record<FormSeverity, string> = {
  good: 'bg-lime-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
}

type RepScore = {
  overallSeverity: FormSeverity
}

type SetData = {
  reps: number
  repScores: RepScore[]
  formSamples: { worstSeverity: FormSeverity }[]
}

type RestDashboardProps = {
  setNumber: number
  lastSet: SetData | null
}

export const RestDashboard = ({ setNumber, lastSet }: RestDashboardProps) => {
  if (lastSet === null) return null

  // Average form quality
  const goodCount = lastSet.formSamples.filter((s) => s.worstSeverity === 'good').length
  const totalSamples = lastSet.formSamples.length
  const formPct = totalSamples > 0 ? Math.round((goodCount / totalSamples) * 100) : 0

  return (
    <View className="flex-1 px-3 py-2 gap-2">
      {/* Set header */}
      <View className="flex-row items-center gap-2">
        <Text className="text-white text-sm font-inter-bold">
          Set {setNumber} Complete
        </Text>
        <Text className="text-zinc-400 text-sm font-inter-medium">
          — {lastSet.reps} reps
        </Text>
      </View>

      {/* Rep quality dots */}
      {lastSet.repScores.length > 0 && (
        <View className="flex-row gap-1.5 flex-wrap">
          {lastSet.repScores.map((score, i) => (
            <View
              key={i}
              className={`w-3 h-3 rounded-full ${SEVERITY_DOT_COLORS[score.overallSeverity]}`}
            />
          ))}
        </View>
      )}

      {/* Form quality */}
      <Text className="text-zinc-400 text-xs font-inter-medium">
        Good form: {formPct}% of frames
      </Text>

      {/* Resume prompt */}
      <Text className="text-zinc-500 text-xs font-inter-medium mt-auto">
        Start moving to resume
      </Text>
    </View>
  )
}
