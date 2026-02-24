import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

import { ExerciseInstructions } from '@/components/catalog/exercise-instructions'
import { ExerciseMotionPreview } from '@/components/workout/shared/exercise-motion-preview'
import { SourceVideoButton } from '@/components/workout/source-video-button'
import { useCatalogDetail } from '@/hooks/use-catalog'
import { MUSCLE_GROUP_LABELS } from '@/types/catalog'

const formatMuscle = (muscle: string): string => MUSCLE_GROUP_LABELS[muscle] ?? muscle

const ExerciseLearningScreen = () => {
  const params = useLocalSearchParams<{
    catalogExerciseId: string
    title: string
    videoUrl?: string
    showPrimaryMuscles?: string
  }>()

  const { exercise, isLoading } = useCatalogDetail(params.catalogExerciseId ?? null)

  const title = params.title ?? ''
  const videoUrl = params.videoUrl ?? null
  const showPrimaryMuscles = params.showPrimaryMuscles !== 'false'

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const instructions = exercise?.instructions ?? []
  const primaryMuscles = showPrimaryMuscles ? (exercise?.primaryMuscleGroups ?? []) : []

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-5 pt-2">
        <ExerciseMotionPreview images={exercise?.images ?? null} height={230} />
        <View className="flex-row items-center justify-between mt-3 px-1">
          <Text className="text-xs font-inter-medium text-content-tertiary">Looping movement preview</Text>
          <Text className="text-[11px] font-inter-semibold text-brand-accent">{'Start -> End -> Repeat'}</Text>
        </View>
      </View>

      <View className="px-5 mt-4 gap-4">
        <View>
          <Text className="text-lg font-inter-bold text-content-primary">{title}</Text>
          <Text className="text-xs font-inter text-content-tertiary mt-1">Exercise guide</Text>
        </View>

        <View className="gap-4">
          {primaryMuscles.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {primaryMuscles.map((muscle) => (
                <View key={muscle} className="bg-background-tertiary rounded-full px-3 py-1.5">
                  <Text className="text-xs font-inter-medium text-content-secondary">{formatMuscle(muscle)}</Text>
                </View>
              ))}
            </View>
          )}

          <ExerciseInstructions instructions={instructions} />

          {videoUrl !== null && (
            <View className="pb-1">
              <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider">Video</Text>
              <SourceVideoButton url={videoUrl} />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default ExerciseLearningScreen
