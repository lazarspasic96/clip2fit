import type { FormRuleConfig, PositionRule } from '@/types/form-rules'
import {
  calculateDepthRatio,
  calculateFrontTorsoLean,
  calculateStanceWidthRatio,
} from '@/utils/pose-angles'
import { backRoundingCheck, symmetryCheck } from './common-checks'

const frontDepthCheck: PositionRule = {
  name: 'Front Depth Check',
  applicableAngles: ['front', '45-degree'],
  evaluate: (jointMap) => {
    const lHip = jointMap['leftHip']
    const rHip = jointMap['rightHip']
    const lKnee = jointMap['leftKnee']
    const rKnee = jointMap['rightKnee']
    const lShoulder = jointMap['leftShoulder']
    const rShoulder = jointMap['rightShoulder']
    if (
      lHip === undefined || rHip === undefined ||
      lKnee === undefined || rKnee === undefined ||
      lShoulder === undefined || rShoulder === undefined
    ) return null

    const avgShoulder = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 }
    const avgHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 }
    const avgKnee = { x: (lKnee.x + rKnee.x) / 2, y: (lKnee.y + rKnee.y) / 2 }
    const ratio = calculateDepthRatio(avgShoulder, avgHip, avgKnee)

    if (ratio <= 0.35) return null
    if (ratio <= 0.65) {
      return {
        joint: 'leftHip',
        severity: 'warning',
        message: 'Go deeper — hips should reach knee level',
        spokenMessage: 'Go deeper',
        ruleName: 'Front Depth Check',
      }
    }
    return {
      joint: 'leftHip',
      severity: 'error',
      message: 'Squat depth too shallow',
      spokenMessage: 'Much deeper, get below parallel',
      ruleName: 'Front Depth Check',
    }
  },
}

const stanceWidthCheck: PositionRule = {
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

    if (ratio >= 0.8 && ratio <= 1.5) return null
    if (ratio >= 0.6 && ratio <= 1.8) {
      const msg = ratio < 0.8 ? 'Stance too narrow' : 'Stance too wide'
      return {
        joint: 'leftAnkle',
        severity: 'warning',
        message: msg,
        spokenMessage: msg,
        ruleName: 'Stance Width',
      }
    }
    const msg = ratio < 0.6 ? 'Stance way too narrow' : 'Stance way too wide'
    return {
      joint: 'leftAnkle',
      severity: 'error',
      message: msg,
      spokenMessage: msg,
      ruleName: 'Stance Width',
    }
  },
}

const frontTorsoCheck: PositionRule = {
  name: 'Torso Upright (Front)',
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

    if (ratio > 0.4) return null
    if (ratio > 0.25) {
      return {
        joint: 'leftShoulder',
        severity: 'warning',
        message: 'Leaning forward — keep chest up',
        spokenMessage: 'Keep your chest up',
        ruleName: 'Torso Upright (Front)',
      }
    }
    return {
      joint: 'leftShoulder',
      severity: 'error',
      message: 'Excessive forward lean',
      spokenMessage: 'Too much forward lean, chest up',
      ruleName: 'Torso Upright (Front)',
    }
  },
}

export const SQUAT_RULES: FormRuleConfig = {
  exerciseName: 'Squat',
  canonicalName: 'squat',
  recommendedAngle: 'side',
  equipment: 'barbell',
  requiredJoints: [
    'leftShoulder', 'rightShoulder',
    'leftHip', 'rightHip',
    'leftKnee', 'rightKnee',
    'leftAnkle', 'rightAnkle',
  ],
  setupInstructions: 'Place phone 6-8ft away, side view recommended. Full body must be visible.',
  repCountJoints: ['leftHip', 'leftKnee', 'leftAnkle'],
  repCountThresholds: { top: 160, bottom: 90 },
  angleRules: [
    {
      name: 'Knee Angle (Depth)',
      joints: ['leftHip', 'leftKnee', 'leftAnkle'],
      ranges: {
        good: [70, 110],
        warning: [50, 130],
      },
      messages: {
        warning: 'Go deeper — hips below knees',
        error: 'Squat depth too shallow',
      },
      spokenMessages: {
        warning: 'Go deeper',
        error: 'Much deeper, get below parallel',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Hip Angle',
      joints: ['leftShoulder', 'leftHip', 'leftKnee'],
      ranges: {
        good: [50, 100],
        warning: [30, 120],
      },
      messages: {
        warning: 'Torso too upright or too forward',
        error: 'Excessive forward lean',
      },
      spokenMessages: {
        error: 'Keep your chest up',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Knee Tracking (Valgus)',
      joints: ['leftHip', 'leftKnee', 'leftAnkle'],
      ranges: {
        good: [-0.03, 0.03],
        warning: [-0.06, 0.06],
      },
      messages: {
        warning: 'Knees caving inward',
        error: 'Knees caving — push knees out',
      },
      spokenMessages: {
        warning: 'Push knees out',
        error: 'Knees are caving, push them out',
      },
      applicableAngles: ['front', '45-degree'],
    },
  ],
  positionRules: [frontDepthCheck, stanceWidthCheck, frontTorsoCheck],
  customChecks: [backRoundingCheck, symmetryCheck],
}
