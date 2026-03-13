import type { CameraAngle, CustomCheckFn, FormIssue } from '@/types/form-rules'
import { createBackRoundingDetector } from '@/utils/back-rounding-detector'
import { checkSymmetry } from '@/utils/symmetry-checker'

// Shared back rounding detector (stateful — persists across frames)
let backRoundingDetector = createBackRoundingDetector()

export const resetCommonChecks = () => {
  backRoundingDetector = createBackRoundingDetector()
}

export const backRoundingCheck: CustomCheckFn = (jointMap, cameraAngle) => {
  if (cameraAngle !== 'side' && cameraAngle !== '45-degree') return null

  const { isRounding, isExcessiveLean } = backRoundingDetector.addFrame(jointMap)

  if (isRounding) {
    return {
      joint: 'root',
      severity: 'error',
      message: 'Back rounding detected',
      spokenMessage: 'Brace your core, back is rounding',
    }
  }

  if (isExcessiveLean) {
    return {
      joint: 'root',
      severity: 'warning',
      message: 'Excessive forward lean',
      spokenMessage: 'Keep your chest up',
    }
  }

  return null
}

export const symmetryCheck: CustomCheckFn = (jointMap, cameraAngle) => {
  return checkSymmetry(jointMap, cameraAngle)
}
