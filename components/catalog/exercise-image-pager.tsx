import { Image } from 'expo-image'

import { Dumbbell } from 'lucide-react-native'
import { Dimensions, View } from 'react-native'

import { Colors } from '@/constants/colors'

const SCREEN_WIDTH = Dimensions.get('window').width
const IMAGE_HEIGHT = 300

interface ExerciseImagePagerProps {
  gifUrl: string | null
  thumbnailUrl: string | null
}

export const ExerciseImagePager = ({ gifUrl, thumbnailUrl }: ExerciseImagePagerProps) => {
  if (gifUrl === null) {
    return (
      <View
        className="bg-background-tertiary items-center justify-center"
        style={{ height: IMAGE_HEIGHT }}
      >
        <Dumbbell size={48} color={Colors.content.tertiary} />
      </View>
    )
  }

  return (
    <View>
      <Image
        source={{ uri: gifUrl }}
        placeholder={thumbnailUrl !== null ? { uri: thumbnailUrl } : undefined}
        style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={{ duration: 300, effect: 'cross-dissolve' }}
        autoplay
      />
    </View>
  )
}
