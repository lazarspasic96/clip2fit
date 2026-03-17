import * as Haptics from 'expo-haptics'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { BODY_REGIONS } from '@/types/catalog'
import { getMuscleChipColors } from '@/utils/muscle-color'

interface CatalogFilterChipsProps {
  selectedBodyPart: string | null
  onSelectBodyPart: (bodyPart: string | null) => void
}

const FilterChip = ({
  label,
  regionKey,
  isActive,
  onPress,
}: {
  label: string
  regionKey: string | null
  isActive: boolean
  onPress: () => void
}) => {
  const handlePress = () => {
    Haptics.selectionAsync()
    onPress()
  }
  const selectedColors = regionKey !== null ? getMuscleChipColors(regionKey, 'solid') : null

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-full px-3.5 py-1.5 border"
      style={{
        backgroundColor:
          isActive
            ? (selectedColors?.backgroundColor ?? Colors.brand.accent)
            : Colors.background.tertiary,
        borderColor:
          isActive
            ? (selectedColors?.borderColor ?? Colors.brand.accent)
            : Colors.border.secondary,
      }}
    >
      <Text
        className={isActive ? 'text-sm font-inter-semibold' : 'text-sm font-inter-medium'}
        style={{
          color: isActive
            ? (selectedColors?.textColor ?? Colors.background.primary)
            : Colors.content.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export const CatalogFilterChips = ({
  selectedBodyPart,
  onSelectBodyPart,
}: CatalogFilterChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      <FilterChip
        label="All"
        regionKey={null}
        isActive={selectedBodyPart === null}
        onPress={() => onSelectBodyPart(null)}
      />

      {BODY_REGIONS.map((region) => {
        const bodyPartValue = region.bodyParts.join(',')
        const isActive = selectedBodyPart === bodyPartValue

        return (
          <FilterChip
            key={region.key}
            label={region.label}
            regionKey={region.key}
            isActive={isActive}
            onPress={() => onSelectBodyPart(isActive ? null : bodyPartValue)}
          />
        )
      })}
    </ScrollView>
  )
}
