import type { FormRuleConfig } from '@/types/form-rules'

export const BENCH_PRESS_RULES: FormRuleConfig = {
  exerciseName: 'Bench Press',
  canonicalName: 'bench-press',
  recommendedAngle: 'side',
  equipment: 'barbell',
  requiredJoints: [
    'leftShoulder', 'rightShoulder',
    'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist',
  ],
  setupInstructions: 'Place phone at bench height, side or 45-degree view. Upper body must be visible.',
  repCountJoints: ['leftShoulder', 'leftElbow', 'leftWrist'],
  repCountThresholds: { top: 160, bottom: 80 },
  angleRules: [
    {
      name: 'Elbow Angle (Lockout)',
      joints: ['leftShoulder', 'leftElbow', 'leftWrist'],
      ranges: {
        good: [155, 180],
        warning: [140, 180],
      },
      messages: {
        warning: 'Arms not fully extended',
        error: 'Lock out your arms at the top',
      },
      spokenMessages: {
        error: 'Lock out',
      },
      applicableAngles: ['side', '45-degree'],
    },
    {
      name: 'Elbow Flare',
      joints: ['leftShoulder', 'leftElbow', 'leftWrist'],
      ranges: {
        good: [60, 100],
        warning: [45, 120],
      },
      messages: {
        warning: 'Elbows flaring too wide',
        error: 'Tuck your elbows — too much flare',
      },
      spokenMessages: {
        warning: 'Tuck elbows in',
        error: 'Elbows are flaring, tuck them',
      },
      applicableAngles: ['front', '45-degree'],
    },
  ],
}
