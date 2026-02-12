import { type ReactNode } from 'react'
import { Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const SCREEN_WIDTH = Dimensions.get('window').width
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 }

interface SwipeableRowProps {
  children: ReactNode
  actionWidth?: number
  actionContent: ReactNode
  onAction: () => void
  enabled?: boolean
  onOpen?: () => void
}

export const SwipeableRow = ({
  children,
  actionWidth = 80,
  actionContent,
  onAction,
  enabled = true,
  onOpen,
}: SwipeableRowProps) => {
  const translateX = useSharedValue(0)
  const contextX = useSharedValue(0)
  const isOpen = useSharedValue(false)
  const didCrossThreshold = useSharedValue(false)

  const threshold = actionWidth * 0.3

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const notifyOpen = () => {
    onOpen?.()
  }

  const triggerAction = () => {
    onAction()
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .enabled(enabled)
    .onStart(() => {
      contextX.value = translateX.value
      didCrossThreshold.value = false
    })
    .onUpdate((e) => {
      const newX = contextX.value + e.translationX
      // Only allow left swipe, clamp between -screenWidth and 0
      translateX.value = Math.max(Math.min(newX, 0), -SCREEN_WIDTH)

      // Haptic when crossing threshold
      if (Math.abs(translateX.value) >= threshold && !didCrossThreshold.value) {
        didCrossThreshold.value = true
        runOnJS(triggerHaptic)()
      } else if (Math.abs(translateX.value) < threshold && didCrossThreshold.value) {
        didCrossThreshold.value = false
      }
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) >= threshold) {
        translateX.value = withSpring(-actionWidth, SPRING_CONFIG)
        isOpen.value = true
        runOnJS(notifyOpen)()
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG)
        isOpen.value = false
      }
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    borderTopRightRadius: interpolate(translateX.value, [0, -actionWidth], [16, 0], 'clamp'),
    borderBottomRightRadius: interpolate(translateX.value, [0, -actionWidth], [16, 0], 'clamp'),
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  }))

  const actionStyle = useAnimatedStyle(() => ({
    width: Math.abs(translateX.value),
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  }))

  // Close the row programmatically
  const close = () => {
    translateX.value = withSpring(0, SPRING_CONFIG)
    isOpen.value = false
  }

  return (
    <Animated.View style={{ position: 'relative' }}>
      {/* Action behind */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          },
          actionStyle,
        ]}
      >
        <Animated.View
          style={{ width: actionWidth, height: '100%', justifyContent: 'center', alignItems: 'center' }}
          onTouchEnd={() => {
            close()
            triggerAction()
          }}
        >
          {actionContent}
        </Animated.View>
      </Animated.View>

      {/* Swipeable card */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ borderCurve: 'continuous', overflow: 'hidden' }, cardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}
