import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PrImprovementBadge } from '@/components/pr-celebration/shared/pr-improvement-badge'
import type { PrScreenData } from '@/components/pr-celebration/shared/use-pr-screen-data'
import { TopExerciseCard } from '@/components/stats/shared/top-exercise-card'
import { Button } from '@/components/ui/button'
import { DismissButton } from '@/components/ui/dismiss-button'
import type { StatsTopExercise } from '@/types/stats'

import { Confetti } from './confetti'
import { TrophyHero } from './trophy-hero'
import { WorkoutSummaryStrip } from './workout-summary-strip'

export const TrophyPodiumScreen = ({ data }: { data: PrScreenData }) => {
  const insets = useSafeAreaInsets()
  const prCount = data.prs.length

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  const handlePressExercise = (exercise: StatsTopExercise) => {
    data.onNavigateToExercise(exercise.catalogExerciseId, exercise.exerciseName)
  }

  // Map PRs to StatsTopExercise shape for TopExerciseCard
  const prExercises: StatsTopExercise[] = data.prs.map((pr) => {
    const sessionExercise = data.session.plan.exercises.find((ex) => ex.id === pr.exercise_id)
    return {
      catalogExerciseId: pr.catalog_exercise_id,
      exerciseName: pr.exercise_name,
      sessionCount: 0,
      primaryMuscleGroup: sessionExercise?.muscleGroups[0] ?? null,
    }
  })

  const summaryDelay = 500 + prCount * 120

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      {/* X button */}
      <View style={{ position: 'absolute', top: insets.top + 8, right: 20, zIndex: 20 }}>
        <DismissButton onPress={data.onDismiss} />
      </View>

      {/* Confetti layer */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 10 }} pointerEvents="none">
        <Confetti />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 100,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <TrophyHero prCount={prCount} />
        </View>

        {/* PR Exercise Cards — vertical list */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {prExercises.map((exercise, index) => {
            const pr = data.prs[index]
            return (
              <Animated.View key={pr?.exercise_id ?? index} entering={FadeInUp.delay(400 + index * 120).springify().damping(14)}>
                <TopExerciseCard
                  exercise={exercise}
                  index={index}
                  tone="lab"
                  onPress={handlePressExercise}
                />
                {pr !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Onest-Bold', color: '#84cc16' }}>
                      {pr.new_weight}kg
                    </Text>
                    <PrImprovementBadge newWeight={pr.new_weight} previousWeight={pr.previous_weight} />
                  </View>
                )}
              </Animated.View>
            )
          })}
        </View>

        {/* Workout summary */}
        <View style={{ paddingHorizontal: 20 }}>
          <WorkoutSummaryStrip summary={data.summary} entryDelay={summaryDelay} />
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
          backgroundColor: '#09090b',
        }}
      >
        <Button onPress={data.onDismiss}>Done</Button>
      </View>
    </View>
  )
}
