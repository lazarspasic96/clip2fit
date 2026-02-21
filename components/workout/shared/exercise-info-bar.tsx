import { Image } from 'expo-image'
import { Dumbbell, Info } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { CatalogExerciseDetail } from '@/types/catalog'
import { MUSCLE_GROUP_LABELS } from '@/types/catalog'

const THUMB_SIZE = 56

interface ExerciseInfoBarProps {
  catalogExercise: CatalogExerciseDetail | null
  isLoading: boolean
  onInfoPress: () => void
}

export const ExerciseInfoBar = ({ catalogExercise, isLoading, onInfoPress }: ExerciseInfoBarProps) => {
  if (isLoading) return null

  const hasImage = catalogExercise !== null && catalogExercise.images !== null
  const muscles = catalogExercise?.primaryMuscleGroups ?? []

  return (
    <View className="flex-row items-center px-4 gap-3">
      {/* Thumbnail */}
      <View
        className="rounded-xl overflow-hidden bg-background-tertiary"
        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      >
        {hasImage ? (
          <Image
            source={{ uri: catalogExercise?.images?.start }}
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Dumbbell size={20} color={Colors.content.tertiary} pointerEvents="none" />
          </View>
        )}
      </View>

      {/* Muscle group pills */}
      <View className="flex-1 flex-row flex-wrap gap-1.5">
        {muscles.slice(0, 3).map((m) => (
          <View key={m} className="bg-background-tertiary rounded-full px-2.5 py-1">
            <Text className="text-[11px] font-inter-medium text-content-secondary">
              {MUSCLE_GROUP_LABELS[m] ?? m}
            </Text>
          </View>
        ))}
        {muscles.length === 0 && (
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
