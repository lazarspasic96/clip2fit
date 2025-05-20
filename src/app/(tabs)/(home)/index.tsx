import { WeeklyPlan } from 'components/weekly-plan'
import { WorkoutCard } from 'components/workout-card'
import { SafeAreaView } from 'react-native-safe-area-context'
import { H2, H3, Paragraph, XStack, YStack } from 'tamagui'
import { useMemo } from 'react'

export default function HomeScreen() {
  // Dummy weekly training data
  const weeklyTrainings = useMemo(
    () => ({
      Monday: 'push' as const,
      Tuesday: 'pull' as const,
      Wednesday: 'legs' as const,
      Thursday: 'rest' as const,
      Friday: 'cardio' as const,
      Saturday: 'upper' as const,
      Sunday: 'lower' as const,
    }),
    []
  )
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack height="100%" p="$4" flex={1}>
        <XStack items="center" gap="$1">
          <H3 fontWeight="bold" fontSize="$4">
            Clip2
          </H3>
          <H2 fontSize="$4">fit</H2>
        </XStack>

        <YStack>
          <H3 lineHeight={0} mt="$2" fontWeight="bold" fontSize="$6">
            Hi, Marko! 👋
          </H3>
        </YStack>
        <Paragraph mt="$2" fontSize="$4">
          Push yourself because no one else is going to do it for you.
        </Paragraph>

        <YStack mt="$6">
          <WorkoutCard />
        </YStack>
        <YStack mt="$6">
          <WeeklyPlan trainings={weeklyTrainings} />
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
