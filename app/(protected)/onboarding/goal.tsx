import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { FitnessGoal } from '@/types/profile'
import { useRouter } from 'expo-router'
import {
  Activity,
  Dumbbell,
  Heart,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'

const GOAL_OPTIONS: { icon: typeof Target; title: string; value: FitnessGoal }[] = [
  { icon: Target, title: 'Lose Weight', value: 'lose_weight' },
  { icon: Dumbbell, title: 'Build Muscle', value: 'build_muscle' },
  { icon: TrendingUp, title: 'Get Stronger', value: 'get_stronger' },
  { icon: Heart, title: 'Improve Endurance', value: 'improve_endurance' },
  { icon: Activity, title: 'General Fitness', value: 'general_fitness' },
  { icon: Sparkles, title: 'Flexibility & Mobility', value: 'flexibility_mobility' },
]

const GoalScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [goal, setGoal] = useState<FitnessGoal | undefined>()

  const handleNext = () => {
    if (goal === undefined) return
    updateField('fitnessGoal', goal)
    router.push('/(protected)/onboarding/experience')
  }

  return (
    <OnboardingScreen
      title="What are you working toward?"
      subtitle="Choose what best describes your fitness goal."
      onNext={handleNext}
      nextDisabled={goal === undefined}
    >
      <View className="gap-3">
        {GOAL_OPTIONS.map((option, index) => (
          <SelectionCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            selected={goal === option.value}
            onPress={() => setGoal(option.value)}
            index={index}
          />
        ))}
      </View>
    </OnboardingScreen>
  )
}

export default GoalScreen
