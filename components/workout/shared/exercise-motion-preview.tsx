import { Image } from 'expo-image'
import { View } from 'react-native'

import { ExercisePlaceholder } from '@/components/workout/shared/exercise-placeholder'

interface ExerciseMotionPreviewProps {
  gifUrl: string | null
  height?: number
}

export const ExerciseMotionPreview = ({ gifUrl, height = 120 }: ExerciseMotionPreviewProps) => {
  if (gifUrl === null) {
    return <ExercisePlaceholder size={32} height={height} />
  }

  return (
    <View className="overflow-hidden" style={{ height }}>
      <Image
        source={{ uri: gifUrl }}
        style={{ width: '100%', height }}
        contentFit="cover"
        cachePolicy="memory-disk"
        autoplay
      />
    </View>
  )
}
