import { ChevronLeft } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { useElapsedTimer } from '@/components/workout/shared/use-elapsed-timer'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface CompactHeaderProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
}

export const CompactHeader = ({ onBack, onFinish, isEditMode }: CompactHeaderProps) => {
  const { session } = useActiveWorkout()
  const { formatted } = useElapsedTimer()

  if (session === null) return null

  const exercises = session.plan.exercises
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.status === 'completed').length,
    0,
  )
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return (
    <View className="flex-row items-center px-4 py-2.5 gap-3">
      <Pressable onPress={onBack} hitSlop={8}>
        <ChevronLeft size={22} color={Colors.content.primary} pointerEvents="none" />
      </Pressable>

      <Text className="text-sm font-inter-semibold text-content-primary">{formatted}</Text>

      {/* Progress bar */}
      <View className="flex-1 h-2 rounded-full bg-background-tertiary overflow-hidden">
        <View
          className="h-full rounded-full bg-brand-accent"
          style={{ width: `${pct}%` }}
        />
      </View>

      <Text className="text-xs font-inter-semibold text-content-secondary">{pct}%</Text>

      <Pressable onPress={onFinish} hitSlop={8}>
        <Text className="text-sm font-inter-semibold text-brand-accent">
          {isEditMode === true ? 'Save' : 'Finish'}
        </Text>
      </Pressable>
    </View>
  )
}
