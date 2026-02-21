import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'

import { useCatalogRelated } from '@/hooks/use-catalog'

interface ExerciseRelatedListProps {
  exerciseId: string
  primaryMuscle: string | null
}

const CARD_WIDTH = 120
const CARD_HEIGHT = 150
const IMAGE_HEIGHT = 90

const SkeletonCard = () => (
  <View
    className="bg-background-secondary rounded-xl"
    style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
  />
)

export const ExerciseRelatedList = ({ exerciseId, primaryMuscle }: ExerciseRelatedListProps) => {
  const router = useRouter()
  const { items, isLoading } = useCatalogRelated(exerciseId, primaryMuscle)

  if (!isLoading && items.length === 0) return null

  return (
    <View>
      <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-3 px-5">
        Related Exercises
      </Text>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/(protected)/exercise-detail?id=${item.id}`)}
              style={{ width: CARD_WIDTH }}
            >
              {item.images !== null ? (
                <Image
                  source={{ uri: item.images.start }}
                  style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT, borderRadius: 12 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View
                  className="bg-background-tertiary items-center justify-center"
                  style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT, borderRadius: 12 }}
                />
              )}
              <Text
                className="text-xs font-inter-medium text-content-primary mt-1.5"
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
