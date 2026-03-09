import { ChipGrid } from '@/components/onboarding/chip-grid'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { FocusArea } from '@/types/profile'
import { FOCUS_AREAS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { useState } from 'react'

const EXCLUSIVE_VALUES = ['full_body']

const FocusAreasScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [selected, setSelected] = useState<FocusArea[]>([])

  const handleToggle = (value: string) => {
    const area = value as FocusArea
    setSelected((prev) => {
      if (EXCLUSIVE_VALUES.includes(area)) {
        // Tapping exclusive option: toggle it, deselect everything else
        return prev.includes(area) ? [] : [area]
      }
      // Tapping non-exclusive: remove any exclusive, toggle this one
      const withoutExclusive = prev.filter((v) => !EXCLUSIVE_VALUES.includes(v))
      return withoutExclusive.includes(area)
        ? withoutExclusive.filter((v) => v !== area)
        : [...withoutExclusive, area]
    })
  }

  const handleNext = () => {
    updateField('focusAreas', selected)
    router.push('/(protected)/onboarding/injuries')
  }

  const handleSkip = () => {
    router.push('/(protected)/onboarding/injuries')
  }

  return (
    <OnboardingScreen
      title="Any areas you want to focus on?"
      subtitle="Select specific muscle groups or choose full body."
      onNext={handleNext}
      onBack={() => router.back()}
      onSkip={handleSkip}
      nextDisabled={selected.length === 0}
    >
      <ChipGrid
        options={FOCUS_AREAS}
        selected={selected}
        onToggle={handleToggle}
        exclusive={EXCLUSIVE_VALUES}
        columns={2}
      />
    </OnboardingScreen>
  )
}

export default FocusAreasScreen
