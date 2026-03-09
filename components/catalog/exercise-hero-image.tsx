import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Dumbbell } from 'lucide-react-native'
import { Dimensions } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

const SCREEN_WIDTH = Dimensions.get('window').width
export const HERO_HEIGHT = 340

interface ExerciseHeroImageProps {
  gifUrl: string | null
  thumbnailUrl: string | null
  scrollY: SharedValue<number>
}

export const ExerciseHeroImage = ({ gifUrl, thumbnailUrl, scrollY }: ExerciseHeroImageProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, HERO_HEIGHT], [0, HERO_HEIGHT * 0.5], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-100, 0], [1.3, 1], { extrapolateRight: Extrapolation.CLAMP }) },
    ],
  }))

  if (gifUrl === null) {
    return (
      <Animated.View
        className="bg-background-tertiary items-center justify-center"
        style={[{ width: SCREEN_WIDTH, height: HERO_HEIGHT }, animatedStyle]}
      >
        <Dumbbell size={48} color={Colors.content.tertiary} />
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[{ width: SCREEN_WIDTH, height: HERO_HEIGHT }, animatedStyle]}>
      <Image
        source={{ uri: gifUrl }}
        placeholder={thumbnailUrl !== null ? { uri: thumbnailUrl } : undefined}
        style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={{ duration: 300, effect: 'cross-dissolve' }}
        autoplay
      />
      <LinearGradient
        colors={['transparent', '#09090b']}
        className="absolute bottom-0 left-0 right-0 h-24"
      />
    </Animated.View>
  )
}
