import * as Haptics from 'expo-haptics'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'

interface FilterChipGridProps {
  options: readonly string[]
  labels: Record<string, string>
  selected: string | null
  onToggle: (value: string) => void
}

export const FilterChipGrid = ({ options, labels, selected, onToggle }: FilterChipGridProps) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((item) => (
        <Pressable
          key={item}
          onPress={() => {
            Haptics.selectionAsync()
            onToggle(item)
          }}
          className={cn(
            'rounded-full px-3.5 py-1.5',
            selected === item ? 'bg-brand-accent' : 'bg-background-tertiary',
          )}
        >
          <Text
            className={cn(
              'text-sm',
              selected === item
                ? 'font-inter-semibold text-background-primary'
                : 'font-inter text-content-secondary',
            )}
          >
            {labels[item] ?? item}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
