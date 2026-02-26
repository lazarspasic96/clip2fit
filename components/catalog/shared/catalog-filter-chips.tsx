import * as Haptics from 'expo-haptics'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import {
  MUSCLE_GROUPS_ORDERED,
  MUSCLE_GROUP_LABELS,
  REGION_BREAK_INDICES,
} from '@/types/catalog'
import { getMuscleChipColors } from '@/utils/muscle-color'

interface CatalogFilterChipsProps {
  selectedMuscle: string | null
  onSelectMuscle: (muscle: string | null) => void
}

const FilterChip = ({
  label,
  muscle,
  isActive,
  onPress,
}: {
  label: string
  muscle: string | null
  isActive: boolean
  onPress: () => void
}) => {
  const handlePress = () => {
    Haptics.selectionAsync()
    onPress()
  }
  const selectedMuscleColors = muscle !== null ? getMuscleChipColors(muscle, 'solid') : null

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-full px-3.5 py-1.5 border"
      style={{
        backgroundColor:
          isActive
            ? (selectedMuscleColors?.backgroundColor ?? Colors.brand.accent)
            : Colors.background.tertiary,
        borderColor:
          isActive
            ? (selectedMuscleColors?.borderColor ?? Colors.brand.accent)
            : Colors.border.secondary,
      }}
    >
      <Text
        className={isActive ? 'text-sm font-inter-semibold' : 'text-sm font-inter-medium text-content-primary'}
        style={
          isActive
            ? { color: selectedMuscleColors?.textColor ?? Colors.background.primary }
            : { color: Colors.content.primary }
        }
      >
        {label}
      </Text>
    </Pressable>
  )
}

export const CatalogFilterChips = ({
  selectedMuscle,
  onSelectMuscle,
}: CatalogFilterChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {/* "All" chip */}
      <FilterChip
        label="All"
        muscle={null}
        isActive={selectedMuscle === null}
        onPress={() => onSelectMuscle(null)}
      />

      {/* Muscle group chips with region gaps */}
      {MUSCLE_GROUPS_ORDERED.map((muscle, index) => {
        const isActive = selectedMuscle === muscle
        const prevIndex = index - 1
        const gapAfterPrev = prevIndex >= 0 && REGION_BREAK_INDICES.has(prevIndex)
        const marginLeft = gapAfterPrev ? 12 : 8

        return (
          <View key={muscle} style={{ marginLeft }}>
            <FilterChip
              label={MUSCLE_GROUP_LABELS[muscle] ?? muscle}
              muscle={muscle}
              isActive={isActive}
              onPress={() => onSelectMuscle(isActive ? null : muscle)}
            />
          </View>
        )
      })}
    </ScrollView>
  )
}
