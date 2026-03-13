import { Canvas, Circle } from '@shopify/react-native-skia'
import { StyleSheet } from 'react-native'
import { type SharedValue, useDerivedValue } from 'react-native-reanimated'

import { CONFIDENCE_THRESHOLD } from '@/constants/pose-skeleton'
import type { PoseLandmark } from '@/modules/expo-pose-camera'
import type { FormIssue } from '@/types/form-rules'

const HIGHLIGHT_COLOR = '#ef444460' // red-500 with alpha
const HIGHLIGHT_RADIUS = 24

type BodyHighlightOverlayProps = {
  landmarks: SharedValue<PoseLandmark[]>
  issues: FormIssue[]
  width: number
  height: number
}

export const BodyHighlightOverlay = ({
  landmarks,
  issues,
  width,
  height,
}: BodyHighlightOverlayProps) => {
  const issueJointNames = issues.map((i) => i.joint as string)

  const highlights = useDerivedValue(() => {
    const result: { x: number; y: number }[] = []
    for (const lm of landmarks.value) {
      if (lm.confidence > CONFIDENCE_THRESHOLD && issueJointNames.includes(lm.joint)) {
        result.push({ x: lm.x * width, y: lm.y * height })
      }
    }
    return result
  })

  if (issues.length === 0) return null

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {issues.map((_, i) => (
        <HighlightCircle key={i} index={i} highlights={highlights} />
      ))}
    </Canvas>
  )
}

type HighlightCircleProps = {
  index: number
  highlights: SharedValue<{ x: number; y: number }[]>
}

const HighlightCircle = ({ index, highlights }: HighlightCircleProps) => {
  const cx = useDerivedValue(() => {
    const h = highlights.value[index]
    return h !== undefined ? h.x : -100
  })
  const cy = useDerivedValue(() => {
    const h = highlights.value[index]
    return h !== undefined ? h.y : -100
  })

  return <Circle cx={cx} cy={cy} r={HIGHLIGHT_RADIUS} color={HIGHLIGHT_COLOR} />
}
