import { GripVertical } from 'lucide-react-native'
import type { GestureType } from 'react-native-gesture-handler'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

interface DragHandleProps {
  gesture: GestureType
}

export const DragHandle = ({ gesture }: DragHandleProps) => (
  <GestureDetector gesture={gesture}>
    <Animated.View
      style={{
        width: 28,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GripVertical size={16} color={Colors.content.tertiary} pointerEvents="none" />
    </Animated.View>
  </GestureDetector>
)
