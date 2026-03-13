import type { JointName } from '@/constants/pose-skeleton'

// --- Screen State Machine ---

export type FormCoachScreenState = 'setup' | 'active' | 'rest' | 'summary'

// --- Camera ---

export type CameraAngle = 'side' | 'front' | '45-degree'

// --- Form Feedback ---

export type FormSeverity = 'good' | 'warning' | 'error'

export type FormIssue = {
  joint: JointName
  severity: FormSeverity
  message: string
  spokenMessage?: string
  ruleName?: string
}

// --- Angle Rules ---

export type AngleRule = {
  name: string
  joints: [JointName, JointName, JointName] // a, b (vertex), c
  ranges: {
    good: [number, number]
    warning: [number, number]
  }
  messages: {
    warning: string
    error: string
  }
  spokenMessages?: {
    warning?: string
    error?: string
  }
  applicableAngles: CameraAngle[]
}

// --- Custom Check ---

export type CustomCheckFn = (
  jointMap: Record<string, { x: number; y: number; confidence: number }>,
  cameraAngle: CameraAngle,
) => FormIssue | null

// --- Form Rule Config (per exercise) ---

export type FormRuleConfig = {
  exerciseName: string
  canonicalName: string
  recommendedAngle: CameraAngle
  requiredJoints: JointName[]
  setupInstructions: string
  angleRules: AngleRule[]
  customChecks?: CustomCheckFn[]
  positionRules?: PositionRule[]
  equipment?: 'barbell' | 'dumbbell' | 'bodyweight' | 'machine'
  repCountJoints?: [JointName, JointName, JointName] // primary angle for rep counting
  repCountThresholds?: { top: number; bottom: number }
}

// --- Position Rule (front-view checks that use positions, not angles) ---

type JointMap = Record<string, { x: number; y: number; confidence: number }>

export type PositionRule = {
  name: string
  applicableAngles: CameraAngle[]
  evaluate: (jointMap: JointMap) => FormIssue | null
}

// --- Barbell Tracking (Phase 5) ---

export type BarbellPathPoint = {
  x: number
  y: number
  timestamp: number
}

export type BarbellDrift = {
  isDrifting: boolean
  driftDirection: 'left' | 'right' | 'none'
  driftAmount: number
}
