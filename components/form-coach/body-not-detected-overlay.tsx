import { UserX } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

type BodyNotDetectedOverlayProps = {
  visible: boolean
}

export const BodyNotDetectedOverlay = ({ visible }: BodyNotDetectedOverlayProps) => {
  if (!visible) return null

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={StyleSheet.absoluteFill}
      className="bg-black/60 items-center justify-center"
      pointerEvents="none"
    >
      <View className="items-center gap-3">
        <UserX size={48} color="#fafafa" pointerEvents="none" />
        <Text className="text-white text-lg font-inter-bold">Body Not Detected</Text>
        <Text className="text-zinc-400 text-sm font-inter-medium text-center px-8">
          Make sure your full body is visible in the camera frame
        </Text>
      </View>
    </Animated.View>
  )
}
