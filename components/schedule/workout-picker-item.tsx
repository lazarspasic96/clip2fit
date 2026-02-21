import { Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import type { DayOfWeek } from '@/types/schedule'
import type { WorkoutPlan } from '@/types/workout'
import { DAY_SHORT_LABELS } from '@/utils/schedule'

interface WorkoutPickerItemProps {
  workout: WorkoutPlan
  assignedDays: DayOfWeek[]
  isSelected: boolean
  onSelect: () => void
}

export const WorkoutPickerItem = ({
  workout,
  assignedDays,
  isSelected,
  onSelect,
}: WorkoutPickerItemProps) => (
  <Pressable
    onPress={onSelect}
    className={cn(
      'px-5 py-4 border-b border-border-primary',
      isSelected && 'bg-background-tertiary',
    )}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-inter-semibold text-content-primary" numberOfLines={1}>
          {workout.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1.5">
          {workout.targetMuscles !== undefined && workout.targetMuscles.length > 0 && (
            <View className="flex-row gap-1">
              {workout.targetMuscles.slice(0, 2).map((m) => (
                <View key={m} className="px-1.5 py-0.5 rounded-full bg-background-tertiary">
                  <Text className="text-xs font-inter capitalize text-brand-accent">{m}</Text>
                </View>
              ))}
            </View>
          )}
          {workout.estimatedDurationMinutes > 0 && (
            <Text className="text-xs font-inter text-brand-accent">
              {workout.estimatedDurationMinutes}min
            </Text>
          )}
          <View className="px-1.5 py-0.5 rounded-full bg-background-tertiary">
            <Text className="text-xs font-inter capitalize text-brand-accent">
              {workout.difficulty}
            </Text>
          </View>
        </View>
      </View>

      {/* Day badges */}
      {assignedDays.length > 0 && (
        <View className="flex-row gap-1">
          {assignedDays.map((d) => (
            <View key={d} className="w-6 h-6 rounded-full bg-brand-accent items-center justify-center">
              <Text className="text-xs font-inter-bold text-background-primary">
                {DAY_SHORT_LABELS[d].charAt(0)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </Pressable>
)
