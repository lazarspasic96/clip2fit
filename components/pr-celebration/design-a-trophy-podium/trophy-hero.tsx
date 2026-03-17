import { Trophy } from 'lucide-react-native'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

interface TrophyHeroProps {
  prCount: number
}

export const TrophyHero = ({ prCount }: TrophyHeroProps) => {
  const iconScale = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const textTranslateY = useSharedValue(12)

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 12, stiffness: 120 })
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }))
    textTranslateY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 100 }))
  }, [iconScale, textOpacity, textTranslateY])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }))

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <Animated.View
        style={[
          {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(132, 204, 22, 0.12)',
            alignItems: 'center',
            justifyContent: 'center',
            borderCurve: 'continuous',
          },
          iconStyle,
        ]}
      >
        <Trophy size={40} color={Colors.brand.accent} />
      </Animated.View>

      <Animated.View style={[{ alignItems: 'center', gap: 4 }, textStyle]}>
        <Text style={{ fontSize: 28, fontFamily: 'Onest-Bold', color: Colors.content.primary, textAlign: 'center' }}>
          New Personal Records!
        </Text>
        <Text style={{ fontSize: 14, fontFamily: 'Inter', color: Colors.content.tertiary, textAlign: 'center' }}>
          {prCount} PR{prCount === 1 ? '' : 's'} set today
        </Text>
      </Animated.View>
    </View>
  )
}
