import { ChipGrid } from '@/components/onboarding/chip-grid'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { TrainingStyle } from '@/types/profile'
import { TRAINING_STYLES } from '@/types/profile'
import { useRouter } from 'expo-router'
import { useState } from 'react'

const TrainingStyleScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [selected, setSelected] = useState<TrainingStyle[]>([])

  const handleToggle = (value: string) => {
    const style = value as TrainingStyle
    setSelected((prev) =>
      prev.includes(style) ? prev.filter((v) => v !== style) : [...prev, style],
    )
  }

  const handleNext = () => {
    updateField('trainingStyles', selected)
    router.push('/(protected)/onboarding/focus-areas')
  }

  const handleSkip = () => {
    router.push('/(protected)/onboarding/focus-areas')
  }

  return (
    <OnboardingScreen
      title="Any training styles you prefer?"
      subtitle="Select all that interest you."
      onNext={handleNext}
      onBack={() => router.back()}
      onSkip={handleSkip}
      nextDisabled={selected.length === 0}
    >
      <ChipGrid options={TRAINING_STYLES} selected={selected} onToggle={handleToggle} />
    </OnboardingScreen>
  )
}

export default TrainingStyleScreen
