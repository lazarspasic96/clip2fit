import { calculateAngle } from './pose-angles'

const WINDOW_SIZE = 10
const ROUNDING_INCREASE_THRESHOLD = 15 // degrees increase in 5 frames
const EXCESSIVE_LEAN_THRESHOLD = 45

type JointMap = Record<string, { x: number; y: number }>

export const createBackRoundingDetector = () => {
  const angleHistory: number[] = []

  const addFrame = (jointMap: JointMap): { isRounding: boolean; isExcessiveLean: boolean } => {
    const neck = jointMap['neck']
    const root = jointMap['root']
    const hip = jointMap['leftHip'] ?? jointMap['rightHip']

    if (neck === undefined || root === undefined || hip === undefined) {
      return { isRounding: false, isExcessiveLean: false }
    }

    // Spine angle: neck-root-hip
    const spineAngle = calculateAngle(neck, root, hip)
    angleHistory.push(spineAngle)

    if (angleHistory.length > WINDOW_SIZE) {
      angleHistory.shift()
    }

    // Check for rapid angle increase (rounding)
    let isRounding = false
    if (angleHistory.length >= 6) {
      const recentAngle = angleHistory[angleHistory.length - 1]
      const fiveFramesAgo = angleHistory[angleHistory.length - 6]
      const increase = recentAngle - fiveFramesAgo
      if (increase > ROUNDING_INCREASE_THRESHOLD) {
        isRounding = true
      }
    }

    const isExcessiveLean = spineAngle > EXCESSIVE_LEAN_THRESHOLD

    return { isRounding, isExcessiveLean }
  }

  const reset = () => {
    angleHistory.length = 0
  }

  return { addFrame, reset }
}
