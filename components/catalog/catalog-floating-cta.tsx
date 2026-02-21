import { useEffect } from 'react'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@/constants/colors'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface CatalogFloatingCtaProps {
  selectedCount: number
}

export const CatalogFloatingCta = ({ selectedCount }: CatalogFloatingCtaProps) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const scale = useSharedValue(1)
  const isVisible = selectedCount > 0
  const show = useSharedValue(isVisible ? 1 : 0)

  useEffect(() => {
    show.value = withTiming(isVisible ? 1 : 0, {
      duration: isVisible ? 300 : 200,
      easing: isVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    })
  }, [isVisible, show])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [{ translateY: (1 - show.value) * 16 }],
  }))

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(protected)/workout-builder' as never)
  }

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[
        containerStyle,
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 8,
          paddingTop: 16,
        },
      ]}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Build workout with ${selectedCount} exercises`}
        style={[
          pressStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.brand.accent,
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingVertical: 16,
            paddingHorizontal: 24,
            gap: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: Colors.background.primary,
            borderRadius: 10,
            minWidth: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 6,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'Inter_700Bold',
              color: Colors.brand.accent,
              fontVariant: ['tabular-nums'],
            }}
          >
            {selectedCount}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Inter_600SemiBold',
            color: Colors.background.primary,
            letterSpacing: -0.2,
          }}
        >
          Build Workout
        </Text>

        <ArrowRight size={18} color={Colors.background.primary} pointerEvents="none" />
      </AnimatedPressable>
    </Animated.View>
  )
}
