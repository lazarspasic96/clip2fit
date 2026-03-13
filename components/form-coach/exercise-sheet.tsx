import { FlashList } from '@shopify/flash-list'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

type ExerciseSheetProps = {
  exercises: string[]
  onSelect: (exercise: string) => void
}

export const ExerciseSheet = ({ exercises, onSelect }: ExerciseSheetProps) => {
  return (
    <View className="flex-1 bg-background-secondary pt-4 px-4">
      <Text className="text-lg font-inter-bold text-content-primary text-center mb-4">
        Select Exercise
      </Text>
      <FlashList
        data={exercises}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="py-3 px-4 rounded-xl active:bg-background-tertiary"
          >
            <Text className="text-base font-inter text-content-primary">{item}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.border.primary }} />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-base font-inter text-content-secondary">
              No exercises found
            </Text>
          </View>
        }
      />
    </View>
  )
}
