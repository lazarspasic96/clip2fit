import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { useProfileForm } from '@/contexts/profile-form-context'
import { SESSION_DURATIONS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { Clock, Zap } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'

const DurationScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [duration, setDuration] = useState<number | undefined>()

  const handleNext = () => {
    if (duration === undefined) return
    updateField('sessionDuration', duration)
    router.push('/(protected)/onboarding/training-style')
  }

  return (
    <OnboardingScreen
      title="How long can you work out?"
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={duration === undefined}
    >
      <View className="gap-3">
        {SESSION_DURATIONS.map((option, index) => (
          <SelectionCard
            key={option.value}
            icon={option.value === 15 ? Zap : Clock}
            title={option.label}
            subtitle={option.subtitle}
            selected={duration === option.value}
            onPress={() => setDuration(option.value)}
            index={index}
          />
        ))}
      </View>
    </OnboardingScreen>
  )
}

export default DurationScreen
