import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'

import { ExerciseImagePager } from '@/components/catalog/exercise-image-pager'
import { ExerciseInstructions } from '@/components/catalog/exercise-instructions'
import { ExerciseTags } from '@/components/catalog/exercise-tags'
import { Colors } from '@/constants/colors'
import type { CatalogExerciseDetail } from '@/types/catalog'

interface ExerciseInfoSheetProps {
  visible: boolean
  exercise: CatalogExerciseDetail | null
  onDismiss: () => void
}

export const ExerciseInfoSheet = ({ visible, exercise, onDismiss }: ExerciseInfoSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  if (exercise === null) return null

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['70%']}
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ExerciseImagePager images={exercise.images} />

        <View className="px-5 mt-4 gap-4">
          <Text className="text-lg font-inter-bold text-content-primary">{exercise.name}</Text>

          <ExerciseTags exercise={exercise} />

          <ExerciseInstructions instructions={exercise.instructions} />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
