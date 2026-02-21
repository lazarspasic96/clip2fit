import { PreviousPerformance } from '@/components/workout/previous-performance'
import { RepsInput } from '@/components/workout/reps-input'
import { SetCheckButton } from '@/components/workout/set-check-button'
import { WeightInput } from '@/components/workout/weight-input'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { Colors } from '@/constants/colors'
import type { WorkoutSet } from '@/types/workout'
import { type ReactNode, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

interface WeightCellProps {
  set: WorkoutSet
  isActiveSet: boolean
  isEditing: boolean
  isBodyweight: boolean
  weight: string
  setWeight: (v: string) => void
}

const renderWeightCell = ({ set, isActiveSet, isEditing, isBodyweight, weight, setWeight }: WeightCellProps): ReactNode => {
  if (isBodyweight) return null
  if (set.status === 'completed' && !isEditing) {
    return (
      <Text className="text-sm font-inter text-content-primary text-center">
        {set.actualWeight ?? '-'}
      </Text>
    )
  }
  if (isActiveSet || isEditing) {
    return <WeightInput value={weight} placeholder={set.targetWeight?.toString() ?? ''} onChangeText={setWeight} />
  }
  return <Text className="text-sm font-inter text-content-tertiary text-center">-</Text>
}

interface RepsCellProps {
  set: WorkoutSet
  isActiveSet: boolean
  isEditing: boolean
  reps: string
  setReps: (v: string) => void
}

const renderRepsCell = ({ set, isActiveSet, isEditing, reps, setReps }: RepsCellProps): ReactNode => {
  if (set.status === 'completed' && !isEditing) {
    return (
      <Text className="text-sm font-inter text-content-primary text-center">
        {set.actualReps ?? '-'}
      </Text>
    )
  }
  if (isActiveSet || isEditing) {
    return <RepsInput value={reps} placeholder={set.targetReps ?? ''} onChangeText={setReps} />
  }
  return <Text className="text-sm font-inter text-content-tertiary text-center">-</Text>
}

interface SetTableRowProps {
  set: WorkoutSet
  exerciseId: string
  isBodyweight: boolean
  isActiveSet: boolean
}

export const SetTableRow = ({ set, exerciseId, isBodyweight, isActiveSet }: SetTableRowProps) => {
  const { completeSet, editSet } = useActiveWorkout()
  const [isEditing, setIsEditing] = useState(false)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const isCompleted = set.status === 'completed'
  const dotOpacity = useSharedValue(1)

  useEffect(() => {
    setWeight(set.actualWeight?.toString() ?? '')
    setReps(set.actualReps?.toString() ?? '')
    setIsEditing(false)
  }, [set.actualReps, set.actualWeight, set.id])

  if (isActiveSet) {
    dotOpacity.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true)
  }

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }))

  const handleCheck = () => {
    if (isCompleted) {
      if (!isEditing) {
        setIsEditing(true)
        return
      }

      const parsedReps = reps.length > 0 ? parseInt(reps, 10) : null
      const parsedWeight = weight.length > 0 ? parseFloat(weight) : null
      editSet(exerciseId, set.id, parsedReps, parsedWeight)
      setIsEditing(false)
      return
    }

    const parsedReps = reps.length > 0 ? parseInt(reps, 10) : null
    const parsedWeight = weight.length > 0 ? parseFloat(weight) : null
    completeSet(exerciseId, set.id, parsedReps, parsedWeight)
  }

  return (
    <View
      className={`flex-row items-center py-2 px-3 ${isCompleted ? 'bg-brand-accent/10' : ''}`}
    >
      {/* Active dot / set number */}
      <View className="w-8 items-center">
        {isActiveSet && isCompleted === false && !isEditing ? (
          <Animated.View
            style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.accent }, dotStyle]}
          />
        ) : (
          <Text className="text-xs font-inter text-content-tertiary">{set.setNumber}</Text>
        )}
      </View>

      {/* Previous */}
      <View className="w-20">
        <PreviousPerformance
          weight={set.previousWeight}
          reps={set.previousReps}
          isBodyweight={isBodyweight}
        />
      </View>

      {/* Weight */}
      <View className="w-20">
        {renderWeightCell({ set, isActiveSet, isEditing, isBodyweight, weight, setWeight })}
      </View>

      {/* Reps */}
      <View className="w-16">
        {renderRepsCell({ set, isActiveSet, isEditing, reps, setReps })}
      </View>

      {/* Check */}
      <View className="flex-1 items-end">
        {(isActiveSet || isCompleted || isEditing) && (
          <View className="items-end gap-1.5">
            <SetCheckButton checked={isCompleted && !isEditing} onPress={handleCheck} />
            {isCompleted && isEditing && (
              <Pressable onPress={() => setIsEditing(false)}>
                <Text className="text-[11px] font-inter text-content-tertiary">Cancel</Text>
              </Pressable>
            )}
          </View>
        )}
        {isCompleted && !isEditing && (
          <Pressable onPress={() => setIsEditing(true)} className="mt-1">
            <Text className="text-[11px] font-inter text-content-tertiary">Edit</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
