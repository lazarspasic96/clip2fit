import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { ActivityLevel } from '@/types/profile'
import { ACTIVITY_LEVELS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { Armchair, Bike, Footprints, Flame } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'

const ICONS = [Armchair, Footprints, Bike, Flame] as const

const ActivityLevelScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [level, setLevel] = useState<ActivityLevel | undefined>()

  const handleNext = () => {
    if (level === undefined) return
    updateField('activityLevel', level)
    router.push('/(protected)/onboarding/about-you')
  }

  return (
    <OnboardingScreen
      title="How active are you day-to-day?"
      subtitle="Outside of your workouts."
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={level === undefined}
    >
      <View className="gap-3">
        {ACTIVITY_LEVELS.map((option, index) => (
          <SelectionCard
            key={option.value}
            icon={ICONS[index]}
            title={option.label}
            selected={level === option.value}
            onPress={() => setLevel(option.value)}
            index={index}
          />
        ))}
      </View>
    </OnboardingScreen>
  )
}

export default ActivityLevelScreen
