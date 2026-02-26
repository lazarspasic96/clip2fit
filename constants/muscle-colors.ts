export type MuscleGroupKey =
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower_back'
  | 'middle_back'
  | 'neck'
  | 'quadriceps'
  | 'shoulders'
  | 'traps'
  | 'triceps'

export type MuscleCategory = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'full_body'

export const MUSCLE_GROUP_COLORS: Record<MuscleGroupKey, string> = {
  abdominals: '#eab308',
  abductors: '#38bdf8',
  adductors: '#1e40af',
  biceps: '#f472b6',
  calves: '#60a5fa',
  chest: '#f97316',
  forearms: '#db2777',
  glutes: '#1d4ed8',
  hamstrings: '#2563eb',
  lats: '#22d3ee',
  lower_back: '#0891b2',
  middle_back: '#06b6d4',
  neck: '#a1a1aa',
  quadriceps: '#3b82f6',
  shoulders: '#8b5cf6',
  traps: '#0ea5e9',
  triceps: '#ec4899',
}

export const MUSCLE_GROUP_TO_CATEGORY: Record<MuscleGroupKey, MuscleCategory> = {
  abdominals: 'core',
  abductors: 'legs',
  adductors: 'legs',
  biceps: 'arms',
  calves: 'legs',
  chest: 'chest',
  forearms: 'arms',
  glutes: 'legs',
  hamstrings: 'legs',
  lats: 'back',
  lower_back: 'back',
  middle_back: 'back',
  neck: 'core',
  quadriceps: 'legs',
  shoulders: 'shoulders',
  traps: 'back',
  triceps: 'arms',
}

export const FULL_BODY_COLOR = '#71717a'

export const CATEGORY_COLORS: Record<MuscleCategory, string> = {
  chest: MUSCLE_GROUP_COLORS.chest,
  back: MUSCLE_GROUP_COLORS.middle_back,
  shoulders: MUSCLE_GROUP_COLORS.shoulders,
  arms: MUSCLE_GROUP_COLORS.triceps,
  legs: MUSCLE_GROUP_COLORS.quadriceps,
  core: MUSCLE_GROUP_COLORS.abdominals,
  full_body: FULL_BODY_COLOR,
}

export const MUSCLE_CATEGORY_LABELS: Record<MuscleCategory, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  full_body: 'Full Body',
}
