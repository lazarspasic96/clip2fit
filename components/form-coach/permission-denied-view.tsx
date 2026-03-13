import { Camera } from 'lucide-react-native'
import { Linking, Pressable, Text, View } from 'react-native'

export const PermissionDeniedView = () => {
  return (
    <View className="flex-1 bg-background-primary items-center justify-center px-8">
      <Camera size={64} color="#71717a" pointerEvents="none" />
      <Text className="text-xl font-inter-bold text-content-primary mt-6 text-center">
        Camera Access Required
      </Text>
      <Text className="text-base font-inter text-content-secondary mt-3 text-center leading-6">
        Clip2Fit needs access to your camera to analyze your exercise form in real-time.
      </Text>
      <Pressable
        onPress={() => Linking.openSettings()}
        className="mt-8 bg-brand-accent rounded-xl px-8 py-4"
      >
        <Text className="text-base font-inter-bold text-content-buttonPrimary">Open Settings</Text>
      </Pressable>
    </View>
  )
}
