// --- Catalog API response types ---

export type CatalogDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type CatalogForce = 'push' | 'pull' | 'static'
export type CatalogMechanic = 'compound' | 'isolation'

export interface CatalogExercise {
  id: string
  exerciseDbId: string
  name: string
  aliases: string[]
  bodyPart: string
  target: string
  secondaryMuscles: string[]
  equipment: string
  category: string
  difficulty: CatalogDifficulty | null
  force: CatalogForce | null
  mechanic: CatalogMechanic | null
  gifUrl: string | null
  thumbnailUrl: string | null
}

export interface CatalogExerciseDetail extends CatalogExercise {
  instructions: string[]
  description: string
}

export interface CatalogPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
}

export interface CatalogListResponse {
  items: CatalogExercise[]
  pagination: CatalogPagination
}

// --- Filter types ---

export interface CatalogFilters {
  search: string
  muscle: string | null
  bodyPart: string | null
  equipment: string | null
  difficulty: CatalogDifficulty | null
  category: string | null
  force: CatalogForce | null
  mechanic: CatalogMechanic | null
}

export const EMPTY_FILTERS: CatalogFilters = {
  search: '',
  muscle: null,
  bodyPart: null,
  equipment: null,
  difficulty: null,
  category: null,
  force: null,
  mechanic: null,
}

// --- Workout builder types ---

export interface SelectedExercise {
  catalogExercise: CatalogExercise
  sets: number
  reps: string
  restSeconds: number | null
}

export interface CreateWorkoutPayload {
  title: string
  exercises: {
    catalogExerciseId: string
    sets: number
    reps: string
    targetWeight: number | null
    restBetweenSets: string | null
    notes: string | null
    order: number
    isBodyweight: boolean
  }[]
}

// --- Constants for filter options ---

// Body-region clustered order for inline chips
export const MUSCLE_GROUPS_ORDERED = [
  'pectorals',
  'delts',
  // -- region break (upper back) --
  'lats',
  'upper back',
  'traps',
  'spine',
  // -- region break (arms) --
  'biceps',
  'triceps',
  'forearms',
  // -- region break (legs) --
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  // -- region break (core/other) --
  'abs',
  'abductors',
  'adductors',
  'serratus anterior',
] as const

// Indices in MUSCLE_GROUPS_ORDERED where a wider gap (12px) separates body regions
// After: delts(1), spine(5), forearms(8), calves(12)
export const REGION_BREAK_INDICES = new Set([1, 5, 8, 12])

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  // ExerciseDB target names (primary keys)
  abs: 'Abs',
  abductors: 'Abductors',
  adductors: 'Adductors',
  biceps: 'Biceps',
  calves: 'Calves',
  delts: 'Shoulders',
  forearms: 'Forearms',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  lats: 'Lats',
  pectorals: 'Chest',
  quads: 'Quads',
  'serratus anterior': 'Serratus',
  spine: 'Lower Back',
  traps: 'Traps',
  triceps: 'Triceps',
  'upper back': 'Upper Back',
  // Legacy keys (used by normalizeMuscleGroup)
  abdominals: 'Abs',
  chest: 'Chest',
  lower_back: 'Lower Back',
  middle_back: 'Upper Back',
  neck: 'Neck',
  quadriceps: 'Quads',
  shoulders: 'Shoulders',
}

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  'leverage machine': 'Machine',
  'smith machine': 'Smith Machine',
  kettlebell: 'Kettlebell',
  band: 'Band',
  'body weight': 'Bodyweight',
  'ez barbell': 'EZ Bar',
  'medicine ball': 'Med Ball',
  'stability ball': 'Stability Ball',
  rope: 'Rope',
  weighted: 'Weighted',
  assisted: 'Assisted',
}

export const CATEGORY_LABELS: Record<string, string> = {
  strength: 'Strength',
  stretching: 'Stretching',
  plyometrics: 'Plyometrics',
  strongman: 'Strongman',
  powerlifting: 'Powerlifting',
  cardio: 'Cardio',
  'olympic weightlifting': 'Olympic',
}

// --- Filter presets (for future gym-split quick-apply) ---

export interface FilterPresetDef {
  label: string
  filters: Partial<CatalogFilters>
}

export const FILTER_PRESETS: FilterPresetDef[] = [
  { label: 'Push Day', filters: { force: 'push', category: 'strength' } },
  { label: 'Pull Day', filters: { force: 'pull', category: 'strength' } },
  { label: 'Leg Day', filters: { muscle: 'quads', category: 'strength' } },
  { label: 'Bodyweight Only', filters: { equipment: 'body weight' } },
]

// --- Label maps for building filter descriptions ---

export const FORCE_DISPLAY_LABELS: Record<string, string> = {
  push: 'Push',
  pull: 'Pull',
  static: 'Static',
}

export const DIFFICULTY_DISPLAY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const MECHANIC_DISPLAY_LABELS: Record<string, string> = {
  compound: 'Compound',
  isolation: 'Isolation',
}

// --- Catalog design types ---

export interface CatalogDesignProps {
  items: CatalogExercise[]
  total: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  error: string | null
  refetch: () => void
  isRefetching: boolean
  filters: CatalogFilters
  setFilters: (filters: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => void
  onToggle: (exercise: CatalogExercise) => void
  isSelected: (id: string) => boolean
  isDisabled?: (id: string) => boolean
  selectionVersion: number
  bottomInset?: number
  filterSheetRoute?: string
  navigationDisabled?: boolean
  hideFilterButton?: boolean
}
