import { requireNativeView } from 'expo'

import type { ExposePoseCameraViewProps } from './ExposePoseCamera.types'

export const ExposePoseCameraView =
  requireNativeView<ExposePoseCameraViewProps>('ExposePoseCamera')
