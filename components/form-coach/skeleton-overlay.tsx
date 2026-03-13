import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia'
import { StyleSheet } from 'react-native'
import { type SharedValue, useDerivedValue } from 'react-native-reanimated'

import type { PoseLandmark } from '@/modules/expo-pose-camera'
import {
  BONE_STROKE_WIDTH,
  CONFIDENCE_THRESHOLD,
  JOINT_NAMES,
  JOINT_RADIUS,
  SKELETON_COLOR,
  SKELETON_CONNECTIONS,
} from '@/constants/pose-skeleton'

const SKELETON_COLOR_DIMMED = '#84cc1650'
const ISSUE_JOINT_COLOR = '#ef4444' // red-500

type SkeletonOverlayProps = {
  landmarks: SharedValue<PoseLandmark[]>
  width: number
  height: number
  dimmed?: boolean
  issueJoints?: SharedValue<string[]>
}

export const SkeletonOverlay = ({
  landmarks,
  width,
  height,
  dimmed = false,
  issueJoints,
}: SkeletonOverlayProps) => {
  const color = dimmed ? SKELETON_COLOR_DIMMED : SKELETON_COLOR

  const jointMap = useDerivedValue(() => {
    const map: Record<string, { x: number; y: number }> = {}
    for (const lm of landmarks.value) {
      if (lm.confidence > CONFIDENCE_THRESHOLD) {
        map[lm.joint] = { x: lm.x * width, y: lm.y * height }
      }
    }
    return map
  })

  const bones = useDerivedValue(() => {
    const result: { x1: number; y1: number; x2: number; y2: number }[] = []
    const map = jointMap.value
    for (const [jointA, jointB] of SKELETON_CONNECTIONS) {
      const a = map[jointA]
      const b = map[jointB]
      if (a !== undefined && b !== undefined) {
        result.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
      }
    }
    return result
  })

  const joints = useDerivedValue(() => {
    const result: { x: number; y: number; isIssue: boolean }[] = []
    const map = jointMap.value
    const issues = issueJoints?.value ?? []
    for (const key of JOINT_NAMES) {
      const j = map[key]
      if (j !== undefined) {
        result.push({ x: j.x, y: j.y, isIssue: issues.includes(key) })
      }
    }
    return result
  })

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {SKELETON_CONNECTIONS.map(([a, b], i) => (
        <SkeletonBone key={`bone-${a}-${b}`} index={i} bones={bones} color={color} />
      ))}
      {JOINT_NAMES.map((name, i) => (
        <SkeletonJoint key={`joint-${name}`} index={i} joints={joints} defaultColor={color} />
      ))}
    </Canvas>
  )
}

type SkeletonBoneProps = {
  index: number
  bones: SharedValue<{ x1: number; y1: number; x2: number; y2: number }[]>
  color: string
}

const SkeletonBone = ({ index, bones, color }: SkeletonBoneProps) => {
  const p1 = useDerivedValue(() => {
    const b = bones.value[index]
    return b !== undefined ? vec(b.x1, b.y1) : vec(-1, -1)
  })
  const p2 = useDerivedValue(() => {
    const b = bones.value[index]
    return b !== undefined ? vec(b.x2, b.y2) : vec(-1, -1)
  })

  return (
    <Line p1={p1} p2={p2} color={color} strokeWidth={BONE_STROKE_WIDTH} style="stroke" />
  )
}

type SkeletonJointProps = {
  index: number
  joints: SharedValue<{ x: number; y: number; isIssue: boolean }[]>
  defaultColor: string
}

const SkeletonJoint = ({ index, joints, defaultColor }: SkeletonJointProps) => {
  const cx = useDerivedValue(() => {
    const j = joints.value[index]
    return j !== undefined ? j.x : -100
  })
  const cy = useDerivedValue(() => {
    const j = joints.value[index]
    return j !== undefined ? j.y : -100
  })
  const jointColor = useDerivedValue(() => {
    const j = joints.value[index]
    return j !== undefined && j.isIssue ? ISSUE_JOINT_COLOR : defaultColor
  })

  return <Circle cx={cx} cy={cy} r={JOINT_RADIUS} color={jointColor} />
}
