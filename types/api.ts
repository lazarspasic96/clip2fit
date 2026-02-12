import type { UserProfile } from '@/types/profile'
import type { WorkoutExercise, WorkoutPlan, WorkoutSet } from '@/types/workout'

// --- API response shapes (match what the server returns) ---

export interface ApiExercise {
  id: string
  name: string
  sets: number
  reps: string
  targetWeight: number | null
  restBetweenSets: string | null
  notes: string | null
  order: number
  muscleGroups: string[]
  isBodyweight: boolean
}

export interface ApiWorkout {
  id: string
  title: string
  description: string | null
  platform: string
  creatorName: string | null
  creatorHandle: string | null
  sourceUrl: string
  thumbnailUrl: string | null
  estimatedDurationMinutes: number | null
  difficulty: string | null
  targetMuscles: string[] | null
  equipment: string[] | null
  isPersonalCopy: boolean
  templateId: string | null
  exercises: ApiExercise[]
}

export interface ApiJob {
  id: string
  status: 'pending' | 'downloading' | 'transcribing' | 'extracting' | 'completed' | 'failed'
  progress: number
  workoutId: string | null
  error: string | null
  createdAt: string
}

export interface ApiConvertResponse {
  jobId?: string
  workoutId?: string
  existing?: boolean
}

export interface ApiProfilePayload {
  fullName?: string
  gender?: string
  age?: number
  height?: number
  heightUnit?: 'cm' | 'in'
  weight?: number
  weightUnit?: 'kg' | 'lb'
  fitnessGoal?: string
}

export interface PatchWorkoutPayload {
  title?: string
  description?: string
  exercises: ApiExercise[]
}

// --- Mappers ---

const buildSets = (count: number, reps: string, targetWeight: number | null): WorkoutSet[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `set-${i + 1}`,
    setNumber: i + 1,
    targetReps: reps.length > 0 ? reps : null,
    targetWeight,
    actualReps: null,
    actualWeight: null,
    previousReps: null,
    previousWeight: null,
    status: 'pending' as const,
  }))

const mapExercise = (api: ApiExercise): WorkoutExercise => ({
  id: api.id,
  name: api.name,
  muscleGroups: api.muscleGroups,
  sets: buildSets(api.sets, api.reps, api.targetWeight),
  order: api.order,
  status: 'pending',
  notes: api.notes,
  sourceVideoUrl: null,
  isBodyweight: api.isBodyweight,
})

const VALID_PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook', 'twitter'] as const
type Platform = (typeof VALID_PLATFORMS)[number]

const toPlatform = (raw: string): Platform => {
  const lower = raw.toLowerCase()
  if (VALID_PLATFORMS.includes(lower as Platform)) return lower as Platform
  return 'instagram'
}

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
type Difficulty = (typeof VALID_DIFFICULTIES)[number]

const toDifficulty = (raw: string | null): Difficulty => {
  if (raw !== null && VALID_DIFFICULTIES.includes(raw as Difficulty)) return raw as Difficulty
  return 'intermediate'
}

export const mapApiWorkout = (api: ApiWorkout): WorkoutPlan => ({
  id: api.id,
  title: api.title,
  description: api.description ?? '',
  platform: toPlatform(api.platform),
  creatorName: api.creatorName ?? null,
  creatorHandle: api.creatorHandle ?? '',
  sourceUrl: api.sourceUrl,
  thumbnailUrl: api.thumbnailUrl ?? '',
  exercises: api.exercises.map(mapExercise),
  estimatedDurationMinutes: api.estimatedDurationMinutes ?? 0,
  difficulty: toDifficulty(api.difficulty),
  targetMuscles: api.targetMuscles ?? [],
  equipment: api.equipment ?? [],
  isPersonalCopy: api.isPersonalCopy,
  templateId: api.templateId,
})

export const mapProfileToApi = (profile: Partial<UserProfile>): ApiProfilePayload => {
  const payload: ApiProfilePayload = {}

  if (profile.fullName !== undefined) payload.fullName = profile.fullName
  if (profile.gender !== undefined) payload.gender = profile.gender
  if (profile.age !== undefined) payload.age = profile.age
  if (profile.height !== undefined) payload.height = profile.height
  if (profile.weight !== undefined) payload.weight = profile.weight
  if (profile.fitnessGoal !== undefined) payload.fitnessGoal = profile.fitnessGoal

  // Map mobile unit names to API unit names
  if (profile.heightUnit !== undefined) {
    payload.heightUnit = profile.heightUnit === 'ft' ? 'in' : 'cm'
  }
  if (profile.weightUnit !== undefined) {
    payload.weightUnit = profile.weightUnit === 'lbs' ? 'lb' : 'kg'
  }

  return payload
}
