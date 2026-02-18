export type StatsPeriod = '7d' | '30d' | '6m' | '1y' | 'all'

export interface ApiWeeklyFrequencyPoint {
  week: string
  sessions: number
  volume: number
}

export interface ApiTopExercise {
  catalog_exercise_id: string | null
  exercise_name: string
  session_count: number
}

export interface ApiMuscleGroupDistributionPoint {
  muscle_group: string
  session_count: number
}

export interface ApiStatsSummaryResponse {
  total_sessions: number
  completed_sessions: number
  partial_sessions: number
  avg_duration_seconds: number
  total_volume: number
  current_streak_weeks: number
  best_streak_weeks: number
  weekly_frequency: ApiWeeklyFrequencyPoint[]
  top_exercises: ApiTopExercise[]
  muscle_group_distribution: ApiMuscleGroupDistributionPoint[]
}

export interface ApiPRTimelinePoint {
  date: string
  weight: number
  reps: number
  previous_weight: number | null
  session_id: string
}

export interface ApiPRExercise {
  catalog_exercise_id: string | null
  exercise_name: string
  current_pr: number
  pr_timeline: ApiPRTimelinePoint[]
}

export interface ApiPRsResponse {
  exercises: ApiPRExercise[]
  total_pr_count: number
}

export interface StatsWeeklyFrequencyPoint {
  week: string
  sessions: number
  volume: number
}

export interface StatsTopExercise {
  catalogExerciseId: string | null
  exerciseName: string
  sessionCount: number
}

export interface StatsMuscleGroupDistributionPoint {
  muscleGroup: string
  sessionCount: number
  percentage: number
}

export interface StatsSummary {
  totalSessions: number
  completedSessions: number
  partialSessions: number
  avgDurationSeconds: number
  totalVolume: number
  currentStreakWeeks: number
  bestStreakWeeks: number
  weeklyFrequency: StatsWeeklyFrequencyPoint[]
  topExercises: StatsTopExercise[]
  muscleGroupDistribution: StatsMuscleGroupDistributionPoint[]
}

export interface StatsPRTimelinePoint {
  date: string
  weight: number
  reps: number
  previousWeight: number | null
  sessionId: string
}

export interface StatsPRExercise {
  catalogExerciseId: string | null
  exerciseName: string
  currentPr: number
  prTimeline: StatsPRTimelinePoint[]
}

export interface StatsPRs {
  exercises: StatsPRExercise[]
  totalPrCount: number
}

export const PERIOD_OPTIONS: Array<{ label: string; value: StatsPeriod }> = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
]

export const formatMuscleLabel = (label: string) =>
  label
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const roundPercent = (value: number) => Math.round(value * 10) / 10

const HAS_TZ_SUFFIX_RE = /(Z|[+-]\d{2}:\d{2})$/i

type AnyRecord = Record<string, unknown>

const asRecord = (value: unknown): AnyRecord =>
  value !== null && typeof value === 'object' ? (value as AnyRecord) : {}

const getNumber = (record: AnyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

const getString = (record: AnyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return ''
}

const getNullableString = (record: AnyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
    if (value === null) return null
  }
  return null
}

const getArray = (record: AnyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }
  return []
}

