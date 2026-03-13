import type { FormRuleConfig } from '@/types/form-rules'

export const OVERHEAD_PRESS_RULES: FormRuleConfig = {
  exerciseName: 'Overhead Press',
  canonicalName: 'overhead-press',
  recommendedAngle: 'side',
  equipment: 'barbell',
  requiredJoints: [
    'leftShoulder', 'rightShoulder',
    'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist',
    'leftHip', 'rightHip',
  ],
  setupInstructions: 'Place phone 6-8ft away, side view. Full upper body must be visible.',
  repCountJoints: ['leftShoulder', 'leftElbow', 'leftWrist'],
  repCountThresholds: { top: 165, bottom: 80 },
  angleRules: [
    {
      name: 'Lockout Angle',
      joints: ['leftShoulder', 'leftElbow', 'leftWrist'],
      ranges: {
        good: [160, 180],
        warning: [145, 180],
      },
      messages: {
        warning: 'Not fully locked out overhead',
        error: 'Press all the way up — full lockout',
      },
      spokenMessages: {
        error: 'Full lockout overhead',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Back Arch',
      joints: ['leftShoulder', 'leftHip', 'leftKnee'],
      ranges: {
        good: [165, 180],
        warning: [150, 180],
      },
      messages: {
        warning: 'Slight back arch detected',
        error: 'Too much back arch — brace your core',
      },
      spokenMessages: {
        warning: 'Brace your core',
        error: 'Too much back arch, tighten your core',
      },
      applicableAngles: ['side'],
    },
  ],
}
