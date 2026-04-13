import { DayCard } from '@/components/onboarding/day-card'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { useProfileForm } from '@/contexts/profile-form-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

const ROW_1 = [1, 2, 3, 4] as const
const ROW_2 = [5, 6, 7] as const

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
