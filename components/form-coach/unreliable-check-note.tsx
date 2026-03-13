import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import type { CameraAngle } from '@/types/form-rules'

const AUTO_HIDE_MS = 5000

type UnreliableCheckNoteProps = {
  skippedChecks: string[]
  currentAngle: CameraAngle
}

export const UnreliableCheckNote = ({ skippedChecks, currentAngle }: UnreliableCheckNoteProps) => {
  const [visible, setVisible] = useState(false)
  const skippedKey = skippedChecks.join(',')

  useEffect(() => {
    if (skippedChecks.length > 0) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), AUTO_HIDE_MS)
      return () => clearTimeout(timer)
    }
    setVisible(false)
    return undefined
  }, [skippedKey, skippedChecks.length])

  if (!visible || skippedChecks.length === 0) return null

  const suggestedView = currentAngle === 'side' ? 'front' : 'side'

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute top-24 left-4 right-4"
      pointerEvents="none"
    >
      <View className="bg-zinc-800/90 rounded-xl px-4 py-3">
        <Text className="text-zinc-300 text-xs font-inter-medium">
          Switch to {suggestedView} view to check: {skippedChecks.join(', ')}
        </Text>
      </View>
    </Animated.View>
  )
}
