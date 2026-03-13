import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { formSessionStore, type FormSample } from '@/stores/form-session-store'
import type { FormSeverity } from '@/types/form-rules'

const SEVERITY_DOT_COLORS: Record<FormSeverity, string> = {
  good: 'bg-lime-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
}

type RuleBreakdown = {
  name: string
  totalSamples: number
  goodCount: number
  percentage: number | null
}

const computePerRuleBreakdown = (allSamples: FormSample[]): RuleBreakdown[] => {
  if (allSamples.length === 0) return []

  // Collect all rule names that were evaluated
  const ruleEvalCounts = new Map<string, number>()
  const ruleIssueCounts = new Map<string, number>()

  for (const sample of allSamples) {
    for (const ruleName of sample.evaluatedRules) {
      ruleEvalCounts.set(ruleName, (ruleEvalCounts.get(ruleName) ?? 0) + 1)
    }
    for (const issue of sample.issues) {
      const name = issue.ruleName ?? issue.message
      ruleIssueCounts.set(name, (ruleIssueCounts.get(name) ?? 0) + 1)
    }
  }

  return [...ruleEvalCounts.entries()].map(([name, totalSamples]) => {
    const issueCount = ruleIssueCounts.get(name) ?? 0
    const goodCount = totalSamples - issueCount
    const percentage = totalSamples > 0 ? Math.round((goodCount / totalSamples) * 100) : null
    return { name, totalSamples, goodCount, percentage }
  })
}

const getScoreColor = (pct: number | null): string => {
  if (pct === null) return 'text-zinc-500'
  if (pct >= 70) return 'text-lime-400'
  if (pct >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export const WorkoutSummaryScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const session = formSessionStore.getSession()
  const totalReps = formSessionStore.getTotalReps()

  const handleDone = () => {
    formSessionStore.reset()
    router.back()
  }

  if (session === null) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <Text className="text-white text-xl font-inter-bold mb-4">No Session Data</Text>
        <Pressable onPress={() => router.back()} className="bg-lime-500 rounded-full px-8 py-3">
          <Text className="text-black text-base font-inter-bold">Done</Text>
        </Pressable>
      </View>
    )
  }

  // Collect all form samples across sets
  const allFormSamples = session.sets.flatMap((s) => s.formSamples)

  // Calculate form score from rep scores (primary) or form samples (fallback)
  const allRepScores = session.sets.flatMap((s) => s.repScores)
  let formScore: number | null = null

  if (allRepScores.length > 0) {
    formScore =
      allRepScores.reduce((sum, r) => {
        const score = r.overallSeverity === 'good' ? 1 : r.overallSeverity === 'warning' ? 0.5 : 0
        return sum + score
      }, 0) / allRepScores.length
  } else if (allFormSamples.length > 0) {
    // Fallback: compute from form samples
    formScore =
      allFormSamples.reduce((sum, s) => {
        const score = s.worstSeverity === 'good' ? 1 : s.worstSeverity === 'warning' ? 0.5 : 0
        return sum + score
      }, 0) / allFormSamples.length
  }

  // Per-rule breakdown
  const ruleBreakdown = computePerRuleBreakdown(allFormSamples)

  // Most common issue
  const issueCounts = new Map<string, number>()
  for (const score of allRepScores) {
    for (const issue of score.issues) {
      issueCounts.set(issue.message, (issueCounts.get(issue.message) ?? 0) + 1)
    }
  }
  // Also count from form samples if no rep data
  if (allRepScores.length === 0) {
    for (const sample of allFormSamples) {
      for (const issue of sample.issues) {
        issueCounts.set(issue.message, (issueCounts.get(issue.message) ?? 0) + 1)
      }
    }
  }
  const mostCommonIssue = [...issueCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  const scoreColor =
    formScore === null ? 'text-zinc-500'
    : formScore >= 0.7 ? 'text-lime-400'
    : formScore >= 0.4 ? 'text-yellow-400'
    : 'text-red-400'

  const formScoreDisplay = formScore !== null ? `${Math.round(formScore * 100)}%` : 'N/A'

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
      >
        <Text className="text-white text-2xl font-inter-bold mt-6 mb-2 text-center">
          Session Complete
        </Text>
        <Text className="text-zinc-400 text-base font-inter-medium text-center mb-8">
          {session.exerciseName}
        </Text>

        {/* Stats row */}
        <View className="flex-row justify-around mb-8">
          <View className="items-center">
            <Text className="text-white text-3xl font-inter-bold">{session.sets.length}</Text>
            <Text className="text-zinc-500 text-sm font-inter-medium">Sets</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-3xl font-inter-bold">{totalReps}</Text>
            <Text className="text-zinc-500 text-sm font-inter-medium">Reps</Text>
          </View>
          <View className="items-center">
            <Text className={`text-3xl font-inter-bold ${scoreColor}`}>
              {formScoreDisplay}
            </Text>
            <Text className="text-zinc-500 text-sm font-inter-medium">Form</Text>
          </View>
        </View>

        {/* Per-check breakdown */}
        {ruleBreakdown.length > 0 && (
          <View className="bg-zinc-900 rounded-xl px-4 py-3 mb-6">
            <Text className="text-zinc-500 text-xs font-inter-medium mb-2">Form Breakdown</Text>
            {ruleBreakdown.map((rule) => (
              <View key={rule.name} className="flex-row items-center justify-between py-1.5">
                <Text className="text-white text-sm font-inter-medium flex-1 mr-3">
                  {rule.name}
                </Text>
                <Text className={`text-sm font-inter-bold ${getScoreColor(rule.percentage)}`}>
                  {rule.percentage !== null ? `${rule.percentage}% good` : 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Most common issue */}
        {mostCommonIssue !== undefined && (
          <View className="bg-zinc-900 rounded-xl px-4 py-3 mb-6">
            <Text className="text-zinc-500 text-xs font-inter-medium mb-1">Most Common Issue</Text>
            <Text className="text-white text-sm font-inter-medium">
              {mostCommonIssue[0]} ({mostCommonIssue[1]}x)
            </Text>
          </View>
        )}

        {/* Per-set breakdown */}
        {session.sets.map((set, i) => (
          <View key={i} className="bg-zinc-900 rounded-xl px-4 py-3 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-inter-bold">Set {i + 1}</Text>
              <Text className="text-zinc-400 text-sm font-inter-medium">{set.reps} reps</Text>
            </View>
            <View className="flex-row gap-1.5 flex-wrap">
              {set.repScores.map((score, j) => (
                <View
                  key={j}
                  className={`w-3 h-3 rounded-full ${SEVERITY_DOT_COLORS[score.overallSeverity]}`}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Done button */}
      <View
        className="px-6 pb-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable onPress={handleDone} className="bg-lime-500 rounded-full py-4 items-center">
          <Text className="text-black text-base font-inter-bold">Done</Text>
        </Pressable>
      </View>
    </View>
  )
}
