import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useSyncExternalStore } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ExerciseDetailContent } from '@/components/catalog/exercise-detail-content'
import { ExerciseImagePager } from '@/components/catalog/exercise-image-pager'
import { Button } from '@/components/ui/button'
import { Colors } from '@/constants/colors'
import { useWorkoutBuilder } from '@/contexts/workout-builder-context'
import { useCatalogDetail } from '@/hooks/use-catalog'

const ExerciseDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { exercise, isLoading, error } = useCatalogDetail(id ?? null)
  const builder = useWorkoutBuilder()

  // Subscribe to builder changes so selected state stays reactive
  useSyncExternalStore(builder.subscribe, builder.getSnapshot)

  const selected = exercise !== null ? builder.isSelected(exercise.id) : false

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
      {/* Back button */}
      <Pressable
        onPress={handleBack}
        className="absolute items-center justify-center rounded-full bg-background-primary/60"
        style={{
          top: insets.top + 8,
          left: 16,
          zIndex: 10,
          width: 40,
          height: 40,
        }}
      >
        <ChevronLeft size={24} color={Colors.content.primary} pointerEvents="none" />
      </Pressable>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 + Math.max(insets.bottom, 16) }}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseImagePager images={exercise.images} />
        <ExerciseDetailContent exercise={exercise} />
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        className="bg-background-primary border-t border-border-primary px-5 py-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Button
          onPress={() => builder.toggleExercise(exercise)}
          variant={selected ? 'secondary' : 'primary'}
        >
          {selected ? 'Remove from Workout' : 'Add to Workout'}
        </Button>
      </View>
    </View>
  )
}

export default ExerciseDetailScreen
