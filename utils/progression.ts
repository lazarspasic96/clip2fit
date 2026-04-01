import { type MuscleGroupKey } from '@/constants/muscle-colors'
import { normalizeMuscleGroup } from '@/utils/muscle-color'

// --- Types ---

export type ParsedReps =
  | { type: 'exact'; value: number }
  | { type: 'range'; low: number; high: number }

export type TargetResult = {
  weight: number
  delta: number
  isProgress: boolean
}

export type IncrementCategory = 'upper_compound' | 'lower_compound' | 'isolation'

export type PreviousSetData = {
  actualWeight: number | null
  actualReps: number | null
}

// --- Constants ---

const EXOTIC_PATTERNS = /(?:amrap|to failure|failure|sec|min|\/side|per side|each side|hold)/i

const INCREMENT_MAP: Record<IncrementCategory, number> = {
  upper_compound: 2.5,
  lower_compound: 5,
  isolation: 1.25,
}

const MUSCLE_TO_INCREMENT: Record<MuscleGroupKey, IncrementCategory> = {
  chest: 'upper_compound',
  shoulders: 'upper_compound',
  lats: 'upper_compound',
  middle_back: 'upper_compound',
  lower_back: 'upper_compound',
  traps: 'upper_compound',
  neck: 'upper_compound',
  quadriceps: 'lower_compound',
  hamstrings: 'lower_compound',
  glutes: 'lower_compound',
  abductors: 'lower_compound',
  adductors: 'lower_compound',
  biceps: 'isolation',
  triceps: 'isolation',
  forearms: 'isolation',
  abdominals: 'isolation',
  calves: 'isolation',
}

// --- Functions ---

export const parseTargetReps = (targetReps: string | null): ParsedReps | null => {
  if (targetReps === null || targetReps === undefined) return null

  const trimmed = targetReps.trim()
  if (trimmed.length === 0) return null
  if (EXOTIC_PATTERNS.test(trimmed)) return null

  // Range: "8-12"
  const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
  if (rangeMatch !== null) {
    const low = Number.parseInt(rangeMatch[1], 10)
    const high = Number.parseInt(rangeMatch[2], 10)
    if (Number.isNaN(low) || Number.isNaN(high)) return null
    return { type: 'range', low, high }
  }

  // Exact: "8"
  const exactMatch = trimmed.match(/^(\d+)$/)
  if (exactMatch !== null) {
    const value = Number.parseInt(exactMatch[1], 10)
    if (Number.isNaN(value)) return null
    return { type: 'exact', value }
  }

  return null
}

export const getProgressionTarget = (parsed: ParsedReps): number => {
  if (parsed.type === 'exact') return parsed.value
  return parsed.high
}

export const muscleGroupCategory = (groups: string[]): IncrementCategory => {
  if (groups.length === 0) return 'upper_compound'

  const primary = normalizeMuscleGroup(groups[0])
  if (primary === null) return 'upper_compound'

  return MUSCLE_TO_INCREMENT[primary]
}

export const getIncrement = (category: IncrementCategory): number => {
  return INCREMENT_MAP[category]
}

export const isEligible = (
  exercise: {
    catalogExerciseId?: string | null
    isBodyweight?: boolean
    targetReps: string | null
  },
  sessionCount: number,
): boolean => {
  if (
    exercise.catalogExerciseId === null ||
    exercise.catalogExerciseId === undefined ||
    exercise.catalogExerciseId.trim().length === 0
  ) {
    return false
  }
  if (exercise.isBodyweight === true) return false
  if (parseTargetReps(exercise.targetReps) === null) return false
  if (sessionCount < 2) return false
  return true
}

export const computeTarget = (params: {
  previousSets: PreviousSetData[]
  targetReps: string | null
  muscleGroups: string[]
}): TargetResult | null => {
  const { previousSets, targetReps, muscleGroups } = params

  if (previousSets.length === 0) return null

  const parsed = parseTargetReps(targetReps)
  if (parsed === null) return null

  const progressionTarget = getProgressionTarget(parsed)

  // All sets must have non-null weight and reps
  const completedSets = previousSets.filter(
    (s): s is { actualWeight: number; actualReps: number } =>
      s.actualWeight !== null && s.actualReps !== null,
  )
  if (completedSets.length === 0) return null

  // Use the weight from the first completed set as the base
  const previousWeight = completedSets[0].actualWeight

  // Check if all completed sets hit the progression target
  const allHitTarget = completedSets.every((s) => s.actualReps >= progressionTarget)

  const category = muscleGroupCategory(muscleGroups)
  const increment = getIncrement(category)

  if (allHitTarget) {
    return {
      weight: previousWeight + increment,
      delta: increment,
      isProgress: true,
    }
  }

  return {
    weight: previousWeight,
    delta: 0,
    isProgress: false,
  }
}
