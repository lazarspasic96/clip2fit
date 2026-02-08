export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'improve_endurance'
  | 'general_fitness'
  | 'athletic_performance'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type HeightUnit = 'cm' | 'ft'
export type WeightUnit = 'kg' | 'lbs'

export interface UserProfile {
  fullName?: string
  gender?: Gender
  age?: number
  height?: number
  heightUnit?: HeightUnit
  weight?: number
  weightUnit?: WeightUnit
  fitnessGoal?: FitnessGoal
}

export const FITNESS_GOALS: { label: string; value: FitnessGoal }[] = [
  { label: 'Lose Weight', value: 'lose_weight' },
  { label: 'Build Muscle', value: 'build_muscle' },
  { label: 'Improve Endurance', value: 'improve_endurance' },
  { label: 'General Fitness', value: 'general_fitness' },
  { label: 'Athletic Performance', value: 'athletic_performance' },
]

export const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]
