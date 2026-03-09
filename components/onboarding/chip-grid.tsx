import { Colors } from '@/constants/colors'
import * as Haptics from 'expo-haptics'
import { Check } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ChipOption {
  value: string
  label: string
  icon?: LucideIcon
}

interface ChipGridProps {
  options: ChipOption[]
  selected: string[]
  onToggle: (value: string) => void
  exclusive?: string[]
  columns?: 1 | 2
}

export const ChipGrid = ({ options, selected, onToggle, exclusive = [], columns = 1 }: ChipGridProps) => {
  const handlePress = (value: string) => {
    Haptics.selectionAsync()
    onToggle(value)
  }

  if (columns === 2) {
    return (
      <View className="flex-row flex-wrap justify-center gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <View key={option.value} style={{ width: '48.5%' }}>
              <Chip option={option} selected={isSelected} onPress={() => handlePress(option.value)} />
            </View>
          )
        })}
      </View>
    )
  }

  return (
    <View className="flex-row flex-wrap justify-center gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <Chip key={option.value} option={option} selected={isSelected} onPress={() => handlePress(option.value)} />
        )
      })}
    </View>
  )
}

interface ChipProps {
  option: ChipOption
  selected: boolean
  onPress: () => void
}

const Chip = ({ option, selected, onPress }: ChipProps) => {
  const Icon = option.icon
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    opacity.value = withSequence(
      withTiming(0.7, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    )
    onPress()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      className={`flex-row items-center rounded-xl px-4 py-3 border gap-2 ${
        selected
          ? 'bg-brand-accent/10 border-brand-accent'
          : 'bg-background-secondary border-border-primary'
      }`}
      style={[animatedStyle, { borderCurve: 'continuous' as const }]}
    >
      {Icon !== undefined && (
        <Icon
          size={18}
          color={selected ? Colors.brand.accent : Colors.content.secondary}
          pointerEvents="none"
        />
      )}
      <Text
        className={`text-sm font-inter-medium ${
          selected ? 'text-brand-accent' : 'text-content-primary'
        }`}
      >
        {option.label}
      </Text>
      {selected && <Check size={16} color={Colors.brand.accent} pointerEvents="none" />}
    </AnimatedPressable>
  )
}
