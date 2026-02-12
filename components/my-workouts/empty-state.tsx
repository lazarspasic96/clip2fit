import { Dumbbell } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

export const EmptyState = () => (
  <View className="flex-1 justify-center items-center px-6">
    <Dumbbell size={48} color={Colors.brand.accent} />
    <Text className="text-xl font-inter-semibold text-content-primary mt-4 mb-2">No saved workouts</Text>
    <Text className="text-base font-inter text-content-secondary text-center">
      Your converted workouts will appear here.
    </Text>
  </View>
)
