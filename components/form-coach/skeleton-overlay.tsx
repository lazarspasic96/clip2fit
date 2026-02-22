import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia'
import { StyleSheet } from 'react-native'
import { type SharedValue, useDerivedValue } from 'react-native-reanimated'

import {
  BONE_STROKE_WIDTH,
  CONFIDENCE_THRESHOLD,
  JOINT_RADIUS,
  SKELETON_COLOR,
  SKELETON_CONNECTIONS,
  TRACKED_JOINTS,
} from '@/constants/pose-skeleton'
import type { PoseLandmark } from '@/modules/expo-pose-camera'

type SkeletonOverlayProps = {
  landmarks: SharedValue<PoseLandmark[]>
  width: number
  height: number
}

// Derived data shared between sub-components
type DerivedData = {
  joints: { x: number; y: number }[]
  bones: { x1: number; y1: number; x2: number; y2: number }[]
}

type BoneProps = {
  index: number
  data: SharedValue<DerivedData>
}

const Bone = ({ index, data }: BoneProps) => {
  const p1 = useDerivedValue(() => {
    'worklet'
    const bone = data.value.bones[index]
    return bone !== undefined ? vec(bone.x1, bone.y1) : vec(-1, -1)
  }, [data, index])

  const p2 = useDerivedValue(() => {
    'worklet'
    const bone = data.value.bones[index]
    return bone !== undefined ? vec(bone.x2, bone.y2) : vec(-1, -1)
  }, [data, index])

  const opacity = useDerivedValue(() => {
    'worklet'
    return data.value.bones[index] !== undefined ? 1 : 0
  }, [data, index])

  return (
    <Line
      p1={p1}
      p2={p2}
      color={SKELETON_COLOR}
      strokeWidth={BONE_STROKE_WIDTH}
      opacity={opacity}
    />
  )
}

type JointDotProps = {
  index: number
  data: SharedValue<DerivedData>
}

const JointDot = ({ index, data }: JointDotProps) => {
  const cx = useDerivedValue(() => {
    'worklet'
    const j = data.value.joints[index]
    return j !== undefined ? j.x : 0
  }, [data, index])

  const cy = useDerivedValue(() => {
    'worklet'
    const j = data.value.joints[index]
    return j !== undefined ? j.y : 0
  }, [data, index])

  const opacity = useDerivedValue(() => {
    'worklet'
    return data.value.joints[index] !== undefined ? 1 : 0
  }, [data, index])

  return (
    <Circle cx={cx} cy={cy} r={JOINT_RADIUS} color={SKELETON_COLOR} opacity={opacity} />
  )
}

// Pre-computed indices for stable rendering (no dynamic .map keys)
const BONE_INDICES = SKELETON_CONNECTIONS.map((_, i) => i)
const JOINT_INDICES = Array.from({ length: TRACKED_JOINTS.length }, (_, i) => i)

export const SkeletonOverlay = ({ landmarks, width, height }: SkeletonOverlayProps) => {
  const derivedData = useDerivedValue<DerivedData>(() => {
    'worklet'
    const map: Record<string, { x: number; y: number }> = {}
    for (const lm of landmarks.value) {
      if (lm.confidence > CONFIDENCE_THRESHOLD) {
        map[lm.joint] = { x: lm.x * width, y: lm.y * height }
      }
    }

    const joints: { x: number; y: number }[] = []
    for (let i = 0; i < TRACKED_JOINTS.length; i += 1) {
      const jointName = TRACKED_JOINTS[i]
      const joint = map[jointName]
      if (joint !== undefined) {
        joints.push(joint)
      }
    }

    const bones: { x1: number; y1: number; x2: number; y2: number }[] = []
    for (let i = 0; i < SKELETON_CONNECTIONS.length; i += 1) {
      const [jointA, jointB] = SKELETON_CONNECTIONS[i]
      const a = map[jointA]
      const b = map[jointB]
      if (a !== undefined && b !== undefined) {
        bones.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
      }
    }

    return { joints, bones }
  }, [landmarks, width, height])

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {BONE_INDICES.map((i) => (
        <Bone key={`bone-${i}`} index={i} data={derivedData} />
      ))}
      {JOINT_INDICES.map((i) => (
        <JointDot key={`joint-${i}`} index={i} data={derivedData} />
      ))}
    </Canvas>
  )
}
