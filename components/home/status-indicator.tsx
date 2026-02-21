import { View } from 'react-native'
import { Moon } from 'lucide-react-native'

import { Colors } from '@/constants/colors'
import type { DayStatus } from '@/types/schedule'

export const StatusIndicator = ({ status }: { status: DayStatus }) => {
  if (status === 'rest' || status === 'activeRest') {
    return <Moon size={10} color={Colors.status.rest} fill={Colors.status.rest} />
  }

  const dotColor = Colors.status[status]
  const hasRing = status === 'completed' || status === 'skipped'
  const ringColor = status === 'completed' ? Colors.badge.success.background : Colors.badge.error.background

  if (hasRing) {
    return (
      <View
        className="w-3.5 h-3.5 rounded-full items-center justify-center"
        style={{ backgroundColor: ringColor }}
      >
        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
      </View>
    )
  }

  return <View className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
}
