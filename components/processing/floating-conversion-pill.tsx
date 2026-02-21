import { useEffect } from 'react'
import * as Haptics from 'expo-haptics'
import { useRouter, useSegments } from 'expo-router'
import { Maximize2 } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@/constants/colors'
import { useConversion } from '@/contexts/conversion-context'
import { MiniProgressRing } from '@/components/processing/mini-progress-ring'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const TAB_BAR_HEIGHT = 60

export const FloatingConversionPill = () => {
  const { state, maximize } = useConversion()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const segments = useSegments()
  const scale = useSharedValue(1)
  const celebrationScale = useSharedValue(1)
  const show = useSharedValue(0)

  const isVisible = state.presentation === 'minimized' && state.jobState !== 'idle' && state.jobState !== 'existing'
  const isCompleted = state.jobState === 'completed'
  const isError = state.jobState === 'error'

  const inTabs = segments[0] === '(protected)' && segments[1] === '(tabs)'
  const bottomOffset = insets.bottom + (inTabs ? TAB_BAR_HEIGHT + 12 : 12)

  useEffect(() => {
    show.value = withTiming(isVisible ? 1 : 0, {
      duration: isVisible ? 300 : 200,
      easing: isVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    })
  }, [isVisible, show])

  useEffect(() => {
    if (isCompleted && state.presentation === 'minimized') {
      celebrationScale.value = withSequence(
        withTiming(1.02, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1.0, { duration: 200, easing: Easing.out(Easing.cubic) })
      )
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }, [isCompleted, state.presentation, celebrationScale])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [{ translateY: (1 - show.value) * 16 }],
  }))

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * celebrationScale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    maximize()
    router.push('/(protected)/process-url' as never)
  }

  const accentColor = isError ? '#f87171' : Colors.brand.accent

  const stageText = isCompleted
    ? 'Workout ready! Tap to view'
    : isError
      ? 'Failed — tap to retry'
      : state.message

  const truncatedUrl = state.sourceUrl.length > 30
    ? `${state.sourceUrl.slice(0, 30)}...`
    : state.sourceUrl

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[
        containerStyle,
        {
          position: 'absolute',
          bottom: bottomOffset,
          left: 16,
          right: 16,
        },
      ]}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={stageText}
        style={[
          pressStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.background.secondary,
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingVertical: 12,
            paddingHorizontal: 14,
            gap: 12,
            borderWidth: 1,
            borderColor: isError ? 'rgba(248,113,113,0.3)' : Colors.border.primary,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        ]}
      >
        <MiniProgressRing
          progress={state.progress}
          platform={state.platform}
          isCompleted={isCompleted}
          isError={isError}
        />

        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="text-sm font-inter-medium"
            style={{ color: isCompleted ? accentColor : Colors.content.primary }}
          >
            {stageText}
          </Text>
          <Text
            numberOfLines={1}
            className="text-xs font-inter text-content-tertiary"
          >
            {truncatedUrl}
          </Text>
        </View>

        <Maximize2 size={18} color={Colors.content.secondary} pointerEvents="none" />
      </AnimatedPressable>
    </Animated.View>
  )
}
