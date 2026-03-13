import { Check } from 'lucide-react-native'
import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import type { FormIssue, FormSeverity } from '@/types/form-rules'

const SEVERITY_COLORS: Record<FormSeverity, string> = {
  good: 'bg-lime-500/90',
  warning: 'bg-yellow-500/90',
  error: 'bg-red-500/90',
}

type FormFeedbackOverlayProps = {
  issues: FormIssue[]
}

export const FormFeedbackOverlay = ({ issues }: FormFeedbackOverlayProps) => {
  const primary = issues[0]
  const secondary = issues[1]
  const isGood = issues.length === 0

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      className="absolute bottom-32 left-4 right-4 items-center gap-2"
      pointerEvents="none"
    >
      {/* Primary pill */}
      {isGood && (
        <View className={`${SEVERITY_COLORS.good} rounded-full px-5 py-2.5 flex-row items-center gap-2`}>
          <Check size={16} color="#000" pointerEvents="none" />
          <Text className="text-black text-sm font-inter-bold">Good Form</Text>
        </View>
      )}

      {primary !== undefined && (
        <View className={`${SEVERITY_COLORS[primary.severity]} rounded-full px-5 py-2.5`}>
          <Text className="text-black text-sm font-inter-bold">{primary.message}</Text>
        </View>
      )}

      {/* Secondary pill (smaller) */}
      {secondary !== undefined && (
        <View className={`${SEVERITY_COLORS[secondary.severity]} rounded-full px-4 py-1.5 opacity-80`}>
          <Text className="text-black text-xs font-inter-medium">{secondary.message}</Text>
        </View>
      )}
    </Animated.View>
  )
}
