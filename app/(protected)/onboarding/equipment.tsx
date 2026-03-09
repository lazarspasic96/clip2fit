import { ChipGrid } from '@/components/onboarding/chip-grid'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { Button } from '@/components/ui/button'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { Equipment } from '@/types/profile'
import { EQUIPMENT_OPTIONS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

const AT_HOME_PRESET: Equipment[] = ['bodyweight', 'dumbbells', 'resistance_bands']
const FULL_GYM_PRESET: Equipment[] = EQUIPMENT_OPTIONS.map((o) => o.value)

const EquipmentScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [selected, setSelected] = useState<Equipment[]>([])

  const handleToggle = (value: string) => {
    const equipment = value as Equipment
    setSelected((prev) =>
      prev.includes(equipment) ? prev.filter((v) => v !== equipment) : [...prev, equipment],
    )
  }

  const applyPreset = (preset: Equipment[]) => {
    const allMatch = preset.every((v) => selected.includes(v))
    setSelected(allMatch ? [] : preset)
  }

  const handleNext = () => {
    if (selected.length === 0) return
    updateField('equipment', selected)
    router.push('/(protected)/onboarding/frequency')
  }

  return (
    <OnboardingScreen
      title="What do you have to work with?"
      subtitle="Select all equipment you have access to."
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <Button variant="secondary" size="sm" onPress={() => applyPreset(AT_HOME_PRESET)}>
            At Home
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="secondary" size="sm" onPress={() => applyPreset(FULL_GYM_PRESET)}>
            Full Gym
          </Button>
        </View>
      </View>
      <ChipGrid options={EQUIPMENT_OPTIONS} selected={selected} onToggle={handleToggle} columns={2} />
    </OnboardingScreen>
  )
}

export default EquipmentScreen
