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
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: ringColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
      </View>
    )
  }

  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
}
