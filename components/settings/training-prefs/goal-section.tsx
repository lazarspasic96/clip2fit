import { SelectionCard } from '@/components/onboarding/selection-card'
import type { FitnessGoal } from '@/types/profile'
import {
  Activity,
  Dumbbell,
  Heart,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react-native'
import { Text, View } from 'react-native'

const GOAL_OPTIONS: { icon: typeof Target; title: string; value: FitnessGoal }[] = [
  { icon: Target, title: 'Lose Weight', value: 'lose_weight' },
  { icon: Dumbbell, title: 'Build Muscle', value: 'build_muscle' },
  { icon: TrendingUp, title: 'Get Stronger', value: 'get_stronger' },
  { icon: Heart, title: 'Improve Endurance', value: 'improve_endurance' },
  { icon: Activity, title: 'General Fitness', value: 'general_fitness' },
  { icon: Sparkles, title: 'Flexibility & Mobility', value: 'flexibility_mobility' },
]

interface GoalSectionProps {
  value: FitnessGoal | undefined
  onChange: (value: FitnessGoal) => void
}

export const GoalSection = ({ value, onChange }: GoalSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Fitness Goal
    </Text>
    <View className="gap-2">
      {GOAL_OPTIONS.map((option) => (
        <SelectionCard
          key={option.value}
          icon={option.icon}
          title={option.title}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  </View>
)
