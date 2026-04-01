import { useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { CompletedSetsList } from '@/components/workout/designs/design-b-pulse/completed-sets-list'
import { LogSetButton } from '@/components/workout/shared/log-set-button'
import { PreviousPerformance } from '@/components/workout/previous-performance'
import { SetDots } from '@/components/workout/shared/set-dots'
import { SmartTargetChip } from '@/components/workout/smart-target-chip'
import { StepperButton } from '@/components/workout/shared/stepper-button'
import { TappableValue } from '@/components/workout/shared/tappable-value'
import { useActiveSet } from '@/components/workout/shared/use-active-set'
import { useSetInput, WEIGHT_STEP } from '@/components/workout/shared/use-set-input'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useSmartTarget } from '@/hooks/use-smart-target'

export const PulseSetCard = () => {
  const { currentExercise, skipExercise } = useActiveWorkout()
  const { activeSet, activeSetIndex } = useActiveSet()
  const input = useSetInput()
  const { target } = useSmartTarget()
  const [chipState, setChipState] = useState<'suggested' | 'applied' | 'overridden'>('suggested')
  const appliedWeight = useRef<number | null>(null)
  const lastActiveSetId = useRef<string | null>(null)

  // Reset chip state when active set changes
  if (activeSet !== null && activeSet.id !== lastActiveSetId.current) {
    lastActiveSetId.current = activeSet.id
    setChipState('suggested')
    appliedWeight.current = null
  }

  if (currentExercise === null) return null

  const allDone = activeSet === null
  const showChip = target !== null && !input.isBodyweight && !allDone

  const handleApplyTarget = () => {
    if (target === null) return
    input.setWeight(target.weight)
    setChipState('applied')
    appliedWeight.current = target.weight
  }

  const updateChipAfterWeightChange = (newWeight: number) => {
    if (appliedWeight.current !== null) {
      setChipState(newWeight === appliedWeight.current ? 'applied' : 'overridden')
    }
  }

  const handleWeightChange = (v: number) => {
    input.setWeight(v)
    updateChipAfterWeightChange(v)
  }

  const handleIncrementWeight = () => {
    input.incrementWeight()
    updateChipAfterWeightChange(input.weight + WEIGHT_STEP)
  }

  const handleDecrementWeight = () => {
    input.decrementWeight()
    const newWeight = Math.max(0, input.weight - WEIGHT_STEP)
    updateChipAfterWeightChange(newWeight)
  }

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
          {/* Smart target chip */}
          {showChip && (
            <View className="items-center">
              <SmartTargetChip
                target={target}
                state={chipState}
                weightUnit="kg"
                onApply={handleApplyTarget}
              />
            </View>
          )}

          {/* Weight stepper */}
          {!input.isBodyweight && (
            <View className="flex-row items-center justify-between">
              <StepperButton type="decrement" onPress={handleDecrementWeight} />
              <TappableValue value={input.weight} unit="kg" onChangeValue={handleWeightChange} decimal />
              <StepperButton type="increment" onPress={handleIncrementWeight} />
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
