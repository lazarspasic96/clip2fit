// --- Catalog API response types ---

export type CatalogLevel = 'beginner' | 'intermediate' | 'expert'
export type CatalogForce = 'push' | 'pull' | 'static'
export type CatalogMechanic = 'compound' | 'isolation'

export interface CatalogExerciseImages {
  start: string
  end: string
}

export interface CatalogExercise {
  id: string
  name: string
  aliases: string[]
  primaryMuscleGroups: string[]
  secondaryMuscleGroups: string[]
  equipment: string[]
  isBodyweight: boolean
  category: string
  level: CatalogLevel | null
  force: CatalogForce | null
  mechanic: CatalogMechanic | null
  images: CatalogExerciseImages | null
}

export interface CatalogExerciseDetail extends CatalogExercise {
  instructions: string[]
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
  equipment: string | null
  level: CatalogLevel | null
  category: string | null
  force: CatalogForce | null
  mechanic: CatalogMechanic | null
}

export const EMPTY_FILTERS: CatalogFilters = {
  search: '',
  muscle: null,
  equipment: null,
  level: null,
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

export interface ManualWorkoutPayload {
  title: string
  exercises: Array<{
    catalogExerciseId: string
    name: string
    sets: number
    reps: string
    restBetweenSets: string | null
    order: number
    muscleGroups: string[]
    isBodyweight: boolean
  }>
}

// --- Constants for filter options ---

export const MUSCLE_GROUPS = [
  'abdominals',
  'abductors',
  'adductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'lower_back',
  'middle_back',
  'neck',
  'quadriceps',
  'shoulders',
  'traps',
  'triceps',
] as const

// Body-region clustered order for inline chips
export const MUSCLE_GROUPS_ORDERED = [
  'chest',
  'shoulders',
  // -- region break (upper back) --
  'lats',
  'middle_back',
  'traps',
  'lower_back',
  // -- region break (arms) --
  'biceps',
  'triceps',
  'forearms',
  // -- region break (legs) --
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  // -- region break (core/other) --
  'abdominals',
  'abductors',
  'adductors',
  'neck',
] as const

// Indices in MUSCLE_GROUPS_ORDERED where a wider gap (12px) separates body regions
// After: shoulders(1), lower_back(5), forearms(8), calves(12)
export const REGION_BREAK_INDICES = new Set([1, 5, 8, 12])

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  abdominals: 'Abs',
  abductors: 'Abductors',
  adductors: 'Adductors',
  biceps: 'Biceps',
  calves: 'Calves',
  chest: 'Chest',
  forearms: 'Forearms',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  lats: 'Lats',
  lower_back: 'Lower Back',
  middle_back: 'Mid Back',
  neck: 'Neck',
  quadriceps: 'Quads',
  shoulders: 'Shoulders',
  traps: 'Traps',
  triceps: 'Triceps',
}

export const EQUIPMENT_OPTIONS = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'kettlebells',
  'bands',
  'body only',
  'e-z curl bar',
  'medicine ball',
  'exercise ball',
  'foam roll',
  'other',
] as const

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  kettlebells: 'Kettlebells',
  bands: 'Bands',
  'body only': 'Bodyweight',
  'e-z curl bar': 'EZ Bar',
  'medicine ball': 'Med Ball',
  'exercise ball': 'Stability Ball',
  'foam roll': 'Foam Roll',
  other: 'Other',
}

export const CATEGORY_OPTIONS = [
  'strength',
  'stretching',
  'plyometrics',
  'strongman',
  'powerlifting',
  'cardio',
  'olympic weightlifting',
] as const

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
  { label: 'Leg Day', filters: { muscle: 'quadriceps', category: 'strength' } },
  { label: 'Bodyweight Only', filters: { equipment: 'body only' } },
]

// --- Label maps for building filter descriptions ---

export const FORCE_DISPLAY_LABELS: Record<string, string> = {
  push: 'Push',
  pull: 'Pull',
  static: 'Static',
}

export const LEVEL_DISPLAY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
}

export const MECHANIC_DISPLAY_LABELS: Record<string, string> = {
  compound: 'Compound',
  isolation: 'Isolation',
}
