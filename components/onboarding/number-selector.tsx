import { Colors } from '@/constants/colors'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface NumberSelectorProps {
  options: readonly number[]
  value: number | undefined
  onChange: (value: number) => void
}

export const NumberSelector = ({ options, value, onChange }: NumberSelectorProps) => (
  <View className="flex-row justify-between gap-3">
    {options.map((num) => (
      <NumberButton
        key={num}
        num={num}
        selected={value === num}
        onPress={() => onChange(num)}
      />
    ))}
  </View>
)

interface NumberButtonProps {
  num: number
  selected: boolean
  onPress: () => void
}

const NumberButton = ({ num, selected, onPress }: NumberButtonProps) => {
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
      className={`w-14 h-14 rounded-full items-center justify-center border ${
        selected ? 'bg-brand-accent border-brand-accent' : 'bg-background-secondary border-border-primary'
      }`}
      style={animatedStyle}
    >
      <Text
        className="text-lg font-inter-bold"
        style={{ color: selected ? Colors.background.primary : Colors.content.primary }}
      >
        {num}
      </Text>
    </AnimatedPressable>
  )
}
