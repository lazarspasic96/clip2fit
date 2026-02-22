import type { ViewProps } from 'react-native'

export type PoseLandmark = {
  joint: string
  x: number
  y: number
  confidence: number
}

export type PoseDetectedEvent = {
  landmarks: PoseLandmark[]
}

export type ExposePoseCameraViewProps = ViewProps & {
  isActive: boolean
  onPoseDetected?: (event: { nativeEvent: PoseDetectedEvent }) => void
}
