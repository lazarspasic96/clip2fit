import { Dumbbell } from 'lucide-react-native'
import { View } from 'react-native'

import { Colors } from '@/constants/colors'

interface ExercisePlaceholderProps {
  size?: number
  height?: number
}

export const ExercisePlaceholder = ({ size = 32, height = 80 }: ExercisePlaceholderProps) => {
  return (
    <View
      className="bg-background-tertiary items-center justify-center rounded-xl"
      style={{ height }}
    >
      <Dumbbell size={size} color={Colors.content.tertiary} pointerEvents="none" />
    </View>
  )
}
