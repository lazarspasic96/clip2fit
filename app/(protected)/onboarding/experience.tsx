import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { ExperienceLevel } from '@/types/profile'
import { EXPERIENCE_LEVELS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { Flame, Sprout, Trophy } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'

const ICONS = {
  beginner: Sprout,
  intermediate: Flame,
  advanced: Trophy,
} as const

const ExperienceScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [level, setLevel] = useState<ExperienceLevel | undefined>()

  const handleNext = () => {
    if (level === undefined) return
    updateField('experienceLevel', level)
    router.push('/(protected)/onboarding/workout-location')
  }

  return (
    <OnboardingScreen
      title="Where are you on your fitness journey?"
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={level === undefined}
    >
      <View className="gap-3">
        {EXPERIENCE_LEVELS.map((option, index) => (
          <SelectionCard
            key={option.value}
            icon={ICONS[option.value]}
            title={option.label}
            subtitle={option.subtitle}
            selected={level === option.value}
            onPress={() => setLevel(option.value)}
            index={index}
          />
        ))}
      </View>
    </OnboardingScreen>
  )
}

export default ExperienceScreen
