// Joint names emitted by native modules and used for drawing.
// This set intentionally excludes face joints.
export const JOINT_NAMES = {
  leftShoulder: 'leftShoulder',
  rightShoulder: 'rightShoulder',
  leftElbow: 'leftElbow',
  rightElbow: 'rightElbow',
  leftWrist: 'leftWrist',
  rightWrist: 'rightWrist',
  leftHip: 'leftHip',
  rightHip: 'rightHip',
  leftKnee: 'leftKnee',
  rightKnee: 'rightKnee',
  leftAnkle: 'leftAnkle',
  rightAnkle: 'rightAnkle',
} as const

export const TRACKED_JOINTS = [
  JOINT_NAMES.leftShoulder,
  JOINT_NAMES.rightShoulder,
  JOINT_NAMES.leftElbow,
  JOINT_NAMES.rightElbow,
  JOINT_NAMES.leftWrist,
  JOINT_NAMES.rightWrist,
  JOINT_NAMES.leftHip,
  JOINT_NAMES.rightHip,
  JOINT_NAMES.leftKnee,
  JOINT_NAMES.rightKnee,
  JOINT_NAMES.leftAnkle,
  JOINT_NAMES.rightAnkle,
] as const

// Additional torso joints used for analysis only (not drawn in the overlay).
export const ANALYSIS_JOINT_NAMES = {
  neck: 'neck',
  root: 'root',
} as const

export const ANALYSIS_JOINTS = [
  ...TRACKED_JOINTS,
  ANALYSIS_JOINT_NAMES.neck,
  ANALYSIS_JOINT_NAMES.root,
] as const

// Pairs of joints to connect with lines (bones)
export const SKELETON_CONNECTIONS: [string, string][] = [
  // Left arm
  [JOINT_NAMES.leftShoulder, JOINT_NAMES.leftElbow],
  [JOINT_NAMES.leftElbow, JOINT_NAMES.leftWrist],
  // Right arm
  [JOINT_NAMES.rightShoulder, JOINT_NAMES.rightElbow],
  [JOINT_NAMES.rightElbow, JOINT_NAMES.rightWrist],
  // Left leg
  [JOINT_NAMES.leftHip, JOINT_NAMES.leftKnee],
  [JOINT_NAMES.leftKnee, JOINT_NAMES.leftAnkle],
  // Right leg
  [JOINT_NAMES.rightHip, JOINT_NAMES.rightKnee],
  [JOINT_NAMES.rightKnee, JOINT_NAMES.rightAnkle],
  // Shoulders bridge
  [JOINT_NAMES.leftShoulder, JOINT_NAMES.rightShoulder],
  // Hips bridge
  [JOINT_NAMES.leftHip, JOINT_NAMES.rightHip],
  // Side torso links
  [JOINT_NAMES.leftShoulder, JOINT_NAMES.leftHip],
  [JOINT_NAMES.rightShoulder, JOINT_NAMES.rightHip],
]

export const SKELETON_COLOR = '#84cc16'
export const BONE_STROKE_WIDTH = 3
export const JOINT_RADIUS = 6
export const CONFIDENCE_THRESHOLD = 0.3
