import { Image } from 'expo-image'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { ExercisePlaceholder } from '@/components/workout/shared/exercise-placeholder'
import type { CatalogExerciseImages } from '@/types/catalog'

const AnimatedImage = Animated.createAnimatedComponent(Image)

const CROSSFADE_DURATION = 800
const HOLD_DURATION = 2200

interface ExerciseMotionPreviewProps {
  images: CatalogExerciseImages | null
  height?: number
}

export const ExerciseMotionPreview = ({ images, height = 120 }: ExerciseMotionPreviewProps) => {
  const opacity = useSharedValue(1)

  const startStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  useEffect(() => {
    if (images === null) return

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: HOLD_DURATION }),
        withTiming(0, { duration: CROSSFADE_DURATION }),
        withTiming(0, { duration: HOLD_DURATION }),
        withTiming(1, { duration: CROSSFADE_DURATION }),
      ),
      -1,
    )
  }, [images, opacity])

  if (images === null) {
    return <ExercisePlaceholder size={32} height={height} />
  }

  return (
    <View className="rounded-xl overflow-hidden" style={{ height }}>
      <Image
        source={{ uri: images.end }}
        style={{ position: 'absolute', width: '100%', height }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <AnimatedImage
        source={{ uri: images.start }}
        style={[{ width: '100%', height }, startStyle]}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </View>
  )
}
