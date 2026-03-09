import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { HeroProgressRing } from '@/components/processing/hero-progress-ring'
import { getStageSubtitle } from '@/contexts/conversion-context'
import type { ProcessingState } from '@/types/processing'

interface ProcessingStagesProps {
  state: ProcessingState
}

export const ProcessingStages = ({ state }: ProcessingStagesProps) => {
  const displayUrl = state.sourceUrl.length > 40 ? `${state.sourceUrl.slice(0, 40)}...` : state.sourceUrl

  return (
    <View className="flex-1 items-center pt-6">
      {/* Hero ring */}
      <Animated.View entering={FadeIn.duration(300)}>
        <HeroProgressRing targetProgress={state.progress} platform={state.platform} stage={state.stage} />
      </Animated.View>

      {/* Crossfade message area */}
      <View className="mt-14 items-center px-6" style={{ minHeight: 56 }}>
        <Animated.View
          key={state.stage}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="items-center gap-1"
        >
          <Text className="text-lg font-inter-semibold text-content-primary text-center">
            {state.message}
          </Text>
          <Text className="text-sm font-inter text-content-tertiary text-center">
            {getStageSubtitle(state.stage)}
          </Text>
        </Animated.View>
      </View>

      {/* Source URL */}
      <View className="mt-4 items-center px-6">
        <Text numberOfLines={1} className="text-[13px] font-inter text-content-tertiary text-center">
          {displayUrl}
        </Text>
      </View>
    </View>
  )
}
