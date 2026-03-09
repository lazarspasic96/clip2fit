import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as SplashScreen from 'expo-splash-screen'

import { Colors } from '@/constants/colors'

interface AnimatedSplashOverlayProps {
  isAppReady: boolean
  onAnimationComplete: () => void
}

export const AnimatedSplashOverlay = ({
  isAppReady,
  onAnimationComplete,
}: AnimatedSplashOverlayProps) => {
  const logoOpacity = useSharedValue(1)
  const logoScale = useSharedValue(1)
  const overlayOpacity = useSharedValue(1)

  useEffect(() => {
    if (!isAppReady) return

    // Hold 200ms → bump → settle → dissolve expand
    logoScale.value = withSequence(
      withDelay(200, withSpring(1.08, { damping: 8, stiffness: 200 })),
      withSpring(1, { damping: 12, stiffness: 120 }),
      withTiming(1.5, { duration: 400 }),
    )

    // Overlay dissolve (starts at ~500ms)
    overlayOpacity.value = withDelay(
      500,
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)()
        }
      }),
    )
  }, [isAppReady, logoOpacity, logoScale, overlayOpacity, onAnimationComplete])

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const handleLayout = () => {
    SplashScreen.hideAsync()
  }

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle]}
      pointerEvents="none"
      onLayout={handleLayout}
    >
      <Animated.View style={logoStyle}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logoImage}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
})
