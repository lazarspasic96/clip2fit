import { ExerciseIcon } from '@/components/workout/exercise-icon'
import { Colors } from '@/constants/colors'
import type { WorkoutExercise } from '@/types/workout'
import { Check, ChevronDown, ChevronRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

interface AccordionHeaderProps {
  exercise: WorkoutExercise
  isExpanded: boolean
  onToggle: () => void
}

export const AccordionHeader = ({ exercise, isExpanded, onToggle }: AccordionHeaderProps) => {
  const completedSets = exercise.sets.filter((s) => s.status === 'completed').length
  const totalSets = exercise.sets.length
  const isDone = exercise.status === 'completed'
  const isSkipped = exercise.status === 'skipped'

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-3 px-4"
    >
      <View className="flex-row items-center gap-2 flex-1">
        {isExpanded ? (
          <ChevronDown size={16} color={Colors.content.tertiary} pointerEvents="none" />
        ) : (
          <ChevronRight size={16} color={Colors.content.tertiary} pointerEvents="none" />
        )}
        <ExerciseIcon size={16} />
        <Text
          className={`text-base font-inter-semibold ${
            isDone || isSkipped ? 'text-content-tertiary' : 'text-content-primary'
          }`}
        >
          {exercise.name}
        </Text>
      </View>

      <View className="flex-row items-center gap-1.5">
        {isDone ? (
          <>
            <Check size={14} color={Colors.brand.accent} pointerEvents="none" />
            <Text className="text-xs font-inter text-brand-accent">
              {completedSets}/{totalSets}
            </Text>
          </>
        ) : isSkipped ? (
          <Text className="text-xs font-inter text-content-tertiary">Skipped</Text>
        ) : exercise.status === 'active' ? (
          <Text className="text-xs font-inter text-content-secondary">
            {completedSets}/{totalSets}
          </Text>
        ) : (
          <Text className="text-xs font-inter text-content-tertiary">{totalSets} sets</Text>
        )}
      </View>
    </Pressable>
  )
}
