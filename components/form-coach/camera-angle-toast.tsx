import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

type CameraAngleToastProps = {
  visible: boolean
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 4000

export const CameraAngleToast = ({ visible, onDismiss }: CameraAngleToastProps) => {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="absolute top-24 left-6 right-6 items-center"
      pointerEvents="none"
    >
      <View className="bg-yellow-500/90 rounded-xl px-4 py-3">
        <Text className="text-black text-sm font-inter-bold text-center">
          Side view recommended for full form analysis
        </Text>
      </View>
    </Animated.View>
  )
}
