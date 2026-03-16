import * as Haptics from 'expo-haptics'
import { Pause, Play } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

import { BackButton } from '@/components/ui/back-button'
import { Colors } from '@/constants/colors'

interface PulseTickerHeaderProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
  title: string
  isPaused: boolean
  formatted: string
  onPause: () => void
  onResume: () => void
  flashTrigger: SharedValue<number>
  isCompleted: boolean
}

const COLLAPSED_HEIGHT = 48
const EXPANDED_HEIGHT = 96
const ANIMATION_DURATION = 300

const COLOR_SECONDARY = Colors.content.secondary
const COLOR_REST_BLUE = Colors.status.rest
const COLOR_LIME = Colors.brand.accent

export const PulseTickerHeader = ({
  onBack,
  onFinish,
  isEditMode,
  title,
  isPaused,
  formatted,
  onPause,
  onResume,
  flashTrigger,
  isCompleted,
}: PulseTickerHeaderProps) => {
  const [expanded, setExpanded] = useState(false)

  const handleTimerPress = () => {
    if (isCompleted) return
    setExpanded((prev) => !prev)
  }

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPause()
  }

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onResume()
  }

  // Animate container height
  const heightStyle = useAnimatedStyle(() => ({
    height: withTiming(expanded && !isCompleted ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, {
      duration: ANIMATION_DURATION,
    }),
  }))

  // Shared value for pause state to safely use in worklets
  const pauseProgress = useSharedValue(isPaused ? 1 : 0)
  const breathingScale = useSharedValue(1)

  useEffect(() => {
    pauseProgress.value = withTiming(isPaused ? 1 : 0, { duration: 300 })
    if (isPaused && !isCompleted) {
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000 }),
          withTiming(1.0, { duration: 1000 })
        ),
        -1,
        true
      )
    } else {
      breathingScale.value = withTiming(1.0, { duration: 200 })
    }
  }, [isPaused, isCompleted, pauseProgress, breathingScale])

  // Timer text animated style: color (pause/flash) + breathing scale
  const timerTextStyle = useAnimatedStyle(() => {
    // Flash overrides pause color: lime when flashTrigger > 0
    const baseColor = interpolateColor(
      pauseProgress.value,
      [0, 1],
      [COLOR_SECONDARY, COLOR_REST_BLUE]
    )
    const flashColor = interpolateColor(
      flashTrigger.value,
      [0, 1],
      [baseColor, COLOR_LIME]
    )

    return {
      color: flashColor,
      transform: [{ scale: breathingScale.value }],
    }
  })

  // Controls row opacity for expand/collapse
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(expanded && !isCompleted ? 1 : 0, { duration: ANIMATION_DURATION }),
  }))

  return (
    <Animated.View style={heightStyle} className="overflow-hidden">
      {/* Top row: back / timer / finish */}
      <View className="flex-row items-center justify-between px-4 h-12">
        <BackButton onPress={onBack} />

        <Pressable onPress={handleTimerPress} hitSlop={12} className="flex-1 items-center">
          <Animated.Text
            style={timerTextStyle}
            className="text-lg font-inter-bold tracking-wider"
          >
            {formatted}
          </Animated.Text>
        </Pressable>

        <Pressable onPress={onFinish} hitSlop={8}>
          <Text className="text-sm font-inter-semibold text-brand-accent">
            {isEditMode === true ? 'Save' : 'Finish'}
          </Text>
        </Pressable>
      </View>

      {/* Expanded controls row */}
      {!isCompleted && (
        <Animated.View style={controlsStyle} className="items-center pb-1">
          {isPaused ? (
            <Pressable
              onPress={handleResume}
              className="flex-row items-center gap-1.5 bg-background-tertiary rounded-full px-4 py-1.5"
            >
              <Play size={14} color={Colors.content.primary} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-content-primary">Resume</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePause}
              className="flex-row items-center gap-1.5 bg-background-tertiary rounded-full px-4 py-1.5"
            >
              <Pause size={14} color={Colors.content.primary} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-content-primary">Pause</Text>
            </Pressable>
          )}
        </Animated.View>
      )}

      {/* Subtitle */}
      <Text
        className="text-xs font-inter text-content-tertiary text-center px-4"
        numberOfLines={1}
      >
        {title}
      </Text>
    </Animated.View>
  )
}
