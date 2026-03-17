import { BlurTargetView } from 'expo-blur'
import type { RefObject } from 'react'
import { Platform, View, type ViewProps } from 'react-native'

interface ScreenBlurTargetProps extends ViewProps {
  targetRef: RefObject<View | null>
}

export const ScreenBlurTarget = ({ targetRef, ...props }: ScreenBlurTargetProps) => {
  if (Platform.OS === 'android') {
    return <BlurTargetView {...props} ref={targetRef} />
  }

  return <View {...props} ref={targetRef} />
}
