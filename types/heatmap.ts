export type WorkoutCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'full_body'

export const CATEGORY_COLORS: Record<WorkoutCategory, string> = {
  chest: '#f97316',
  back: '#06b6d4',
  shoulders: '#8b5cf6',
  arms: '#ec4899',
  legs: '#3b82f6',
  core: '#eab308',
  full_body: '#71717a',
}

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  full_body: 'Full Body',
}

export const ALL_CATEGORIES: WorkoutCategory[] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
  'full_body',
]

export interface HeatmapDay {
  date: string
  count: number
  categories: WorkoutCategory[]
}

export interface HeatmapData {
  days: HeatmapDay[]
  totalSessions: number
  activeDays: number
}

// --- Defensive mapper (same pattern as stats.ts) ---

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

const getArray = (record: AnyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }
  return []
}

const VALID_CATEGORIES = new Set<string>(ALL_CATEGORIES)

const toCategory = (raw: string): WorkoutCategory | null => {
  const lower = raw.toLowerCase().replace(/\s+/g, '_')
  return VALID_CATEGORIES.has(lower) ? (lower as WorkoutCategory) : null
}

export const mapHeatmapResponse = (api: unknown): HeatmapData => {
  const root = asRecord(api)
  const data = asRecord(root.data ?? root)
  const rawDays = getArray(data, 'days')

  const days: HeatmapDay[] = rawDays.map((item) => {
    const row = asRecord(item)
    const rawCategories = getArray(row, 'categories')
    const categories = rawCategories
      .map((c) => (typeof c === 'string' ? toCategory(c) : null))
      .filter((c): c is WorkoutCategory => c !== null)

    return {
      date: getString(row, 'date'),
      count: getNumber(row, 'count', 'session_count', 'sessionCount'),
      categories,
    }
  })

  return {
    days,
    totalSessions: getNumber(data, 'total_sessions', 'totalSessions'),
    activeDays: getNumber(data, 'active_days', 'activeDays'),
  }
}
