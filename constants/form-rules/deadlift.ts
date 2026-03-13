import type { FormRuleConfig, PositionRule } from '@/types/form-rules'
import {
  calculateFrontTorsoLean,
  calculateShoulderLevelDifference,
  calculateStanceWidthRatio,
} from '@/utils/pose-angles'
import { backRoundingCheck, symmetryCheck } from './common-checks'

const deadliftStanceWidth: PositionRule = {
  name: 'Stance Width',
  applicableAngles: ['front', '45-degree'],
  evaluate: (jointMap) => {
    const lAnkle = jointMap['leftAnkle']
    const rAnkle = jointMap['rightAnkle']
    const lShoulder = jointMap['leftShoulder']
    const rShoulder = jointMap['rightShoulder']
    if (
      lAnkle === undefined || rAnkle === undefined ||
      lShoulder === undefined || rShoulder === undefined
    ) return null

    const ratio = calculateStanceWidthRatio(lAnkle, rAnkle, lShoulder, rShoulder)

    // Conventional DL: narrower stance than squat
    if (ratio >= 0.6 && ratio <= 1.3) return null
    if (ratio >= 0.4 && ratio <= 1.6) {
      const msg = ratio < 0.6 ? 'Stance too narrow for deadlift' : 'Stance too wide for conventional'
      return {
        joint: 'leftAnkle',
        severity: 'warning',
        message: msg,
        spokenMessage: msg,
        ruleName: 'Stance Width',
      }
    }
    return {
      joint: 'leftAnkle',
      severity: 'error',
      message: 'Stance width needs adjustment',
      spokenMessage: 'Fix your stance width',
      ruleName: 'Stance Width',
    }
  },
}

const deadliftShoulderLevel: PositionRule = {
  name: 'Shoulder Level',
  applicableAngles: ['front', '45-degree'],
  evaluate: (jointMap) => {
    const lShoulder = jointMap['leftShoulder']
    const rShoulder = jointMap['rightShoulder']
    if (lShoulder === undefined || rShoulder === undefined) return null

    const diff = calculateShoulderLevelDifference(lShoulder, rShoulder)

    if (diff < 0.1) return null
    if (diff < 0.2) {
      return {
        joint: 'leftShoulder',
        severity: 'warning',
        message: 'Shoulders uneven — keep bar level',
        spokenMessage: 'Level your shoulders',
        ruleName: 'Shoulder Level',
      }
    }
    return {
      joint: 'leftShoulder',
      severity: 'error',
      message: 'One shoulder dropping — rotate to level',
      spokenMessage: 'Shoulders are uneven, level the bar',
      ruleName: 'Shoulder Level',
    }
  },
}

const deadliftFrontTorso: PositionRule = {
  name: 'Torso Position (Front)',
  applicableAngles: ['front', '45-degree'],
  evaluate: (jointMap) => {
    const lShoulder = jointMap['leftShoulder']
    const rShoulder = jointMap['rightShoulder']
    const lHip = jointMap['leftHip']
    const rHip = jointMap['rightHip']
    const lAnkle = jointMap['leftAnkle']
    const rAnkle = jointMap['rightAnkle']
    if (
      lShoulder === undefined || rShoulder === undefined ||
      lHip === undefined || rHip === undefined ||
      lAnkle === undefined || rAnkle === undefined
    ) return null

    const ratio = calculateFrontTorsoLean(lShoulder, rShoulder, lHip, rHip, lAnkle, rAnkle)

    // Deadlift has more forward lean than squat, so more lenient thresholds
    if (ratio > 0.25) return null
    if (ratio > 0.15) {
      return {
        joint: 'leftShoulder',
        severity: 'warning',
        message: 'Very bent over — check back position',
        spokenMessage: 'Watch your back position',
        ruleName: 'Torso Position (Front)',
      }
    }
    return {
      joint: 'leftShoulder',
      severity: 'error',
      message: 'Excessive forward bend',
      spokenMessage: 'Too bent over, brace your core',
      ruleName: 'Torso Position (Front)',
    }
  },
}

export const DEADLIFT_RULES: FormRuleConfig = {
  exerciseName: 'Deadlift',
  canonicalName: 'deadlift',
  recommendedAngle: 'side',
  equipment: 'barbell',
  requiredJoints: [
    'leftShoulder', 'rightShoulder',
    'leftHip', 'rightHip',
    'leftKnee', 'rightKnee',
    'leftAnkle', 'rightAnkle',
  ],
  setupInstructions: 'Place phone 6-8ft away, side view. Full body must be visible including the bar.',
  repCountJoints: ['leftShoulder', 'leftHip', 'leftKnee'],
  repCountThresholds: { top: 170, bottom: 90 },
  angleRules: [
    {
      name: 'Hip Hinge',
      joints: ['leftShoulder', 'leftHip', 'leftKnee'],
      ranges: {
        good: [60, 180],
        warning: [40, 180],
      },
      messages: {
        warning: 'Hip hinge looks off',
        error: 'Hips too low — this is a deadlift, not a squat',
      },
      spokenMessages: {
        error: 'Push your hips back more',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Lockout',
      joints: ['leftShoulder', 'leftHip', 'leftKnee'],
      ranges: {
        good: [165, 180],
        warning: [150, 180],
      },
      messages: {
        warning: 'Not fully locked out',
        error: 'Stand tall — full hip extension',
      },
      spokenMessages: {
        error: 'Lock out at the top',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Back Angle',
      joints: ['neck', 'leftHip', 'leftKnee'],
      ranges: {
        good: [30, 80],
        warning: [15, 90],
      },
      messages: {
        warning: 'Back angle too steep or too upright',
        error: 'Watch your back position',
      },
      applicableAngles: ['side'],
    },
  ],
  positionRules: [deadliftStanceWidth, deadliftShoulderLevel, deadliftFrontTorso],
  customChecks: [backRoundingCheck, symmetryCheck],
}
