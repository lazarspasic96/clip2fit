import { Colors } from '@/constants/colors'
import { Pressable, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface DayCardProps {
  num: number
  selected: boolean
  onPress: () => void
}

export const DayCard = ({ num, selected, onPress }: DayCardProps) => {
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
      className={`flex-1 items-center justify-center rounded-2xl border py-4 ${
        selected
          ? 'bg-brand-accent border-brand-accent'
          : 'bg-background-secondary border-border-primary'
      }`}
      style={[animatedStyle, { borderCurve: 'continuous' as const }]}
    >
      <Text
        className="text-2xl font-inter-bold"
        style={{ color: selected ? Colors.content.buttonPrimary : Colors.content.primary }}
      >
        {num}
      </Text>
      <Text
        className="text-xs font-inter mt-0.5"
        style={{ color: selected ? Colors.content.buttonPrimary : Colors.content.tertiary }}
      >
        {num === 1 ? 'day' : 'days'}
      </Text>
    </AnimatedPressable>
  )
}
