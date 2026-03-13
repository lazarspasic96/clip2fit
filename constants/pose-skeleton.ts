// Unified joint name map — iOS Vision (19 joints) uses string keys,
// Android ML Kit (33 joints) uses integer constants.
// Native code normalizes to these string keys before sending to JS.
export const JOINT_NAMES = [
  'nose',
  'leftEye',
  'rightEye',
  'leftEar',
  'rightEar',
  'neck',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'root',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
] as const

export type JointName = (typeof JOINT_NAMES)[number]

// Pairs of joints to connect with a line (bone)
export const SKELETON_CONNECTIONS: [JointName, JointName][] = [
  // Torso
  ['neck', 'leftShoulder'],
  ['neck', 'rightShoulder'],
  ['leftShoulder', 'rightShoulder'],
  ['leftHip', 'rightHip'],
  ['neck', 'root'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],

  // Left arm
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],

  // Right arm
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],

  // Left leg
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],

  // Right leg
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
]

export const SKELETON_COLOR = '#84cc16'
export const BONE_STROKE_WIDTH = 3
export const JOINT_RADIUS = 6
export const CONFIDENCE_THRESHOLD = 0.3
export const SETUP_CONFIDENCE_THRESHOLD = 0.5

// Default joints required for setup confirmation (most exercises need at least these)
export const REQUIRED_JOINTS_DEFAULT: JointName[] = [
  'leftShoulder',
  'rightShoulder',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
]
