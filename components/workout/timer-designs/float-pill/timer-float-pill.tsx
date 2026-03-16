import { useEffect, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { Pause, Play } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

const COLLAPSED_HEIGHT = 44
const EXPANDED_HEIGHT = 160
const SNAP_THRESHOLD = -50

const SPRING_CONFIG = { damping: 20, stiffness: 200 }

const REST_BLUE = Colors.status.rest
const REST_BLUE_BG = 'rgba(2,132,199,0.15)'
const REST_BLUE_BORDER = 'rgba(2,132,199,0.3)'

interface TimerFloatPillProps {
  formatted: string
  elapsedSeconds: number
  isPaused: boolean
  isCompleted: boolean
  completedSets: number
  totalSets: number
  remainingSets: number
  onPause: () => void
  onResume: () => void
  flashTrigger: SharedValue<number>
}

export const TimerFloatPill = ({
  formatted,
  elapsedSeconds,
  isPaused,
  isCompleted,
  completedSets,
  totalSets,
  remainingSets,
  onPause,
  onResume,
  flashTrigger,
}: TimerFloatPillProps) => {
  const expansion = useSharedValue(0)
  const translateY = useSharedValue(0)
  const breatheScale = useSharedValue(1)
  const pauseState = useSharedValue(isPaused ? 1 : 0)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    pauseState.value = withTiming(isPaused ? 1 : 0, { duration: 200 })
  }, [isPaused, pauseState])

  useEffect(() => {
    if (isPaused && !isCompleted) {
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500 }),
          withTiming(1.0, { duration: 1500 })
        ),
        -1,
        true
      )
    } else {
      breatheScale.value = withTiming(1, { duration: 200 })
    }
  }, [isPaused, isCompleted, breatheScale])

  const isExpandedDerived = useDerivedValue(() => expansion.value > 0.5)

  const expand = () => {
    expansion.value = withSpring(1, SPRING_CONFIG)
    setIsExpanded(true)
  }

  const collapse = () => {
    expansion.value = withSpring(0, SPRING_CONFIG)
    setIsExpanded(false)
  }

  const panGesture = Gesture.Pan()
    .enabled(!isCompleted)
    .onUpdate((e) => {
      if (isExpandedDerived.value) {
        translateY.value = Math.max(0, e.translationY)
      } else {
        translateY.value = Math.min(0, e.translationY)
      }
    })
    .onEnd((e) => {
      if (isExpandedDerived.value) {
        if (e.translationY > -SNAP_THRESHOLD) {
          expansion.value = withSpring(0, SPRING_CONFIG)
          runOnJS(setIsExpanded)(false)
        }
      } else {
        if (e.translationY < SNAP_THRESHOLD) {
          expansion.value = withSpring(1, SPRING_CONFIG)
          runOnJS(setIsExpanded)(true)
        }
      }
      translateY.value = withSpring(0, SPRING_CONFIG)
    })

  const handleTogglePause = () => {
    if (isPaused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onResume()
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPause()
    }
  }

  const estimatedRemaining =
    completedSets > 0
      ? Math.ceil((elapsedSeconds / completedSets) * remainingSets / 60)
      : null

  const pillStyle = useAnimatedStyle(() => {
    const height = interpolate(expansion.value, [0, 1], [COLLAPSED_HEIGHT, EXPANDED_HEIGHT])
    const borderRadius = interpolate(expansion.value, [0, 1], [22, 20])

    const bgColor = interpolateColor(
      pauseState.value,
      [0, 1],
      [Colors.background.secondary, REST_BLUE_BG]
    )
    const borderColor = interpolateColor(
      pauseState.value,
      [0, 1],
      [Colors.border.primary, REST_BLUE_BORDER]
    )

    return {
      height,
      borderRadius,
      backgroundColor: bgColor,
      borderColor,
      transform: [{ translateY: translateY.value }, { scale: breatheScale.value }],
    }
  })

  const expandedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0.4, 1], [0, 1]),
    transform: [{ translateY: interpolate(expansion.value, [0.4, 1], [8, 0]) }],
  }))

  const collapsedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 0.3], [1, 0]),
  }))

  const timerTextStyle = useAnimatedStyle(() => {
    const baseColor = interpolateColor(
      pauseState.value,
      [0, 1],
      [Colors.content.primary, REST_BLUE]
    )
    return {
      color: interpolateColor(flashTrigger.value, [0, 1], [baseColor, Colors.brand.accent]),
    }
  })

  const expandedTimerStyle = useAnimatedStyle(() => ({
    color: interpolateColor(flashTrigger.value, [0, 1], [Colors.content.primary, Colors.brand.accent]),
  }))

  return (
    <View
      style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}
      pointerEvents="box-none"
    >
      {/* Tap-outside overlay to collapse when expanded */}
      {!isCompleted && isExpanded && (
        <View
          style={{
            position: 'absolute',
            top: -1000,
            left: -100,
            right: -100,
            bottom: 0,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={collapse} />
        </View>
      )}

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            pillStyle,
            {
              borderWidth: 1,
              borderCurve: 'continuous',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            },
          ]}
        >
          {/* Collapsed content */}
          <Animated.View
            style={[
              collapsedContentStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: COLLAPSED_HEIGHT,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                gap: 8,
              },
            ]}
          >
            {!isCompleted && (
              <Pressable
                onPress={handleTogglePause}
                hitSlop={8}
                style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                accessibilityRole="button"
                accessibilityLabel={isPaused ? 'Resume workout' : 'Pause workout'}
              >
                {isPaused ? (
                  <Play size={18} color={REST_BLUE} pointerEvents="none" />
                ) : (
                  <Pause size={18} color={Colors.content.primary} pointerEvents="none" />
                )}
              </Pressable>
            )}

            <Animated.Text
              style={[timerTextStyle]}
              className="text-sm font-inter-semibold"
            >
              {formatted}
            </Animated.Text>
          </Animated.View>

          {/* Expanded content */}
          <Animated.View
            style={[
              expandedContentStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 18,
                paddingTop: 20,
                gap: 10,
              },
            ]}
            pointerEvents={isExpanded ? 'auto' : 'none'}
          >
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <Animated.Text
                  style={[expandedTimerStyle, { fontSize: 20, fontWeight: '700' }]}
                  className="font-inter-bold"
                >
                  {formatted}
                </Animated.Text>
                <Text
                  className="text-sm font-inter"
                  style={{ color: Colors.content.secondary }}
                >
                  {completedSets}/{totalSets} sets done
                </Text>
                <Text
                  className="text-sm font-inter"
                  style={{ color: Colors.content.tertiary }}
                >
                  {estimatedRemaining !== null
                    ? `~${estimatedRemaining} min remaining`
                    : '\u2014'}
                </Text>
              </View>

              {!isCompleted && (
                <Pressable
                  onPress={() => {
                    handleTogglePause()
                    collapse()
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isPaused ? REST_BLUE : Colors.background.tertiary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isPaused ? 'Resume workout' : 'Pause workout'}
                >
                  {isPaused ? (
                    <Play size={22} color={Colors.content.primary} pointerEvents="none" />
                  ) : (
                    <Pause size={22} color={Colors.content.primary} pointerEvents="none" />
                  )}
                </Pressable>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
