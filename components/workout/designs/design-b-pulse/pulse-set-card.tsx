import { Pressable, Text, View } from 'react-native'

import { CompletedSetsList } from '@/components/workout/designs/design-b-pulse/completed-sets-list'
import { LogSetButton } from '@/components/workout/shared/log-set-button'
import { PreviousPerformance } from '@/components/workout/previous-performance'
import { SetDots } from '@/components/workout/shared/set-dots'
import { StepperButton } from '@/components/workout/shared/stepper-button'
import { TappableValue } from '@/components/workout/shared/tappable-value'
import { useActiveSet } from '@/components/workout/shared/use-active-set'
import { useSetInput } from '@/components/workout/shared/use-set-input'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'

export const PulseSetCard = () => {
  const { currentExercise, skipExercise } = useActiveWorkout()
  const { activeSet, activeSetIndex } = useActiveSet()
  const input = useSetInput()

  if (currentExercise === null) return null

  const allDone = activeSet === null

  return (
    <View
      className="mx-4 rounded-2xl border border-border-primary bg-background-secondary p-5 gap-4"
      style={{
        shadowColor: Colors.brand.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* Set dots */}
      <View className="items-center">
        <SetDots sets={currentExercise.sets} activeIndex={activeSetIndex} />
      </View>

      {allDone ? (
        <CompletedSetsList exercise={currentExercise} />
      ) : (
        <>
          {/* Weight stepper */}
          {!input.isBodyweight && (
            <View className="flex-row items-center justify-between">
              <StepperButton type="decrement" onPress={input.decrementWeight} />
              <TappableValue value={input.weight} unit="kg" onChangeValue={input.setWeight} decimal />
              <StepperButton type="increment" onPress={input.incrementWeight} />
            </View>
          )}

          {/* Reps stepper */}
          <View className="flex-row items-center justify-between">
            <StepperButton type="decrement" onPress={input.decrementReps} />
            <TappableValue value={input.reps} unit="reps" onChangeValue={input.setReps} />
            <StepperButton type="increment" onPress={input.incrementReps} />
          </View>

          {/* Previous */}
          <View className="items-center">
            <PreviousPerformance
              weight={activeSet.previousWeight}
              reps={activeSet.previousReps}
              isBodyweight={input.isBodyweight}
            />
          </View>

          {/* LOG button */}
          <LogSetButton onPress={input.submitSet} disabled={!input.canSubmit} />

          {/* Skip */}
          <Pressable onPress={() => skipExercise(currentExercise.id)} hitSlop={8} className="items-center">
            <Text className="text-sm font-inter text-content-tertiary">Skip exercise</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}
