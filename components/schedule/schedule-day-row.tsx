import { Check, Plus } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'

import { cn } from '@/components/ui/cn'
import { Colors } from '@/constants/colors'
import type { DayOfWeek, ScheduleEntry } from '@/types/schedule'
import { DAY_LABELS } from '@/utils/schedule'

interface ScheduleDayRowProps {
  entry: ScheduleEntry
  dayOfWeek: DayOfWeek
  isToday: boolean
  onPress: () => void
  showCheckmark: boolean
  index: number
}

export const ScheduleDayRow = ({ entry, dayOfWeek, isToday, onPress, showCheckmark, index }: ScheduleDayRowProps) => {
  const hasWorkout = entry.workoutId !== null

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        className={cn('mx-5 mb-3 rounded-xl overflow-hidden', isToday && 'border-2 border-brand-logo')}
      >
        <View className="flex-row items-center px-4 py-4 bg-background-secondary">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-inter-bold text-content-primary">{DAY_LABELS[dayOfWeek]}</Text>
              {isToday && (
                <View className="px-2 py-0.5 rounded-full bg-brand-accent">
                  <Text className="text-xs font-inter-semibold text-background-primary">Today</Text>
                </View>
              )}
            </View>

            {hasWorkout && entry.workout !== null && (
              <View className="mt-1">
                <Text className="text-sm font-inter-semibold text-content-secondary" numberOfLines={1}>
                  {entry.workout.title}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  {entry.workout.targetMuscles !== undefined && entry.workout.targetMuscles.length > 0 && (
                    <View className="flex-row gap-1">
                      {entry.workout.targetMuscles.slice(0, 3).map((m) => (
                        <View key={m} className="px-2 py-0.5 rounded-full bg-background-tertiary">
                          <Text className="text-xs font-inter text-content-secondary capitalize">{m}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {entry.workout.estimatedDurationMinutes > 0 && (
                    <Text className="text-xs font-inter text-content-tertiary">
                      {entry.workout.estimatedDurationMinutes}min
                    </Text>
                  )}
                </View>
              </View>
            )}

            {!hasWorkout && (
              <View className="flex-row items-center gap-1.5 mt-1">
                <Plus size={14} color={Colors.content.tertiary} pointerEvents="none" />
                <Text className="text-sm font-inter text-content-tertiary">Tap to assign</Text>
              </View>
            )}
          </View>

          {/* Success checkmark flash */}
          {showCheckmark && (
            <Animated.View entering={FadeInUp.springify()}>
              <Check size={20} color={Colors.brand.accent} pointerEvents="none" />
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}
