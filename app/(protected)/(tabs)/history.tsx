import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BookOpen } from 'lucide-react-native'

import { Colors } from '@/constants/colors'

export default function HistoryScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-1 justify-center items-center px-6">
        <BookOpen size={48} color={Colors.content.tertiary} />
        <Text className="text-xl font-inter-semibold text-content-primary mt-4 mb-2">No saved workouts</Text>
        <Text className="text-base font-inter text-content-secondary text-center">
          Your converted workouts will appear here.
        </Text>
      </View>
    </View>
  )
}
