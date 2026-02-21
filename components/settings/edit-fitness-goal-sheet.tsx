import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text } from 'react-native'

import { cn } from '@/components/ui/cn'
import { RadioGroup } from '@/components/ui/radio-group'
import { Colors } from '@/constants/colors'
import type { FitnessGoal, UserProfile } from '@/types/profile'
import { FITNESS_GOALS } from '@/types/profile'

interface EditFitnessGoalSheetProps {
  visible: boolean
  onDismiss: () => void
  currentGoal?: FitnessGoal
  onSave: (data: Partial<UserProfile>) => void
  saving: boolean
  error?: string | null
}

export const EditFitnessGoalSheet = ({
  visible,
  onDismiss,
  currentGoal,
  onSave,
  saving,
  error,
}: EditFitnessGoalSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [goal, setGoal] = useState<FitnessGoal | undefined>()

  useEffect(() => {
    if (visible) {
      setGoal(currentGoal)
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const handleSave = () => {
    if (goal === currentGoal) {
      onDismiss()
      return
    }

    onSave({ fitnessGoal: goal })
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView className="px-6 pb-8">
        <Text className="text-lg font-inter-bold text-content-primary mb-6">Fitness Goal</Text>

        <RadioGroup options={FITNESS_GOALS} value={goal} onChange={setGoal} />

        {error !== undefined && error !== null && (
          <Text className="text-sm font-inter text-red-400 mt-3">{error}</Text>
        )}

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={cn('items-center justify-center rounded-md py-3.5 bg-background-button-primary mt-6', saving && 'opacity-50')}
        >
          <Text className="text-base font-inter-semibold text-content-button-primary">
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
