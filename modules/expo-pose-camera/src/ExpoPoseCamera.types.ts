import type { StyleProp, ViewStyle } from 'react-native'

export type PoseLandmark = {
  joint: string
  x: number
  y: number
  confidence: number
}

export type PoseDetectedEvent = {
  landmarks: PoseLandmark[]
}

export type ExpoPoseCameraViewProps = {
  ref?: React.Ref<unknown>
  isActive: boolean
  cameraPosition: 'front' | 'back'
  onPoseDetected: (event: { nativeEvent: PoseDetectedEvent }) => void
  style?: StyleProp<ViewStyle>
}
