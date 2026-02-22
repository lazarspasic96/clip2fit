import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet'
import { useRouter } from 'expo-router'
import { forwardRef } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useWorkoutsQuery } from '@/hooks/use-api'

type ExerciseSheetProps = {
  onDismiss?: () => void
  onSelect?: (name: string) => void
}

export const ExerciseSheet = forwardRef<BottomSheetModal, ExerciseSheetProps>(
  ({ onDismiss, onSelect }, ref) => {
    const router = useRouter()
    const { workouts } = useWorkoutsQuery()

    const exerciseNames = Array.from(
      new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name)))
    ).sort()

    const dismiss = () => {
      if (ref !== null && typeof ref !== 'function' && ref.current !== null) {
        ref.current.dismiss()
      }
    }

    const handleSelect = (name: string) => {
      dismiss()
      if (onSelect !== undefined) {
        onSelect(name)
      } else {
        router.push(`/(protected)/form-coach?exercise=${encodeURIComponent(name)}`)
      }
    }

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['50%', '80%']}
        enablePanDownToClose
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: Colors.background.secondary }}
        handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.6}
            pressBehavior="close"
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <BottomSheetFlatList
          data={exerciseNames}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <View className="px-6 pb-4">
              <Text className="text-xl font-semibold text-content-primary">
                Choose an Exercise
              </Text>
              <Text className="text-sm text-content-secondary mt-1">
                Select an exercise to analyze your form
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              className="px-6 py-3.5 active:bg-background-tertiary"
            >
              <Text className="text-base text-content-primary">{item}</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px mx-6 bg-border-primary" />
          )}
        />
      </BottomSheetModal>
    )
  }
)

ExerciseSheet.displayName = 'ExerciseSheet'
