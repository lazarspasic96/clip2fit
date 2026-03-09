import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSyncExternalStore } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ExerciseAnimatedHeader } from '@/components/catalog/exercise-animated-header'
import { ExerciseBottomCta } from '@/components/catalog/exercise-bottom-cta'
import { ExerciseContentSection } from '@/components/catalog/exercise-content-section'
import { ExerciseHeroImage } from '@/components/catalog/exercise-hero-image'
import { BackButton } from '@/components/ui/back-button'
import { Colors } from '@/constants/colors'
import { useWorkoutBuilder } from '@/contexts/workout-builder-context'
import { useCatalogDetail } from '@/hooks/use-catalog'

const ExerciseDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { exercise, isLoading, error } = useCatalogDetail(id ?? null)
  const builder = useWorkoutBuilder()

  useSyncExternalStore(builder.subscribe, builder.getSnapshot)

  const selected = exercise !== null ? builder.isSelected(exercise.id) : false
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(protected)/(tabs)' as never)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center">
        <ActivityIndicator size="large" color={Colors.content.primary} />
      </View>
    )
  }

  if (error !== null || exercise === null) {
    return (
      <View
        className="flex-1 bg-background-primary justify-center items-center px-5"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-base font-inter text-content-secondary text-center">
          {error ?? 'Exercise not found'}
        </Text>
        <Pressable onPress={handleBack} className="mt-4">
          <Text className="text-base font-inter-semibold text-brand-accent">Go back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary">
      <ExerciseAnimatedHeader title={exercise.name} scrollY={scrollY} />

      <BackButton
        onPress={handleBack}
        className="absolute left-4 z-20"
        style={{ top: insets.top + 8 }}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + Math.max(insets.bottom, 16) }}
      >
        <ExerciseHeroImage
          gifUrl={exercise.gifUrl}
          thumbnailUrl={exercise.thumbnailUrl}
          scrollY={scrollY}
        />
        <ExerciseContentSection exercise={exercise} />
      </Animated.ScrollView>

      <ExerciseBottomCta
        selected={selected}
        onToggle={() => builder.toggleExercise(exercise)}
      />
    </View>
  )
}

export default ExerciseDetailScreen
