export type SetStatus = 'pending' | 'completed' | 'skipped'
export type ExerciseStatus = 'pending' | 'active' | 'completed' | 'skipped'

export interface WorkoutSet {
  id: string
  setNumber: number
  targetReps: string | null
  targetWeight: number | null
  actualReps: number | null
  actualWeight: number | null
  previousReps: number | null
  previousWeight: number | null
  status: SetStatus
}

export interface WorkoutExercise {
  id: string
  name: string
  muscleGroups: string[]
  sets: WorkoutSet[]
  order: number
  status: ExerciseStatus
  notes: string | null
  sourceVideoUrl: string | null
  isBodyweight: boolean
  catalogExerciseId: string | null
}

export interface WorkoutPlan {
  id: string
  title: string
  description: string
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'twitter'
  creatorName: string | null
  creatorHandle: string
  sourceUrl: string
  thumbnailUrl: string
  exercises: WorkoutExercise[]
  estimatedDurationMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetMuscles?: string[]
  equipment?: string[]
  isPersonalCopy: boolean
  templateId: string | null
}

export interface WorkoutSession {
  id: string
  plan: WorkoutPlan
  status: 'in_progress' | 'completed'
  startedAt: number
  completedAt?: number
  activeExerciseIndex: number
}
