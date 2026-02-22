import { Camera } from 'lucide-react-native'
import { Linking, Pressable, Text, View } from 'react-native'

export const PermissionDeniedView = () => {
  return (
    <View className="flex-1 bg-black items-center justify-center px-8">
      <Camera size={64} color="#71717a" pointerEvents="none" />
      <Text className="text-white text-xl font-semibold mt-6 text-center">
        Camera Access Required
      </Text>
      <Text className="text-zinc-400 text-base mt-3 text-center leading-6">
        Form Coach needs camera access to analyze your exercise form in real-time. Please enable
        camera access in Settings.
      </Text>
      <Pressable
        onPress={() => Linking.openSettings()}
        className="mt-8 bg-white/20 px-8 py-3.5 rounded-full active:bg-white/30"
      >
        <Text className="text-white font-semibold text-base">Open Settings</Text>
      </Pressable>
    </View>
  )
}
