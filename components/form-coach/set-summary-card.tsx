import { Pressable, Text, View } from 'react-native'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

import type { FormSeverity } from '@/types/form-rules'

const SEVERITY_DOT_COLORS: Record<FormSeverity, string> = {
  good: 'bg-lime-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
}

type RepScore = {
  overallSeverity: FormSeverity
}

type SetSummaryCardProps = {
  setNumber: number
  reps: number
  repScores: RepScore[]
  onDismiss: () => void
}

export const SetSummaryCard = ({ setNumber, reps, repScores, onDismiss }: SetSummaryCardProps) => {
  // Find most common issue severity
  const severityCounts: Record<FormSeverity, number> = { good: 0, warning: 0, error: 0 }
  for (const score of repScores) {
    severityCounts[score.overallSeverity] += 1
  }

  return (
    <Animated.View
      entering={SlideInDown.duration(300).springify()}
      exiting={SlideOutDown.duration(200)}
      className="absolute bottom-40 left-4 right-4"
    >
      <Pressable onPress={onDismiss}>
        <View className="bg-zinc-900/95 rounded-2xl px-5 py-4 gap-3 border border-zinc-700">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base font-inter-bold">
              Set {setNumber}
            </Text>
            <Text className="text-zinc-400 text-sm font-inter-medium">
              {reps} reps
            </Text>
          </View>

          {/* Rep quality dots */}
          {repScores.length > 0 && (
            <View className="flex-row gap-1.5 flex-wrap">
              {repScores.map((score, i) => (
                <View
                  key={i}
                  className={`w-3 h-3 rounded-full ${SEVERITY_DOT_COLORS[score.overallSeverity]}`}
                />
              ))}
            </View>
          )}

          <Text className="text-zinc-500 text-xs font-inter-medium">Tap to dismiss</Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}
