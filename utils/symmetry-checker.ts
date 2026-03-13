import type { CameraAngle, FormIssue } from '@/types/form-rules'
import { calculateAngle } from './pose-angles'

const ASYMMETRY_THRESHOLD = 10 // degrees

type JointMap = Record<string, { x: number; y: number }>

type SymmetryPair = {
  name: string
  left: [string, string, string]
  right: [string, string, string]
  joint: string
}

const SYMMETRY_PAIRS: SymmetryPair[] = [
  {
    name: 'Knee Angle',
    left: ['leftHip', 'leftKnee', 'leftAnkle'],
    right: ['rightHip', 'rightKnee', 'rightAnkle'],
    joint: 'leftKnee',
  },
  {
    name: 'Elbow Angle',
    left: ['leftShoulder', 'leftElbow', 'leftWrist'],
    right: ['rightShoulder', 'rightElbow', 'rightWrist'],
    joint: 'leftElbow',
  },
  {
    name: 'Hip Angle',
    left: ['leftShoulder', 'leftHip', 'leftKnee'],
    right: ['rightShoulder', 'rightHip', 'rightKnee'],
    joint: 'leftHip',
  },
]

export const checkSymmetry = (
  jointMap: JointMap,
  cameraAngle: CameraAngle,
): FormIssue | null => {
  // Only check from front or 45-degree — side view can't assess symmetry
  if (cameraAngle === 'side') return null

  for (const pair of SYMMETRY_PAIRS) {
    const [lA, lB, lC] = pair.left
    const [rA, rB, rC] = pair.right

    const la = jointMap[lA]
    const lb = jointMap[lB]
    const lc = jointMap[lC]
    const ra = jointMap[rA]
    const rb = jointMap[rB]
    const rc = jointMap[rC]

    if (
      la === undefined || lb === undefined || lc === undefined ||
      ra === undefined || rb === undefined || rc === undefined
    ) {
      continue
    }

    const leftAngle = calculateAngle(la, lb, lc)
    const rightAngle = calculateAngle(ra, rb, rc)
    const delta = Math.abs(leftAngle - rightAngle)

    if (delta > ASYMMETRY_THRESHOLD) {
      const side = leftAngle > rightAngle ? 'right' : 'left'
      return {
        joint: pair.joint as FormIssue['joint'],
        severity: 'warning',
        message: `Uneven ${pair.name.toLowerCase()} — ${side} side is off`,
        spokenMessage: `Even out your ${pair.name.toLowerCase()}`,
      }
    }
  }

  return null
}
