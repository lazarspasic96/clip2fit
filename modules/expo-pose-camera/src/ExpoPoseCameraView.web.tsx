import * as React from 'react'
import { View, Text } from 'react-native'

import type { ExpoPoseCameraViewProps } from './ExpoPoseCamera.types'

const ExpoPoseCameraView = (_props: ExpoPoseCameraViewProps) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Camera not supported on web</Text>
    </View>
  )
}

export default ExpoPoseCameraView
