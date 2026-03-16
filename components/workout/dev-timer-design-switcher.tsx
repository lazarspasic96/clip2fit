import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { TimerDesign } from '@/stores/timer-design-store'
import { useTimerDesign } from '@/stores/timer-design-store'

const LABELS: Record<TimerDesign, string> = {
  'pulse-ticker': 'Ticker',
  'orbit': 'Orbit',
  'float-pill': 'Pill',
}

export const DevTimerDesignSwitcher = () => {
  const { design, switchDesign, designs } = useTimerDesign()

  if (!__DEV__) return null

  return (
    <View className="flex-row items-center justify-center gap-2 py-2 px-4">
      {designs.map((d) => {
        const isActive = d === design
        return (
          <Pressable
            key={d}
            onPress={() => switchDesign(d)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: isActive ? Colors.brand.accent : Colors.background.tertiary,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter-SemiBold',
                color: isActive ? Colors.content.buttonPrimary : Colors.content.secondary,
              }}
            >
              {LABELS[d]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
