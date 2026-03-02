import { Image } from 'expo-image'
import { Check, Dumbbell, Plus } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { MuscleChip } from '@/components/ui/muscle-chip'
import { Colors } from '@/constants/colors'
import type { CatalogExercise } from '@/types/catalog'
import { EQUIPMENT_LABELS } from '@/types/catalog'

interface PickerExerciseRowProps {
  exercise: CatalogExercise
  isSelected: boolean
  isAlreadyAdded: boolean
  onToggle: () => void
}

export const PickerExerciseRow = ({
  exercise,
  isSelected,
  isAlreadyAdded,
  onToggle,
}: PickerExerciseRowProps) => {
  const hasThumbnail = exercise.thumbnailUrl !== null
  const equipmentLabel = EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center px-5 py-3"
      style={{ opacity: isAlreadyAdded && !isSelected ? 0.5 : 1 }}
    >
      {/* Thumbnail */}
      <View className="w-11 h-11 rounded-xl overflow-hidden mr-3" style={{ borderCurve: 'continuous' }}>
        {hasThumbnail ? (
          <Image
            source={{ uri: exercise.thumbnailUrl ?? undefined }}
            className="w-full h-full"
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-full h-full bg-background-tertiary items-center justify-center">
            <Dumbbell size={18} color={Colors.content.tertiary} pointerEvents="none" />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 mr-3">
        <Text className="text-[15px] font-inter-semibold text-content-primary" numberOfLines={1}>
          {exercise.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <MuscleChip muscle={exercise.target} size="xs" tone="ghost" />
          {equipmentLabel.length > 0 && (
            <Text className="text-xs font-inter text-content-tertiary">{equipmentLabel}</Text>
          )}
        </View>
      </View>

      {/* Toggle button */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{
          backgroundColor: isSelected ? Colors.brand.accent : Colors.background.tertiary,
          borderWidth: isSelected ? 0 : 1,
          borderColor: Colors.border.secondary,
        }}
      >
        {isSelected ? (
          <Check size={16} color={Colors.background.primary} pointerEvents="none" />
        ) : isAlreadyAdded ? (
          <Check size={16} color={Colors.content.tertiary} pointerEvents="none" />
        ) : (
          <Plus size={16} color={Colors.content.secondary} pointerEvents="none" />
        )}
      </View>
    </Pressable>
  )
}
