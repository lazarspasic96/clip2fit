import { Volume2, VolumeX } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type TtsMuteButtonProps = {
  isMuted: boolean
  onPress: () => void
}

export const TtsMuteButton = ({ isMuted, onPress }: TtsMuteButtonProps) => {
  const insets = useSafeAreaInsets()

  return (
    <Pressable
      onPress={onPress}
      style={{ position: 'absolute', top: insets.top + 12, left: 64 }}
      className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
    >
      {isMuted ? (
        <VolumeX size={20} color="#fafafa" pointerEvents="none" />
      ) : (
        <Volume2 size={20} color="#fafafa" pointerEvents="none" />
      )}
    </Pressable>
  )
}
