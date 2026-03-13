import { SwitchCamera } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type CameraFlipButtonProps = {
  onPress: () => void
}

export const CameraFlipButton = ({ onPress }: CameraFlipButtonProps) => {
  const insets = useSafeAreaInsets()

  return (
    <Pressable
      onPress={onPress}
      style={{ position: 'absolute', top: insets.top + 12, left: 16 }}
      className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
    >
      <SwitchCamera size={20} color="#fafafa" pointerEvents="none" />
    </Pressable>
  )
}
