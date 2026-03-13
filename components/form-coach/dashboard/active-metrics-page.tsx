import { Text, View } from 'react-native'

import type { CameraAngle, FormIssue, FormSeverity } from '@/types/form-rules'

import { MetricCard } from './metric-card'

const SEVERITY_TEXT_COLORS: Record<FormSeverity, string> = {
  good: 'text-lime-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
}

const getFormGrade = (issues: FormIssue[]): { label: string; severity: FormSeverity } => {
  if (issues.length === 0) return { label: 'Good', severity: 'good' }
  if (issues.some((i) => i.severity === 'error')) return { label: 'Fix', severity: 'error' }
  return { label: 'Fair', severity: 'warning' }
}

const getAngleColor = (
  value: number,
  rule?: { ranges: { good: [number, number]; warning: [number, number] } },
): string => {
  if (rule === undefined) return 'text-white'
  if (value >= rule.ranges.good[0] && value <= rule.ranges.good[1]) return 'text-lime-400'
  if (value >= rule.ranges.warning[0] && value <= rule.ranges.warning[1]) return 'text-yellow-400'
  return 'text-red-400'
}

type ActiveMetricsPageProps = {
  repCount: number
  formIssues: FormIssue[]
  debugAngles: Record<string, number>
  cameraAngle: CameraAngle
  skippedChecks: string[]
  lastConcentricMs: number | null
  isBarbell: boolean
  isLandscape: boolean
  angleRules?: { name: string; ranges: { good: [number, number]; warning: [number, number] } }[]
}

export const ActiveMetricsPage = ({
  repCount,
  formIssues,
  debugAngles,
  cameraAngle,
  skippedChecks,
  lastConcentricMs,
  isBarbell,
  isLandscape,
  angleRules,
}: ActiveMetricsPageProps) => {
  const grade = getFormGrade(formIssues)
  const barSpeed = lastConcentricMs !== null ? `${(lastConcentricMs / 1000).toFixed(1)}s` : '—'

  // First angle as "primary depth"
  const angleEntries = Object.entries(debugAngles)
  const primaryAngle = angleEntries[0]

  const cardDirection = isLandscape ? 'flex-col' : 'flex-row'

  return (
    <View className="flex-1 px-3 py-2 gap-2">
      {/* Top row: key metrics */}
      <View className={`${cardDirection} gap-2`}>
        <MetricCard label="Rep" value={repCount} monospace />
        <MetricCard label="Form" value={grade.label} color={SEVERITY_TEXT_COLORS[grade.severity]} />
        {primaryAngle !== undefined && (
          <MetricCard
            label={primaryAngle[0]}
            value={`${Math.round(primaryAngle[1])}°`}
            color={getAngleColor(
              primaryAngle[1],
              angleRules?.find((r) => r.name === primaryAngle[0]),
            )}
            monospace
          />
        )}
        {isBarbell && <MetricCard label="Bar" value={barSpeed} monospace />}
      </View>

      {/* Angle cards (remaining) */}
      {angleEntries.length > 1 && (
        <View className={`${cardDirection} gap-2 flex-wrap`}>
          {angleEntries.slice(1).map(([name, value]) => (
            <MetricCard
              key={name}
              label={name}
              value={`${Math.round(value)}°`}
              color={getAngleColor(value, angleRules?.find((r) => r.name === name))}
              monospace
            />
          ))}
        </View>
      )}

      {/* Bottom info row */}
      <View className="flex-row items-center gap-3 mt-auto">
        <Text className="text-zinc-500 text-[10px] font-inter-medium">
          📷 {cameraAngle.charAt(0).toUpperCase() + cameraAngle.slice(1)}
        </Text>
        {skippedChecks.length > 0 && (
          <Text className="text-yellow-500/70 text-[10px] font-inter-medium">
            ⚠ {skippedChecks.length} check{skippedChecks.length > 1 ? 's' : ''} skipped
          </Text>
        )}
      </View>
    </View>
  )
}
