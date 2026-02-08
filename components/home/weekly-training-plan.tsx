import { Pressable, Text, View } from 'react-native'
import { Calendar, Plus } from 'lucide-react-native'

import { Colors } from '@/constants/colors'
import { type WeekDay } from '@/utils/mock-data'

interface WeeklyTrainingPlanProps {
  days: WeekDay[]
}

export const WeeklyTrainingPlan = ({ days }: WeeklyTrainingPlanProps) => {
  return (
    <View className="mx-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-inter-semibold text-content-primary">Weekly Training Plan</Text>
        <Pressable
          onPress={() => console.log('View weekly plan')}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm font-inter text-content-secondary">View</Text>
          <Calendar size={14} color={Colors.content.secondary} />
        </Pressable>
      </View>

      <View className="flex-row">
        {days.map((day, index) => {
          const hasWorkout = day.dotColors.length > 0
          return (
            <View key={index} className="flex-1 items-center">
              <Text className="text-xs font-inter text-content-tertiary mb-1">{day.label}</Text>

              <View
                className={`items-center justify-center rounded-lg py-1.5 w-full ${
                  day.isToday ? 'bg-brand-accent' : ''
                }`}
              >
                <Text
                  className={`text-sm font-inter-semibold ${
                    day.isToday ? 'text-background-primary' : 'text-content-primary'
                  }`}
                >
                  {day.date}
                </Text>
              </View>

              <View className="flex-row gap-1 mt-1.5 h-2">
                {hasWorkout ? (
                  day.dotColors.map((color, i) => (
                    <View
                      key={i}
                      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }}
                    />
                  ))
                ) : (
                  <Plus size={10} color={Colors.content.tertiary} />
                )}
              </View>

              {day.workoutLabel ? (
                <Text className="text-xs font-inter text-content-secondary mt-0.5">
                  {day.isRest ? 'Rest' : day.workoutLabel}
                </Text>
              ) : null}
            </View>
          )
        })}
      </View>
    </View>
  )
}
