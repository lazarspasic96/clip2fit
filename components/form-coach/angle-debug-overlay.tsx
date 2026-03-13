import { Text, View } from 'react-native'

import type { CameraAngle } from '@/types/form-rules'

type AngleDebugOverlayProps = {
  angles: Record<string, number>
  cameraAngle: CameraAngle
}

export const AngleDebugOverlay = ({ angles, cameraAngle }: AngleDebugOverlayProps) => {
  if (!__DEV__) return null

  return (
    <View className="absolute top-28 left-2 bg-black/70 rounded-lg px-3 py-2">
      <Text className="text-zinc-400 text-[10px] font-inter-medium mb-1">
        View: {cameraAngle}
      </Text>
      {Object.entries(angles).map(([name, value]) => (
        <Text key={name} className="text-lime-400 text-[10px] font-mono">
          {name}: {value.toFixed(1)}°
        </Text>
      ))}
    </View>
  )
}
