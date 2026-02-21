import { Dumbbell } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Dimensions, ScrollView, View } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { Image } from 'expo-image'

import { Colors } from '@/constants/colors'
import type { CatalogExerciseImages } from '@/types/catalog'

const SCREEN_WIDTH = Dimensions.get('window').width
const IMAGE_HEIGHT = 280

interface ExerciseImagePagerProps {
  images: CatalogExerciseImages | null
}

export const ExerciseImagePager = ({ images }: ExerciseImagePagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  if (images === null) {
    return (
      <View
        className="bg-background-tertiary items-center justify-center"
        style={{ height: IMAGE_HEIGHT }}
      >
        <Dumbbell size={48} color={Colors.content.tertiary} />
      </View>
    )
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / SCREEN_WIDTH)
    setActiveIndex(index)
  }

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        <Image
          source={{ uri: images.start }}
          style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <Image
          source={{ uri: images.end }}
          style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </ScrollView>

      <View className="flex-row items-center justify-center mt-3 gap-2">
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: activeIndex === 0 ? Colors.content.primary : Colors.content.tertiary }}
        />
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: activeIndex === 1 ? Colors.content.primary : Colors.content.tertiary }}
        />
      </View>
    </View>
  )
}
