import type { CameraAngle } from '@/types/form-rules'

/**
 * Detects approximate camera angle based on shoulder-hip width ratio.
 * Side view: body appears narrow. Front view: body appears wide.
 */
export const detectCameraAngle = (
  jointMap: Record<string, { x: number; y: number }>,
): CameraAngle => {
  const ls = jointMap['leftShoulder']
  const rs = jointMap['rightShoulder']
  if (ls === undefined || rs === undefined) return 'side'

  const shoulderWidth = Math.abs(ls.x - rs.x)

  // Thresholds based on normalized coordinates (0-1)
  if (shoulderWidth < 0.08) return 'side'
  if (shoulderWidth > 0.18) return 'front'
  return '45-degree'
}
