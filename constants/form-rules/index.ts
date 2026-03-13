import type { FormRuleConfig } from '@/types/form-rules'

import { BENCH_PRESS_RULES } from './bench-press'
import { DEADLIFT_RULES } from './deadlift'
import { LUNGE_RULES } from './lunge'
import { OVERHEAD_PRESS_RULES } from './overhead-press'
import { SQUAT_RULES } from './squat'

const FORM_RULES_REGISTRY = new Map<string, FormRuleConfig>()

const registerRules = (config: FormRuleConfig, aliases: string[] = []) => {
  FORM_RULES_REGISTRY.set(config.canonicalName, config)
  FORM_RULES_REGISTRY.set(config.exerciseName.toLowerCase(), config)
  for (const alias of aliases) {
    FORM_RULES_REGISTRY.set(alias.toLowerCase(), config)
  }
}

registerRules(SQUAT_RULES, [
  'back squat', 'barbell squat', 'front squat', 'goblet squat',
  'bodyweight squat', 'air squat',
])

registerRules(DEADLIFT_RULES, [
  'conventional deadlift', 'barbell deadlift', 'sumo deadlift',
  'romanian deadlift', 'rdl', 'stiff leg deadlift',
])

registerRules(BENCH_PRESS_RULES, [
  'barbell bench press', 'flat bench press', 'flat bench',
  'incline bench press', 'decline bench press',
])

registerRules(OVERHEAD_PRESS_RULES, [
  'ohp', 'barbell overhead press', 'military press',
  'standing press', 'shoulder press', 'barbell shoulder press',
])

registerRules(LUNGE_RULES, [
  'walking lunge', 'reverse lunge', 'forward lunge',
  'barbell lunge', 'dumbbell lunge', 'split squat',
  'bulgarian split squat',
])

const NOISE_WORDS = new Set([
  'heavy', 'light', 'tempo', 'db', 'dumbbell', 'ez', 'smith',
  'pause', 'slow', 'explosive', 'cable', 'machine', 'seated',
  'standing', 'wide', 'narrow', 'grip', 'close', 'barbell',
])

const normalizeExerciseName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')      // strip parenthesized text
    .replace(/[^a-z\s]/g, '')     // strip non-alpha (keep spaces)
    .split(/\s+/)
    .filter((w) => !NOISE_WORDS.has(w))
    .join(' ')
    .trim()

// All canonical names for fallback matching
const CANONICAL_NAMES = [
  SQUAT_RULES.canonicalName,
  DEADLIFT_RULES.canonicalName,
  BENCH_PRESS_RULES.canonicalName,
  OVERHEAD_PRESS_RULES.canonicalName,
  LUNGE_RULES.canonicalName,
]

export const getFormRules = (exerciseName: string): FormRuleConfig | null => {
  // 1. Exact match
  const exact = FORM_RULES_REGISTRY.get(exerciseName.toLowerCase())
  if (exact !== undefined) return exact

  // 2. Normalized match
  const normalized = normalizeExerciseName(exerciseName)
  const normalizedMatch = FORM_RULES_REGISTRY.get(normalized)
  if (normalizedMatch !== undefined) return normalizedMatch

  // 3. Substring-contains fallback: check if any canonical name is contained in the normalized input
  for (const canonical of CANONICAL_NAMES) {
    if (normalized.includes(canonical)) {
      const match = FORM_RULES_REGISTRY.get(canonical)
      if (match !== undefined) return match
    }
  }

  return null
}

export const hasFormRules = (exerciseName: string): boolean =>
  getFormRules(exerciseName) !== null

export const getCanonicalExerciseNames = (): string[] => [
  SQUAT_RULES.exerciseName,
  DEADLIFT_RULES.exerciseName,
  BENCH_PRESS_RULES.exerciseName,
  OVERHEAD_PRESS_RULES.exerciseName,
  LUNGE_RULES.exerciseName,
]
