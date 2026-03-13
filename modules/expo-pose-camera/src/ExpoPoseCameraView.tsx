import { requireNativeView } from 'expo'
import * as React from 'react'

import type { ExpoPoseCameraViewProps } from './ExpoPoseCamera.types'

const NativeView: React.ComponentType<ExpoPoseCameraViewProps> =
  requireNativeView('ExpoPoseCamera')

const ExpoPoseCameraView = React.forwardRef<unknown, ExpoPoseCameraViewProps>((props, ref) => {
  return <NativeView ref={ref} {...props} />
})

ExpoPoseCameraView.displayName = 'ExpoPoseCameraView'

export default ExpoPoseCameraView
