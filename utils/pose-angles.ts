/**
 * Calculate angle at vertex B formed by points A-B-C using atan2.
 * Returns degrees (0-180).
 */
export const calculateAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let degrees = Math.abs(radians * (180 / Math.PI))
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}

/**
 * Calculate trunk lean angle relative to vertical (0 = perfectly upright).
 * Positive = forward lean.
 */
export const calculateTrunkLean = (
  shoulder: { x: number; y: number },
  hip: { x: number; y: number },
): number => {
  const dx = shoulder.x - hip.x
  const dy = shoulder.y - hip.y
  // atan2 with inverted Y (screen coords: y increases downward)
  const radians = Math.atan2(dx, -dy)
  return radians * (180 / Math.PI)
}

/**
 * Check if knee is tracking over the ankle (valgus/varus).
 * Returns the horizontal offset: negative = valgus (inward), positive = varus (outward).
 * Only meaningful from front/45-degree view.
 */
export const calculateKneeTracking = (
  knee: { x: number; y: number },
  ankle: { x: number; y: number },
): number => {
  return knee.x - ankle.x
}

/**
 * Front-view squat depth estimation.
 * Returns ratio: ~1.0 when standing, ~0 at parallel, <0 below parallel.
 * (knee.y - hip.y) / (hip.y - shoulder.y) in screen coords (y increases down).
 */
export const calculateDepthRatio = (
  shoulder: { x: number; y: number },
  hip: { x: number; y: number },
  knee: { x: number; y: number },
): number => {
  const torsoHeight = hip.y - shoulder.y
  if (torsoHeight <= 0) return 1
  return (knee.y - hip.y) / torsoHeight
}

/**
 * Stance width relative to shoulder width.
 * Returns ratio: 1.0 = ankles same width as shoulders.
 */
export const calculateStanceWidthRatio = (
  leftAnkle: { x: number; y: number },
  rightAnkle: { x: number; y: number },
  leftShoulder: { x: number; y: number },
  rightShoulder: { x: number; y: number },
): number => {
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
  if (shoulderWidth <= 0) return 1
  const ankleSpread = Math.abs(leftAnkle.x - rightAnkle.x)
  return ankleSpread / shoulderWidth
}

/**
 * Front-view torso lean estimation.
 * Returns ratio of visible torso length to leg length.
 * Lower = more forward lean (torso projects shorter from front).
 * ~0.7-0.9 upright, <0.3 excessive lean.
 */
export const calculateFrontTorsoLean = (
  leftShoulder: { x: number; y: number },
  rightShoulder: { x: number; y: number },
  leftHip: { x: number; y: number },
  rightHip: { x: number; y: number },
  leftAnkle: { x: number; y: number },
  rightAnkle: { x: number; y: number },
): number => {
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2
  const hipMidY = (leftHip.y + rightHip.y) / 2
  const ankleMidY = (leftAnkle.y + rightAnkle.y) / 2
  const legLength = ankleMidY - hipMidY
  if (legLength <= 0) return 1
  const torsoLength = hipMidY - shoulderMidY
  return torsoLength / legLength
}

/**
 * Hip level symmetry check.
 * Returns absolute vertical difference between left and right hip.
 * Values close to 0 = level, larger = hip drop.
 */
export const calculateHipLevelDifference = (
  leftHip: { x: number; y: number },
  rightHip: { x: number; y: number },
  leftShoulder: { x: number; y: number },
  rightShoulder: { x: number; y: number },
): number => {
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
  if (shoulderWidth <= 0) return 0
  return Math.abs(leftHip.y - rightHip.y) / shoulderWidth
}

/**
 * Shoulder level symmetry check.
 * Returns absolute vertical difference normalized by shoulder width.
 */
export const calculateShoulderLevelDifference = (
  leftShoulder: { x: number; y: number },
  rightShoulder: { x: number; y: number },
): number => {
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
  if (shoulderWidth <= 0) return 0
  return Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth
}
