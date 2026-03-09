export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'get_stronger'
  | 'improve_endurance'
  | 'general_fitness'
  | 'flexibility_mobility'
  | 'athletic_performance'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type HeightUnit = 'cm' | 'ft'
export type WeightUnit = 'kg' | 'lbs'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'

export type WorkoutLocation = 'gym' | 'home' | 'both' | 'outdoor'

export type Equipment =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell_rack'
  | 'resistance_bands'
  | 'kettlebells'
  | 'pullup_bar'
  | 'bench'
  | 'cable_machine'
  | 'full_gym'

export type TrainingStyle =
  | 'strength'
  | 'hypertrophy'
  | 'bodybuilding'
  | 'hiit'
  | 'circuit'
  | 'calisthenics'
  | 'powerlifting'
  | 'olympic_weightlifting'
  | 'crossfit'
  | 'functional'
  | 'endurance'
  | 'yoga_pilates'

export type FocusArea =
  | 'full_body'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'glutes'
  | 'legs'

export type InjuryTag =
  | 'none'
  | 'lower_back'
  | 'knees'
  | 'shoulders'
  | 'wrists'
  | 'neck'
  | 'hips'
  | 'ankles'

export interface UserProfile {
  fullName?: string
  gender?: Gender
  dateOfBirth?: string
  /** Read-only, computed from dateOfBirth by the API */
  age?: number
  height?: number
  heightUnit?: HeightUnit
  weight?: number
  weightUnit?: WeightUnit
  fitnessGoal?: FitnessGoal
  timezone?: string
  experienceLevel?: ExperienceLevel
  activityLevel?: ActivityLevel
  workoutLocation?: WorkoutLocation
  equipment?: Equipment[]
  trainingFrequency?: number
  sessionDuration?: number
  trainingStyles?: TrainingStyle[]
  focusAreas?: FocusArea[]
  injuries?: InjuryTag[]
  injuryNotes?: string
}

export const FITNESS_GOALS: { label: string; value: FitnessGoal }[] = [
  { label: 'Lose Weight', value: 'lose_weight' },
  { label: 'Build Muscle', value: 'build_muscle' },
  { label: 'Get Stronger', value: 'get_stronger' },
  { label: 'Improve Endurance', value: 'improve_endurance' },
  { label: 'General Fitness', value: 'general_fitness' },
  { label: 'Flexibility & Mobility', value: 'flexibility_mobility' },
]

export const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

export const EXPERIENCE_LEVELS: { label: string; subtitle: string; value: ExperienceLevel }[] = [
  { label: 'Beginner', subtitle: 'New to working out or getting back into it', value: 'beginner' },
  { label: 'Intermediate', subtitle: 'Consistent training for 6+ months', value: 'intermediate' },
  { label: 'Advanced', subtitle: 'Years of structured training experience', value: 'advanced' },
]

export const ACTIVITY_LEVELS: { label: string; value: ActivityLevel }[] = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Lightly Active', value: 'lightly_active' },
  { label: 'Moderately Active', value: 'moderately_active' },
  { label: 'Very Active', value: 'very_active' },
]

export const WORKOUT_LOCATIONS: { label: string; value: WorkoutLocation }[] = [
  { label: 'At the Gym', value: 'gym' },
  { label: 'At Home', value: 'home' },
  { label: 'Both', value: 'both' },
  { label: 'Outdoors', value: 'outdoor' },
]

export const EQUIPMENT_OPTIONS: { label: string; value: Equipment }[] = [
  { label: 'Bodyweight', value: 'bodyweight' },
  { label: 'Dumbbells', value: 'dumbbells' },
  { label: 'Barbell & Rack', value: 'barbell_rack' },
  { label: 'Resistance Bands', value: 'resistance_bands' },
  { label: 'Kettlebells', value: 'kettlebells' },
  { label: 'Pull-up Bar', value: 'pullup_bar' },
  { label: 'Bench', value: 'bench' },
  { label: 'Cable Machine', value: 'cable_machine' },
  { label: 'Full Gym', value: 'full_gym' },
]

export const TRAINING_STYLES: { label: string; value: TrainingStyle }[] = [
  { label: 'Strength', value: 'strength' },
  { label: 'Hypertrophy', value: 'hypertrophy' },
  { label: 'Bodybuilding', value: 'bodybuilding' },
  { label: 'HIIT', value: 'hiit' },
  { label: 'Circuit Training', value: 'circuit' },
  { label: 'Calisthenics', value: 'calisthenics' },
  { label: 'Powerlifting', value: 'powerlifting' },
  { label: 'Olympic Lifting', value: 'olympic_weightlifting' },
  { label: 'CrossFit', value: 'crossfit' },
  { label: 'Functional', value: 'functional' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Yoga & Pilates', value: 'yoga_pilates' },
]

export const FOCUS_AREAS: { label: string; value: FocusArea }[] = [
  { label: 'Full Body', value: 'full_body' },
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Arms', value: 'arms' },
  { label: 'Core', value: 'core' },
  { label: 'Glutes', value: 'glutes' },
  { label: 'Legs', value: 'legs' },
]

export const INJURY_TAGS: { label: string; value: InjuryTag }[] = [
  { label: 'None', value: 'none' },
  { label: 'Lower Back', value: 'lower_back' },
  { label: 'Knees', value: 'knees' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Wrists', value: 'wrists' },
  { label: 'Neck', value: 'neck' },
  { label: 'Hips', value: 'hips' },
  { label: 'Ankles', value: 'ankles' },
]

export const SESSION_DURATIONS: { label: string; subtitle: string; value: number }[] = [
  { label: '15 min', subtitle: 'Quick & efficient', value: 15 },
  { label: '30 min', subtitle: 'Focused session', value: 30 },
  { label: '45 min', subtitle: 'The sweet spot', value: 45 },
  { label: '60 min', subtitle: 'Full program', value: 60 },
  { label: '90+ min', subtitle: 'Extended with warm-up & cool-down', value: 90 },
]

export const TRAINING_FREQUENCIES = [1, 2, 3, 4, 5, 6, 7] as const
