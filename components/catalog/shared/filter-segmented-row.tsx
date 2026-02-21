import * as Haptics from 'expo-haptics'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'

interface FilterSegmentedRowProps {
  options: readonly string[]
  labels: Record<string, string>
  selected: string | null
  onToggle: (value: string) => void
  dotColors?: Record<string, string>
}

export const FilterSegmentedRow = ({
  options,
  labels,
  selected,
  onToggle,
  dotColors,
}: FilterSegmentedRowProps) => {
  return (
    <View className="flex-row gap-2">
      {options.map((item) => {
        const isActive = selected === item

        return (
          <Pressable
            key={item}
            onPress={() => {
              Haptics.selectionAsync()
              onToggle(item)
            }}
            className={cn(
              'flex-1 flex-row rounded-xl py-2.5 items-center justify-center gap-1.5 border',
              isActive
                ? 'border-brand-accent bg-background-tertiary'
                : 'border-transparent bg-background-tertiary',
            )}
          >
            {dotColors?.[item] !== undefined && (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: dotColors[item],
                }}
              />
            )}
            <Text
              className={cn(
                'text-sm',
                isActive
                  ? 'font-inter-semibold text-brand-accent'
                  : 'font-inter text-content-secondary',
              )}
            >
              {labels[item] ?? item}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