const getNullableNumber = (record: AnyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (value === null) return null
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

const normalizeUtcInstant = (value: string): string => {
  if (HAS_TZ_SUFFIX_RE.test(value)) return value
  return `${value}Z`
}

export const parseUtcInstantMs = (value: string): number => {
  if (value.length === 0) return Number.NaN
  return Date.parse(normalizeUtcInstant(value))
}

const sortTimeline = (timeline: StatsPRTimelinePoint[]): StatsPRTimelinePoint[] => (
  timeline
    .slice()
    .sort((a, b) => parseUtcInstantMs(a.date) - parseUtcInstantMs(b.date))
)

const withDerivedPreviousWeight = (timeline: StatsPRTimelinePoint[]): StatsPRTimelinePoint[] => {
  const sorted = sortTimeline(timeline)

  return sorted.map((point, index) => ({
    ...point,
    previousWeight:
      point.previousWeight !== null
        ? point.previousWeight
        : index > 0
          ? sorted[index - 1]?.weight ?? null
          : null,
  }))
}

const mapLegacyPRExercise = (exercise: AnyRecord, index: number): StatsPRExercise => {
  const exerciseName = getString(exercise, 'exercise_name', 'exerciseName', 'name')
  const catalogExerciseId = getNullableString(exercise, 'catalog_exercise_id', 'catalogExerciseId')
  const currentPrNode = asRecord(exercise.current_pr)
  const rawTimeline = getArray(exercise, 'pr_timeline', 'prTimeline')

  const mappedTimeline = withDerivedPreviousWeight(rawTimeline.map((pointItem, pointIndex) => {
    const point = asRecord(pointItem)
    return {
      date: getString(point, 'date'),
      weight: getNumber(point, 'weight', 'max_weight'),
      reps: getNumber(point, 'reps', 'reps_at_max'),
      previousWeight: getNullableNumber(point, 'previous_weight', 'previousWeight'),
      sessionId:
        getString(point, 'session_id', 'sessionId')
        || `${(catalogExerciseId ?? exerciseName) || 'exercise'}-${index}-${pointIndex}`,
    }
  }))

  return {
    catalogExerciseId,
    exerciseName,
    currentPr:
      getNumber(currentPrNode, 'weight')
      || getNumber(exercise, 'current_pr', 'currentPr')
      || mappedTimeline[mappedTimeline.length - 1]?.weight
      || 0,
    prTimeline: mappedTimeline,
  }
}

export const mapSummaryResponse = (api: unknown): StatsSummary => {
  const rootCandidate = asRecord(api)
  const root = asRecord(rootCandidate.summary ?? rootCandidate.stats ?? rootCandidate.data ?? rootCandidate)
  const sessionsNode = asRecord(root.sessions)
  const volumeNode = asRecord(root.volume)
  const streaksNode = asRecord(root.streaks)

  const rawWeekly = getArray(root, 'weekly_frequency', 'weeklyFrequency')
  const rawTopExercises = getArray(root, 'top_exercises', 'topExercises')
  const rawMuscles = getArray(root, 'muscle_group_distribution', 'muscleGroupDistribution')

  const weeklyFrequency = rawWeekly.map((item) => {
    const row = asRecord(item)
    return {
      week: getString(row, 'week', 'label', 'date'),
      sessions: getNumber(row, 'sessions', 'session_count', 'sessionCount'),
      volume: getNumber(row, 'volume', 'total_volume', 'totalVolume', 'volume_kg'),
    }
  })

  const topExercises = rawTopExercises.map((item) => {
    const row = asRecord(item)
    return {
      catalogExerciseId: getNullableString(row, 'catalog_exercise_id', 'catalogExerciseId'),
      exerciseName: getString(row, 'exercise_name', 'exerciseName', 'name'),
      sessionCount: getNumber(row, 'session_count', 'sessionCount', 'sessions'),
    }
  })

  const mappedMuscles = rawMuscles.map((item) => {
    const row = asRecord(item)
    return {
      muscleGroup: getString(row, 'muscle_group', 'muscleGroup', 'name'),
      sessionCount: getNumber(row, 'session_count', 'sessionCount', 'sessions'),
      rawPercentage: getNumber(row, 'percentage'),
    }
  })

  const totalMuscleSessions = mappedMuscles.reduce((acc, row) => acc + row.sessionCount, 0)

  const muscleGroupDistribution = mappedMuscles
    .map((row) => ({
      muscleGroup: row.muscleGroup,
      sessionCount: row.sessionCount,
      percentage:
        row.rawPercentage > 0
          ? roundPercent(row.rawPercentage)
          : totalMuscleSessions > 0
            ? roundPercent((row.sessionCount / totalMuscleSessions) * 100)
            : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const totalSessions = getNumber(root, 'total_sessions', 'totalSessions')
    || getNumber(sessionsNode, 'total', 'total_sessions', 'totalSessions')
  const completedSessions = getNumber(root, 'completed_sessions', 'completedSessions')
    || getNumber(sessionsNode, 'completed', 'completed_sessions', 'completedSessions')
  const partialSessions = getNumber(root, 'partial_sessions', 'partialSessions')
    || getNumber(sessionsNode, 'partial', 'partial_sessions', 'partialSessions')
  const avgDurationSeconds = getNumber(root, 'avg_duration_seconds', 'avgDurationSeconds')
    || (getNumber(sessionsNode, 'avg_duration_minutes', 'avgDurationMinutes') * 60)
  const totalVolume = getNumber(root, 'total_volume', 'totalVolume')
    || getNumber(volumeNode, 'total_kg', 'totalKg')
    || weeklyFrequency.reduce((acc, row) => acc + row.volume, 0)
  const currentStreakWeeks = getNumber(root, 'current_streak_weeks', 'currentStreakWeeks')
    || getNumber(streaksNode, 'currentWeeks', 'current_weeks', 'current')
  const bestStreakWeeks = getNumber(root, 'best_streak_weeks', 'bestStreakWeeks')
    || getNumber(streaksNode, 'bestWeeks', 'best_weeks', 'best')

  return {
    totalSessions,
    completedSessions,
    partialSessions,
    avgDurationSeconds,
    totalVolume,
    currentStreakWeeks,
    bestStreakWeeks,
    weeklyFrequency,
    topExercises,
    muscleGroupDistribution,
  }
}

export const mapPRsResponse = (api: unknown): StatsPRs => {
  const rootCandidate = asRecord(api)
  const legacyRoot = asRecord(rootCandidate.prs ?? rootCandidate.data ?? rootCandidate)
  const rawLegacyExercises = getArray(legacyRoot, 'exercises')

  if (rawLegacyExercises.length > 0) {
    const mappedLegacy = rawLegacyExercises.map((item, index) => mapLegacyPRExercise(asRecord(item), index))
    return {
      exercises: mappedLegacy,
      totalPrCount: getNumber(legacyRoot, 'total_pr_count', 'totalPrCount'),
    }
  }

  const rawPrs = getArray(rootCandidate, 'prs')
  const mappedPrs = rawPrs.map((item, index) => {
    const row = asRecord(item)
    const currentPrNode = asRecord(row.current_pr)
    const exerciseName = getString(row, 'exercise_name', 'exerciseName', 'name')
    const catalogExerciseId = getNullableString(row, 'catalog_exercise_id', 'catalogExerciseId')
    const date = getString(currentPrNode, 'date')

    const prTimeline = date.length > 0
      ? withDerivedPreviousWeight([
        {
          date,
          weight: getNumber(currentPrNode, 'weight'),
          reps: getNumber(currentPrNode, 'reps'),
          previousWeight: null,
          sessionId:
            getString(currentPrNode, 'session_id', 'sessionId')
            || `${(catalogExerciseId ?? exerciseName) || 'exercise'}-${index}`,
        },
      ])
      : []

    return {
      catalogExerciseId,
      exerciseName,
      currentPr:
        getNumber(currentPrNode, 'weight')
        || getNumber(row, 'current_pr')
        || prTimeline[prTimeline.length - 1]?.weight
        || 0,
      prTimeline,
    } satisfies StatsPRExercise
  })

  const totalPrCount = getNumber(rootCandidate, 'total_pr_count', 'totalPrCount')
    || mappedPrs.reduce((sum, row) => sum + (row.prTimeline.length > 0 ? 1 : 0), 0)

  return {
    exercises: mappedPrs,
    totalPrCount,
  }
}

export const mapPRHistoryResponse = (api: unknown): StatsPRExercise | null => {
  const root = asRecord(api)
  const exercise = asRecord(root.exercise)
  const allTimePr = asRecord(root.all_time_pr)
  const rawHistory = getArray(root, 'history')

  const catalogExerciseId = getNullableString(exercise, 'catalog_exercise_id', 'catalogExerciseId')
  const exerciseName = getString(exercise, 'name', 'exercise_name', 'exerciseName')

  const prTimeline = withDerivedPreviousWeight(rawHistory.map((item, index) => {
    const row = asRecord(item)
    return {
      date: getString(row, 'date'),
      weight: getNumber(row, 'max_weight', 'weight'),
      reps: getNumber(row, 'reps_at_max', 'reps'),
      previousWeight: null,
      sessionId:
        getString(row, 'session_id', 'sessionId')
        || `${(catalogExerciseId ?? exerciseName) || 'exercise'}-${index}`,
    }
  }))

  const currentPr =
    getNumber(allTimePr, 'weight', 'max_weight')
    || prTimeline[prTimeline.length - 1]?.weight
    || 0

  if (exerciseName.length === 0 && prTimeline.length === 0 && currentPr <= 0) {
    return null
  }

  return {
    catalogExerciseId,
    exerciseName,
    currentPr,
    prTimeline,
  }
}
