import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import type { ProcessingState } from '@/types/processing'
import { HeroProgressRing } from '@/components/processing/hero-progress-ring'
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
  const displayUrl = state.sourceUrl.length > 40
    ? `${state.sourceUrl.slice(0, 40)}...`
    : state.sourceUrl

  return (
    <View className="flex-1 items-center pt-12">
      {/* Background gradient glow */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          experimental_backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(132,204,22,0.06) 0%, transparent 60%)',
        }}
        pointerEvents="none"
      />

      {/* Hero ring */}
      <Animated.View entering={FadeIn.duration(300)}>
        <HeroProgressRing
          progress={state.progress}
          platform={state.platform}
          stage={state.stage}
        />
      </Animated.View>

      {/* Stage message + URL */}
      <View className="mt-8 items-center gap-1 px-6">
        <Text className="text-lg font-inter-semibold text-content-primary text-center">
          {state.message}
        </Text>
        <Text
          numberOfLines={1}
          className="text-[13px] font-inter text-content-tertiary text-center"
        >
          {displayUrl}
        </Text>
      </View>

      {/* Stage timeline */}
      <View className="mt-10 self-stretch px-6">
        {STAGE_LABELS.map(({ key, label }, index) => (
          <StageIndicator
            key={key}
            label={label}
            index={index}
            status={
              state.stage === 'complete'
                ? 'completed'
                : getStageStatus(key, state.stage)
            }
          />
        ))}
      </View>

      {/* Cancel button */}
      <View className="mt-auto pb-4">
        <Pressable onPress={onCancel} className="items-center py-3">
          <Text className="text-base font-inter text-content-secondary">
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
