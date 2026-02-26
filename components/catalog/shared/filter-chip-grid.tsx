import * as Haptics from 'expo-haptics'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { Colors } from '@/constants/colors'
import { getMuscleChipColors } from '@/utils/muscle-color'

interface FilterChipGridProps {
  options: readonly string[]
  labels: Record<string, string>
  selected: string | null
  onToggle: (value: string) => void
  variant?: 'default' | 'muscle'
}

export const FilterChipGrid = ({
  options,
  labels,
  selected,
  onToggle,
  variant = 'default',
}: FilterChipGridProps) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((item) => {
        const isSelected = selected === item
        const selectedMuscleColors = variant === 'muscle' ? getMuscleChipColors(item, 'solid') : null

        return (
          <Pressable
            key={item}
            onPress={() => {
              Haptics.selectionAsync()
              onToggle(item)
            }}
            className={cn(
              'rounded-full px-3.5 py-1.5 border',
              !isSelected && 'bg-background-tertiary border-border-secondary',
              isSelected && variant === 'default' && 'bg-brand-accent border-brand-accent',
            )}
            style={
              isSelected && selectedMuscleColors !== null
                ? {
                  backgroundColor: selectedMuscleColors.backgroundColor,
                  borderColor: selectedMuscleColors.borderColor,
                }
                : variant === 'muscle' && !isSelected
                  ? { borderColor: Colors.border.secondary, backgroundColor: Colors.background.tertiary }
                  : undefined
            }
          >
            <Text
              className={cn(
                'text-sm',
                isSelected ? 'font-inter-semibold' : 'font-inter-medium text-content-primary',
                isSelected && variant === 'default' && 'text-background-primary',
              )}
              style={
                isSelected && selectedMuscleColors !== null
                  ? { color: selectedMuscleColors.textColor }
                  : !isSelected
                    ? { color: Colors.content.primary }
                    : undefined
              }
            >
              {labels[item] ?? item}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
