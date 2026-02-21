import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { PulseRing } from '@/components/workout/designs/design-b-pulse/pulse-ring'
import { PulseSetCard } from '@/components/workout/designs/design-b-pulse/pulse-set-card'
import { SegmentedProgressBar } from '@/components/workout/segmented-progress-bar'
import { useActiveSet } from '@/components/workout/shared/use-active-set'
import { useElapsedTimer } from '@/components/workout/shared/use-elapsed-timer'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface DashboardProps {
  onBack: () => void
  onFinish: () => void
  isEditMode?: boolean
  learningPill?: React.ReactNode
}

export const PulseDashboard = ({ onBack, onFinish, isEditMode, learningPill }: DashboardProps) => {
  const { session, currentExercise, navigateExercise } = useActiveWorkout()
  const { activeSetIndex, totalCount } = useActiveSet()
  useElapsedTimer()

  if (session === null || currentExercise === null) return null

  const exercises = session.plan.exercises
  const index = session.activeExerciseIndex
  const canGoPrev = index > 0
  const canGoNext = index < exercises.length - 1
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.status === 'completed').length, 0)
  const progressPct = totalSets > 0 ? completedSets / totalSets : 0
  const pct = Math.round(progressPct * 100)
  const setLabel = `SET ${activeSetIndex + 1}/${totalCount}`

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={onBack} hitSlop={8}>
          <ChevronLeft size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
        <Text className="text-base font-inter-bold text-content-primary flex-1 text-center" numberOfLines={1}>
          {session.plan.title}
        </Text>
        <Pressable onPress={onFinish} hitSlop={8}>
          <Text className="text-sm font-inter-semibold text-brand-accent">
            {isEditMode === true ? 'Save' : 'Finish'}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {/* Pulse ring */}
        <View className="items-center mt-8">
          <PulseRing progress={progressPct} pct={pct} setLabel={setLabel} />
        </View>

        {/* Exercise name with nav arrows */}
        <Animated.View key={currentExercise.id} entering={FadeIn.duration(200)} className="items-center mt-5">
          <View className="flex-row items-center px-4">
            <Pressable
              onPress={() => navigateExercise(index - 1)}
              disabled={!canGoPrev}
              hitSlop={12}
              className="w-10 h-10 items-center justify-center"
              style={{ opacity: canGoPrev ? 1 : 0.2 }}
            >
              <ChevronLeft size={22} color={Colors.content.primary} pointerEvents="none" />
            </Pressable>

            <Text className="flex-1 text-lg font-inter-bold text-content-primary text-center" numberOfLines={1}>
              {currentExercise.name}
            </Text>

            <Pressable
              onPress={() => navigateExercise(index + 1)}
              disabled={!canGoNext}
              hitSlop={12}
              className="w-10 h-10 items-center justify-center"
              style={{ opacity: canGoNext ? 1 : 0.2 }}
            >
              <ChevronRight size={22} color={Colors.content.primary} pointerEvents="none" />
            </Pressable>
          </View>

          <View className="px-4 mt-2 w-full">
            <SegmentedProgressBar activeIndex={index} total={exercises.length} onPress={navigateExercise} />
          </View>
          <Text className="text-sm text-center font-inter text-content-tertiary my-3">
            {index + 1} of {exercises.length}
          </Text>
        </Animated.View>

        {/* Learning pill */}
        {learningPill !== undefined && <View className="px-4 mb-3">{learningPill}</View>}

        {/* Set card */}
        <Animated.View key={`card-${currentExercise.id}`} entering={FadeIn.duration(200)}>
          <PulseSetCard />
        </Animated.View>
      </ScrollView>
    </View>
  )
}
