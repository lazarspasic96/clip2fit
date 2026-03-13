import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { hasFormRules, getCanonicalExerciseNames } from '@/constants/form-rules'
import { useWorkoutsQuery } from '@/hooks/use-api'

const FormCoachExerciseScreen = () => {
  const router = useRouter()
  const { workouts } = useWorkoutsQuery()

  const allExerciseNames = Array.from(
    new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name)))
  )
  const filteredNames = allExerciseNames.filter((name) => hasFormRules(name)).sort()
  const displayNames = filteredNames.length > 0 ? filteredNames : getCanonicalExerciseNames()

  const handleSelect = (exercise: string) => {
    router.back()
    // Small delay to let sheet dismiss animation start before pushing new screen
    setTimeout(() => {
      router.push(`/(protected)/form-coach?exercise=${encodeURIComponent(exercise)}` as never)
    }, 100)
  }

  return (
    <FlashList
      data={displayNames}
      keyExtractor={(item) => item}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <View className="px-5 pt-4 pb-3">
          <SheetTitle>Select Exercise</SheetTitle>
          {filteredNames.length === 0 && (
            <Text className="text-sm font-inter text-content-secondary mt-1">
              No library exercises matched. Showing supported exercises:
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handleSelect(item)}
          className="py-3.5 px-5 active:bg-background-tertiary"
        >
          <Text className="text-base font-inter text-content-primary">{item}</Text>
        </Pressable>
      )}
      ItemSeparatorComponent={() => (
        <View className="mx-5" style={{ height: 1, backgroundColor: Colors.border.primary }} />
      )}
      ListEmptyComponent={
        <View className="items-center py-12">
          <Text className="text-base font-inter text-content-secondary">
            No exercises found
          </Text>
        </View>
      }
    />
  )
}

export default FormCoachExerciseScreen
