import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'

import type { ProcessingState } from '@/types/processing'
import { PlatformBadge } from '@/components/processing/platform-badge'
import { StageIndicator } from '@/components/processing/stage-indicator'

interface ProcessingStagesProps {
  state: ProcessingState
  onCancel: () => void
}

const STAGE_LABELS = [
  { key: 'validating', label: 'Validating URL' },
  { key: 'downloading', label: 'Downloading audio' },
  { key: 'transcribing', label: 'Transcribing with AI' },
  { key: 'extracting', label: 'Extracting workout' },
] as const

const getStageStatus = (stageKey: string, currentStage: string): 'pending' | 'active' | 'completed' => {
  const order = STAGE_LABELS.map((s) => s.key)
  const currentIdx = order.indexOf(currentStage as typeof order[number])
  const stageIdx = order.indexOf(stageKey as typeof order[number])

  if (currentStage === 'complete' || currentStage === 'error') {
    return stageIdx <= order.length - 1 ? 'completed' : 'pending'
  }

  if (stageIdx < currentIdx) return 'completed'
  if (stageIdx === currentIdx) return 'active'
  return 'pending'
}

export const ProcessingStages = ({ state, onCancel }: ProcessingStagesProps) => {
  const progressWidth = useSharedValue(0)

  useEffect(() => {
    progressWidth.value = withTiming(state.progress, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    })
  }, [state.progress, progressWidth])

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))

  // Truncate URL for display
  const displayUrl = state.sourceUrl.length > 40
    ? `${state.sourceUrl.slice(0, 40)}...`
    : state.sourceUrl

  return (
    <View className="flex-1 px-6 pt-8">
      <View className="flex-row items-center gap-3 mb-8">
        <PlatformBadge platform={state.platform} size={36} />
        <Text className="text-sm font-inter text-content-secondary flex-1" numberOfLines={1}>
          {displayUrl}
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-background-tertiary rounded-full overflow-hidden mb-8">
        <Animated.View
          className="h-full bg-brand-accent rounded-full"
          style={progressStyle}
        />
      </View>

      <Text className="text-lg font-inter-semibold text-content-primary mb-4">
        {state.message}
      </Text>

      {/* Stage list */}
      <View className="mb-8">
        {STAGE_LABELS.map(({ key, label }) => (
          <StageIndicator
            key={key}
            label={label}
            status={
              state.stage === 'complete'
                ? 'completed'
                : getStageStatus(key, state.stage)
            }
          />
        ))}
      </View>

      <View className="mt-auto pb-4">
        <Pressable onPress={onCancel} className="items-center py-3">
          <Text className="text-base font-inter text-content-secondary">Cancel</Text>
        </Pressable>
      </View>
    </View>
  )
}
