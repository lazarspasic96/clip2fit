import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'

import { ExerciseInstructions } from '@/components/catalog/exercise-instructions'
import { ExerciseMotionPreview } from '@/components/workout/shared/exercise-motion-preview'
import { SourceVideoButton } from '@/components/workout/source-video-button'
import { Colors } from '@/constants/colors'
import type { CatalogExerciseDetail } from '@/types/catalog'
import { MUSCLE_GROUP_LABELS } from '@/types/catalog'

interface ExerciseLearningSheetProps {
  visible: boolean
  title: string
  exercise: CatalogExerciseDetail | null
  videoUrl: string | null
  onDismiss: () => void
  showPrimaryMuscles?: boolean
}

const formatMuscle = (muscle: string): string => MUSCLE_GROUP_LABELS[muscle] ?? muscle

export const ExerciseLearningSheet = ({
  visible,
  title,
  exercise,
  videoUrl,
  onDismiss,
  showPrimaryMuscles = true,
}: ExerciseLearningSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  const instructions = exercise?.instructions ?? []
  const primaryMuscles = showPrimaryMuscles ? (exercise?.primaryMuscleGroups ?? []) : []

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['80%']}
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 pt-2">
          <ExerciseMotionPreview images={exercise?.images ?? null} height={230} />
          <View className="flex-row items-center justify-between mt-3 px-1">
            <Text className="text-xs font-inter-medium text-content-tertiary">Looping movement preview</Text>
            <Text className="text-[11px] font-inter-semibold text-brand-accent">{'Start -> End -> Repeat'}</Text>
          </View>
        </View>

        <View className="px-5 mt-4 gap-4">
          <View>
            <Text className="text-lg font-inter-bold text-content-primary">{title}</Text>
            <Text className="text-xs font-inter text-content-tertiary mt-1">Exercise guide</Text>
          </View>

          <View className="gap-4">
            {primaryMuscles.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {primaryMuscles.map((muscle) => (
                  <View key={muscle} className="bg-background-tertiary rounded-full px-3 py-1.5">
                    <Text className="text-xs font-inter-medium text-content-secondary">{formatMuscle(muscle)}</Text>
                  </View>
                ))}
              </View>
            )}

            <ExerciseInstructions instructions={instructions} />

            {videoUrl !== null && (
              <View className="pb-1">
                <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider">Video</Text>
                <SourceVideoButton url={videoUrl} />
              </View>
            )}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
