import type { FormRuleConfig, PositionRule } from '@/types/form-rules'
import {
  calculateFrontTorsoLean,
  calculateHipLevelDifference,
} from '@/utils/pose-angles'

const lungeFrontTorso: PositionRule = {
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
        message: 'Leaning forward — stay upright',
        spokenMessage: 'Stay upright',
        ruleName: 'Torso Upright (Front)',
      }
    }
    return {
      joint: 'leftShoulder',
      severity: 'error',
      message: 'Torso too far forward',
      spokenMessage: 'Keep your chest up',
      ruleName: 'Torso Upright (Front)',
    }
  },
}

const lungeHipLevel: PositionRule = {
  name: 'Hip Level',
  applicableAngles: ['front', '45-degree'],
  evaluate: (jointMap) => {
    const lHip = jointMap['leftHip']
    const rHip = jointMap['rightHip']
    const lShoulder = jointMap['leftShoulder']
    const rShoulder = jointMap['rightShoulder']
    if (
      lHip === undefined || rHip === undefined ||
      lShoulder === undefined || rShoulder === undefined
    ) return null

    const diff = calculateHipLevelDifference(lHip, rHip, lShoulder, rShoulder)

    if (diff < 0.12) return null
    if (diff < 0.25) {
      return {
        joint: 'leftHip',
        severity: 'warning',
        message: 'Hips tilting — keep them level',
        spokenMessage: 'Level your hips',
        ruleName: 'Hip Level',
      }
    }
    return {
      joint: 'leftHip',
      severity: 'error',
      message: 'Hip drop detected — stabilize your core',
      spokenMessage: 'Hips are dropping, engage your core',
      ruleName: 'Hip Level',
    }
  },
}

export const LUNGE_RULES: FormRuleConfig = {
  exerciseName: 'Lunge',
  canonicalName: 'lunge',
  recommendedAngle: 'side',
  equipment: 'bodyweight',
  requiredJoints: [
    'leftShoulder', 'rightShoulder',
    'leftHip', 'rightHip',
    'leftKnee', 'rightKnee',
    'leftAnkle', 'rightAnkle',
  ],
  setupInstructions: 'Place phone 6-8ft away, side or front view. Full body must be visible.',
  repCountJoints: ['leftHip', 'leftKnee', 'leftAnkle'],
  repCountThresholds: { top: 160, bottom: 90 },
  angleRules: [
    {
      name: 'Front Knee Angle',
      joints: ['leftHip', 'leftKnee', 'leftAnkle'],
      ranges: {
        good: [80, 100],
        warning: [65, 115],
      },
      messages: {
        warning: 'Front knee angle off — aim for 90 degrees',
        error: 'Knee too far forward or not deep enough',
      },
      spokenMessages: {
        warning: 'Ninety degree knee bend',
        error: 'Adjust your knee angle',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Torso Upright',
      joints: ['neck', 'leftHip', 'leftKnee'],
      ranges: {
        good: [160, 180],
        warning: [145, 180],
      },
      messages: {
        warning: 'Leaning forward — keep torso upright',
        error: 'Torso too far forward',
      },
      spokenMessages: {
        warning: 'Stay upright',
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
        warning: 'Front knee caving inward',
        error: 'Knee caving — push knee out over toe',
      },
      spokenMessages: {
        warning: 'Push knee out',
      },
      applicableAngles: ['front'],
    },
  ],
  positionRules: [lungeFrontTorso, lungeHipLevel],
}
