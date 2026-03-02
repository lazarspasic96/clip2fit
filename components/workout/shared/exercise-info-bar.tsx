import { Image } from 'expo-image'
import { Dumbbell, Info } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { MuscleChip } from '@/components/ui/muscle-chip'
import { Colors } from '@/constants/colors'
import type { CatalogExerciseDetail } from '@/types/catalog'

const THUMB_SIZE = 56

interface ExerciseInfoBarProps {
  catalogExercise: CatalogExerciseDetail | null
  isLoading: boolean
  onInfoPress: () => void
}

export const ExerciseInfoBar = ({ catalogExercise, isLoading, onInfoPress }: ExerciseInfoBarProps) => {
  if (isLoading) return null

  const hasGif = catalogExercise !== null && catalogExercise.gifUrl !== null
  const targetMuscle = catalogExercise?.target ?? ''
  const secondaryMuscles = catalogExercise?.secondaryMuscles ?? []

  return (
    <View className="flex-row items-center px-4 gap-3">
      {/* Thumbnail */}
      <View
        className="rounded-xl overflow-hidden bg-background-tertiary"
        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      >
        {hasGif ? (
          <Image
            source={{ uri: catalogExercise?.gifUrl ?? undefined }}
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            contentFit="cover"
            cachePolicy="memory-disk"
            autoplay
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Dumbbell size={20} color={Colors.content.tertiary} pointerEvents="none" />
          </View>
        )}
      </View>

      {/* Muscle group pills */}
      <View className="flex-1 flex-row flex-wrap gap-1.5">
        {targetMuscle.length > 0 && (
          <MuscleChip key={targetMuscle} muscle={targetMuscle} size="xs" tone="soft" />
        )}
        {secondaryMuscles.slice(0, 2).map((m) => (
          <MuscleChip key={m} muscle={m} size="xs" tone="soft" />
        ))}
        {targetMuscle.length === 0 && secondaryMuscles.length === 0 && (
          <Text className="text-xs font-inter text-content-tertiary">No muscle data</Text>
        )}
      </View>

      {/* Info button */}
      {catalogExercise !== null && (
        <Pressable
          onPress={onInfoPress}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-background-tertiary items-center justify-center"
        >
          <Info size={16} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      )}
    </View>
  )
}
