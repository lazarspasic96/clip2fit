import { Pressable, Text, View } from 'react-native'

import type { WeekDay } from '@/types/schedule'

interface SegmentedStripProps {
  days: WeekDay[]
  todayIndex: number
  onDayPress: () => void
}

export const SegmentedStrip = ({ days, todayIndex, onDayPress }: SegmentedStripProps) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#18181b',
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#27272a',
      borderCurve: 'continuous',
    }}
  >
    {days.map((day, index) => {
      const isToday = index === todayIndex
      const hasWorkout = day.dotColor !== undefined && day.workoutAbbrev !== undefined
      const isLast = index === days.length - 1

      return (
        <Pressable
          key={index}
          onPress={onDayPress}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            backgroundColor: isToday ? '#27272a' : 'transparent',
            borderRightWidth: isLast ? 0 : 0.5,
            borderRightColor: '#3f3f46',
          }}
        >
          {/* Day initial */}
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Inter_400Regular',
              color: isToday ? '#bef264' : '#71717a',
            }}
          >
            {day.label.charAt(0)}
          </Text>

          {/* Date number */}
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: isToday ? '#fafafa' : '#a1a1aa',
              marginTop: 2,
              fontVariant: ['tabular-nums'],
            }}
          >
            {day.date}
          </Text>

          {/* Colored bottom bar for workout days */}
          <View style={{ marginTop: 6, height: 16, justifyContent: 'center' }}>
            {hasWorkout ? (
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: `${day.dotColor}1A`,
                  borderCurve: 'continuous',
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: 'Inter_700Bold',
                    color: day.dotColor,
                  }}
                >
                  {day.workoutAbbrev}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      )
    })}
  </View>
)
