import type { JointName } from '@/constants/pose-skeleton'
import type { AngleRule, CameraAngle, FormIssue, FormRuleConfig, FormSeverity } from '@/types/form-rules'
import { calculateAngle, calculateKneeTracking } from './pose-angles'

type JointMap = Record<string, { x: number; y: number; confidence: number }>

const evaluateAngleRule = (
  rule: AngleRule,
  jointMap: JointMap,
  cameraAngle: CameraAngle,
): FormIssue | null => {
  if (!rule.applicableAngles.includes(cameraAngle)) return null

  const [jointA, jointB, jointC] = rule.joints
  const a = jointMap[jointA]
  const b = jointMap[jointB]
  const c = jointMap[jointC]
  if (a === undefined || b === undefined || c === undefined) return null

  // Special case for knee tracking — uses horizontal offset, not angle
  if (rule.name.includes('Knee Tracking')) {
    const offset = calculateKneeTracking(b, c)
    const absOffset = Math.abs(offset)
    const [goodMin, goodMax] = rule.ranges.good
    const [warnMin, warnMax] = rule.ranges.warning

    if (absOffset <= Math.abs(goodMax)) return null
    const severity: FormSeverity = absOffset <= Math.abs(warnMax) ? 'warning' : 'error'
    return {
      joint: jointB,
      severity,
      message: severity === 'warning' ? rule.messages.warning : rule.messages.error,
      spokenMessage: severity === 'warning'
        ? rule.spokenMessages?.warning
        : rule.spokenMessages?.error,
      ruleName: rule.name,
    }
  }

  const angle = calculateAngle(a, b, c)
  const [goodMin, goodMax] = rule.ranges.good
  const [warnMin, warnMax] = rule.ranges.warning

  if (angle >= goodMin && angle <= goodMax) return null

  const severity: FormSeverity =
    (angle >= warnMin && angle <= warnMax) ? 'warning' : 'error'

  return {
    joint: jointB,
    severity,
    message: severity === 'warning' ? rule.messages.warning : rule.messages.error,
    spokenMessage: severity === 'warning'
      ? rule.spokenMessages?.warning
      : rule.spokenMessages?.error,
    ruleName: rule.name,
  }
}

/**
 * Evaluate all rules for a given exercise and return active issues,
 * sorted by severity (error first).
 * Also returns evaluatedRules — names of all rules that actually ran (not skipped).
 */
export const evaluateForm = (
  jointMap: JointMap,
  cameraAngle: CameraAngle,
  config: FormRuleConfig,
): { issues: FormIssue[]; skippedChecks: string[]; evaluatedRules: string[] } => {
  const issues: FormIssue[] = []
  const skippedChecks: string[] = []
  const evaluatedRules: string[] = []

  for (const rule of config.angleRules) {
    if (!rule.applicableAngles.includes(cameraAngle)) {
      skippedChecks.push(rule.name)
      continue
    }
    evaluatedRules.push(rule.name)
    const issue = evaluateAngleRule(rule, jointMap, cameraAngle)
    if (issue !== null) issues.push(issue)
  }

  // Run position rules (front-view checks)
  if (config.positionRules !== undefined) {
    for (const rule of config.positionRules) {
      if (!rule.applicableAngles.includes(cameraAngle)) {
        skippedChecks.push(rule.name)
        continue
      }
      evaluatedRules.push(rule.name)
      const issue = rule.evaluate(jointMap)
      if (issue !== null) issues.push(issue)
    }
  }

  // Run custom checks
  if (config.customChecks !== undefined) {
    for (const check of config.customChecks) {
      const issue = check(jointMap, cameraAngle)
      if (issue !== null) issues.push(issue)
    }
  }

  // Sort: error > warning > good
  const severityOrder: Record<FormSeverity, number> = { error: 0, warning: 1, good: 2 }
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return { issues, skippedChecks, evaluatedRules }
}

/** Extract unique joint names from issues for highlighting */
export const getIssueJointNames = (issues: FormIssue[]): JointName[] =>
  [...new Set(issues.map((i) => i.joint))]
