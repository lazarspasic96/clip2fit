import { cn } from '@/components/ui/cn'
import { Pressable, Text, View } from 'react-native'

interface RadioOption<T extends string> {
  label: string
  value: T
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[]
  value: T | undefined
  onChange: (value: T) => void
}

export const RadioGroup = <T extends string>({ options, value, onChange }: RadioGroupProps<T>) => {
  return (
    <View className="gap-3">
      {options.map((option) => {
        const selected = value === option.value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn(
              'flex-row items-center px-4 py-4 rounded-md border',
              selected ? 'border-brand-accent bg-background-secondary' : 'border-border-primary bg-background-secondary'
            )}
          >
            <View
              className={cn(
                'w-5 h-5 rounded-full border-2 items-center justify-center mr-3',
                selected ? 'border-brand-accent' : 'border-content-tertiary'
              )}
            >
              {selected && <View className="w-2.5 h-2.5 rounded-full bg-brand-accent" />}
            </View>
            <Text className="text-base font-inter text-content-primary">{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
