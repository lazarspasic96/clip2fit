import { cn } from '@/components/ui/cn'
import { Pressable, Text, View } from 'react-native'

interface SegmentOption<T extends string> {
  label: string
  value: T
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

export const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
  return (
    <View className="flex-row bg-background-secondary rounded-md p-1">
      {options.map((option) => {
        const selected = value === option.value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn('flex-1 items-center py-2 rounded-sm', selected && 'bg-brand-accent')}
          >
            <Text
              className={cn(
                'text-sm font-inter-medium',
                selected ? 'text-background-primary' : 'text-content-tertiary'
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
