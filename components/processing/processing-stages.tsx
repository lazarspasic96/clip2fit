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
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 48 }}>
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
      <View style={{ marginTop: 32, alignItems: 'center', gap: 4, paddingHorizontal: 24 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Inter_600SemiBold',
            color: '#fafafa',
            textAlign: 'center',
          }}
        >
          {state.message}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontFamily: 'Inter_400Regular',
            color: '#71717a',
            textAlign: 'center',
          }}
        >
          {displayUrl}
        </Text>
      </View>

      {/* Stage timeline */}
      <View style={{ marginTop: 40, alignSelf: 'stretch', paddingHorizontal: 24 }}>
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
      <View style={{ marginTop: 'auto', paddingBottom: 16 }}>
        <Pressable onPress={onCancel} style={{ alignItems: 'center', paddingVertical: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_400Regular',
              color: '#a1a1aa',
            }}
          >
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
