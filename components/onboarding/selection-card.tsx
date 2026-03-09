import { Colors } from '@/constants/colors'
import type { LucideIcon } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface SelectionCardProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  selected: boolean
  onPress: () => void
  index?: number
}

export const SelectionCard = ({
  icon: Icon,
  title,
  subtitle,
  selected,
  onPress,
}: SelectionCardProps) => {
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
      className={`flex-row items-center rounded-xl px-4 py-4 border gap-3 ${
        selected
          ? 'bg-background-tertiary border-brand-accent'
          : 'bg-background-secondary border-border-primary'
      }`}
      style={[animatedStyle, { borderCurve: 'continuous' as const }]}
    >
      <Icon
        size={24}
        color={selected ? Colors.brand.accent : Colors.content.secondary}
        pointerEvents="none"
      />
      <View className="flex-1">
        <Text className="text-base font-inter-semibold text-content-primary">{title}</Text>
        {subtitle !== undefined && subtitle.length > 0 && (
          <Text className="text-sm font-inter text-content-secondary mt-0.5">{subtitle}</Text>
        )}
      </View>
    </AnimatedPressable>
  )
}
