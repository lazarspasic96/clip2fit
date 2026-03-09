import { Colors } from '@/constants/colors'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { useProfileForm } from '@/contexts/profile-form-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ROW_1 = [1, 2, 3, 4] as const
const ROW_2 = [5, 6, 7] as const

interface DayCardProps {
  num: number
  selected: boolean
  onPress: () => void
}

const DayCard = ({ num, selected, onPress }: DayCardProps) => {
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

const FrequencyScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [frequency, setFrequency] = useState<number | undefined>()

  const handleNext = () => {
    if (frequency === undefined) return
    updateField('trainingFrequency', frequency)
    router.push('/(protected)/onboarding/duration')
  }

  return (
    <OnboardingScreen
      title="How many days per week can you train?"
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={frequency === undefined}
    >
      <View className="mt-6 gap-3">
        <View className="flex-row gap-3">
          {ROW_1.map((num) => (
            <DayCard
              key={num}
              num={num}
              selected={frequency === num}
              onPress={() => setFrequency(num)}
            />
          ))}
        </View>

        <View className="flex-row gap-3 px-8">
          {ROW_2.map((num) => (
            <DayCard
              key={num}
              num={num}
              selected={frequency === num}
              onPress={() => setFrequency(num)}
            />
          ))}
        </View>
      </View>

    </OnboardingScreen>
  )
}

export default FrequencyScreen
