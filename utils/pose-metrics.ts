import { ANALYSIS_JOINTS, TRACKED_JOINTS } from '@/constants/pose-skeleton'
import type { PoseLandmark } from '@/modules/expo-pose-camera'

type AnalysisJoint = (typeof ANALYSIS_JOINTS)[number]

type Point = {
  x: number
  y: number
}

type JointSample = Point & {
  confidence: number
}

type JointMap = Partial<Record<AnalysisJoint, JointSample>>

const analysisJointSet = new Set<string>(ANALYSIS_JOINTS)

const round = (value: number, decimals = 3) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

const distance = (a: Point | undefined, b: Point | undefined) => {
  if (a === undefined || b === undefined) {
    return null
  }
  return Math.hypot(b.x - a.x, b.y - a.y)
}

const angleAtJoint = (a: Point | undefined, b: Point | undefined, c: Point | undefined) => {
  if (a === undefined || b === undefined || c === undefined) {
    return null
  }

  const baX = a.x - b.x
  const baY = a.y - b.y
  const bcX = c.x - b.x
  const bcY = c.y - b.y

  const baMag = Math.hypot(baX, baY)
  const bcMag = Math.hypot(bcX, bcY)
  if (baMag === 0 || bcMag === 0) {
    return null
  }

  const cosine = (baX * bcX + baY * bcY) / (baMag * bcMag)
  const clamped = Math.max(-1, Math.min(1, cosine))
  return (Math.acos(clamped) * 180) / Math.PI
}

const midpoint = (a: Point | undefined, b: Point | undefined) => {
  if (a === undefined || b === undefined) {
    return null
  }
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }
}

const tiltFromVerticalDeg = (top: Point | null, bottom: Point | null) => {
  if (top === null || bottom === null) {
    return null
  }

  const dx = bottom.x - top.x
  const dy = bottom.y - top.y
  if (dx === 0 && dy === 0) {
    return null
  }

  const angleRad = Math.atan2(dx, dy)
  return Math.abs((angleRad * 180) / Math.PI)
}

const lineAngleDeg = (a: Point | undefined, b: Point | undefined) => {
  if (a === undefined || b === undefined) {
    return null
  }
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
}

const toOptionalPoint = (point: Point | null) => {
  return point === null ? undefined : point
}

export const buildPoseFrameSummary = (landmarks: PoseLandmark[]) => {
  const jointMap: JointMap = {}

  for (const lm of landmarks) {
    if (!analysisJointSet.has(lm.joint)) {
      continue
    }

    const joint = lm.joint as AnalysisJoint
    jointMap[joint] = {
      x: round(lm.x),
      y: round(lm.y),
      confidence: round(lm.confidence),
    }
  }

  const visibleJointsPresent = TRACKED_JOINTS.filter((joint) => jointMap[joint] !== undefined)
  const analysisJointsPresent = ANALYSIS_JOINTS.filter((joint) => jointMap[joint] !== undefined)
  const leftShoulder = jointMap.leftShoulder
  const rightShoulder = jointMap.rightShoulder
  const leftHip = jointMap.leftHip
  const rightHip = jointMap.rightHip

  const shoulderMid = midpoint(leftShoulder, rightShoulder)
  const hipMid = midpoint(leftHip, rightHip)
  const shoulderMidPoint = toOptionalPoint(shoulderMid)
  const hipMidPoint = toOptionalPoint(hipMid)

  const neckPoint = jointMap.neck ?? shoulderMidPoint
  const rootPoint = jointMap.root ?? hipMidPoint

  const leftElbowAngle = angleAtJoint(jointMap.leftShoulder, jointMap.leftElbow, jointMap.leftWrist)
  const rightElbowAngle = angleAtJoint(
    jointMap.rightShoulder,
    jointMap.rightElbow,
    jointMap.rightWrist
  )
  const leftKneeAngle = angleAtJoint(jointMap.leftHip, jointMap.leftKnee, jointMap.leftAnkle)
  const rightKneeAngle = angleAtJoint(jointMap.rightHip, jointMap.rightKnee, jointMap.rightAnkle)
  const leftHipAngle = angleAtJoint(jointMap.leftShoulder, jointMap.leftHip, jointMap.leftKnee)
  const rightHipAngle = angleAtJoint(jointMap.rightShoulder, jointMap.rightHip, jointMap.rightKnee)

  const shoulderWidth = distance(leftShoulder, rightShoulder)
  const hipWidth = distance(leftHip, rightHip)
  const leftUpperArm = distance(jointMap.leftShoulder, jointMap.leftElbow)
  const rightUpperArm = distance(jointMap.rightShoulder, jointMap.rightElbow)
  const leftThigh = distance(jointMap.leftHip, jointMap.leftKnee)
  const rightThigh = distance(jointMap.rightHip, jointMap.rightKnee)

  const shoulderLine = lineAngleDeg(leftShoulder, rightShoulder)
  const hipLine = lineAngleDeg(leftHip, rightHip)
  const torsoTiltFromVertical = tiltFromVerticalDeg(shoulderMid, hipMid)

  // Proxy for thoracic/lumbar flexion in side view.
  const shoulderSpineAngle = angleAtJoint(neckPoint, shoulderMidPoint, rootPoint)
  const backRoundingFlexionDeg =
    shoulderSpineAngle !== null ? round(Math.max(0, 180 - shoulderSpineAngle), 1) : null

  let backRoundRisk: 'low' | 'medium' | 'high' | 'unknown' = 'unknown'
  if (backRoundingFlexionDeg !== null) {
    if (backRoundingFlexionDeg >= 25) {
      backRoundRisk = 'high'
    } else if (backRoundingFlexionDeg >= 15) {
      backRoundRisk = 'medium'
    } else {
      backRoundRisk = 'low'
    }
  }

  return {
    timestamp: new Date().toISOString(),
    personDetected: visibleJointsPresent.length > 0,
    jointsTracked: visibleJointsPresent.length,
    jointsPresent: visibleJointsPresent,
    analysisJointsTracked: analysisJointsPresent.length,
    analysisJointsPresent,
    landmarksByJoint: jointMap,
    anglesDeg: {
      leftElbow: leftElbowAngle !== null ? round(leftElbowAngle, 1) : null,
      rightElbow: rightElbowAngle !== null ? round(rightElbowAngle, 1) : null,
      leftKnee: leftKneeAngle !== null ? round(leftKneeAngle, 1) : null,
      rightKnee: rightKneeAngle !== null ? round(rightKneeAngle, 1) : null,
      leftHip: leftHipAngle !== null ? round(leftHipAngle, 1) : null,
      rightHip: rightHipAngle !== null ? round(rightHipAngle, 1) : null,
    },
    distancesNorm: {
      shoulderWidth: shoulderWidth !== null ? round(shoulderWidth) : null,
      hipWidth: hipWidth !== null ? round(hipWidth) : null,
      leftUpperArm: leftUpperArm !== null ? round(leftUpperArm) : null,
      rightUpperArm: rightUpperArm !== null ? round(rightUpperArm) : null,
      leftThigh: leftThigh !== null ? round(leftThigh) : null,
      rightThigh: rightThigh !== null ? round(rightThigh) : null,
    },
    postureDeg: {
      shoulderLine: shoulderLine !== null ? round(shoulderLine, 1) : null,
      hipLine: hipLine !== null ? round(hipLine, 1) : null,
      torsoTiltFromVertical: torsoTiltFromVertical !== null ? round(torsoTiltFromVertical, 1) : null,
    },
    backAssessment: {
      backRoundingFlexionDeg,
      risk: backRoundRisk,
    },
  }
}
