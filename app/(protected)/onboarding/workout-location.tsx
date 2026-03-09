import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { WorkoutLocation } from '@/types/profile'
import { WORKOUT_LOCATIONS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { ArrowLeftRight, Building, Home, Trees } from 'lucide-react-native'

const ICONS = {
  gym: Building,
  home: Home,
  both: ArrowLeftRight,
  outdoor: Trees,
} as const

const WorkoutLocationScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [location, setLocation] = useState<WorkoutLocation | undefined>()

  const handleNext = () => {
    if (location === undefined) return
    updateField('workoutLocation', location)
    router.push('/(protected)/onboarding/equipment')
  }

  return (
    <OnboardingScreen
      title="Where do you usually train?"
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={location === undefined}
    >
      <View className="gap-3">
        {WORKOUT_LOCATIONS.map((option, index) => (
          <SelectionCard
            key={option.value}
            icon={ICONS[option.value]}
            title={option.label}
            selected={location === option.value}
            onPress={() => setLocation(option.value)}
            index={index}
          />
        ))}
      </View>
    </OnboardingScreen>
  )
}

export default WorkoutLocationScreen
