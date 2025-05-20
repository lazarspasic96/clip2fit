import { Text, Card, XStack, YStack, useTheme } from 'tamagui'
import { Dumbbell, Moon } from '@tamagui/lucide-icons'
import { useMemo } from 'react'

type TrainingType = 'upper' | 'lower' | 'full' | 'cardio' | 'rest'

type DayTraining = {
  day: string
  shortDay: string
  training?: TrainingType
}

type WeeklyPlanProps = {
  trainings?: Record<string, TrainingType>
}

export const WeeklyPlan = ({ trainings = {} }: WeeklyPlanProps) => {
  const theme = useTheme()
  const today = useMemo(() => {
    const date = new Date()
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }, [])

  const days: DayTraining[] = useMemo(() => {
    return [
      { day: 'Monday', shortDay: 'MON', training: trainings['Monday'] },
      { day: 'Tuesday', shortDay: 'TUE', training: trainings['Tuesday'] },
      { day: 'Wednesday', shortDay: 'WED', training: trainings['Wednesday'] },
      { day: 'Thursday', shortDay: 'THU', training: trainings['Thursday'] },
      { day: 'Friday', shortDay: 'FRI', training: trainings['Friday'] },
      { day: 'Saturday', shortDay: 'SAT', training: trainings['Saturday'] },
      { day: 'Sunday', shortDay: 'SUN', training: trainings['Sunday'] },
    ]
  }, [trainings])

  const getTrainingIcon = (training?: TrainingType) => {
    if (!training || training === 'rest') {
      return <Moon size={20} color="$blue10" />
    }

    return <Dumbbell size={20} color="$blue10" />
  }

  const getTrainingLabel = (training?: TrainingType) => {
    if (!training || training === 'rest') {
      return 'Rest'
    }

    const formattedTraining = training.charAt(0).toUpperCase() + training.slice(1)
    return formattedTraining
  }

  return (
    <XStack gap="$2" width="100%" style={{ justifyContent: 'space-between' }}>
      {days.map(day => (
        <Card
          key={day.day}
          flex={1}
          height={80}
          backgroundColor="white"
          scale={today === day.day ? 1.1 : 1}
          borderRadius="$4"
          shadowColor="rgba(0,0,0,0.15)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          padding="$2"
          borderWidth={today === day.day ? 2 : 0}
          style={{
            borderColor: today === day.day ? theme.blue10.get() : undefined,
          }}
        >
          <YStack style={{ alignItems: 'center', justifyContent: 'space-between' }} flex={1}>
            <Text
              fontSize="$1"
              fontWeight="bold"
              style={{ color: today === day.day ? theme.blue10.get() : '$gray10' }}
            >
              {day.shortDay}
            </Text>
            {getTrainingIcon(day.training)}
            <Text fontSize="$1" style={{ color: theme.gray10?.get() || '#999' }}>
              {getTrainingLabel(day.training)}
            </Text>
          </YStack>
        </Card>
      ))}
    </XStack>
  )
}
