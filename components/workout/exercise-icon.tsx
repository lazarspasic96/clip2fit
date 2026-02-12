import { Colors } from '@/constants/colors'
import { Dumbbell } from 'lucide-react-native'
import { View } from 'react-native'

interface ExerciseIconProps {
  size?: number
}

export const ExerciseIcon = ({ size = 18 }: ExerciseIconProps) => {
  return (
    <View>
      <Dumbbell size={size} color={Colors.content.secondary} pointerEvents="none" />
    </View>
  )
}
