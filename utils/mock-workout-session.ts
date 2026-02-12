import type { WorkoutExercise, WorkoutPlan, WorkoutSession } from '@/types/workout'

const createSets = (
  count: number,
  targetReps: string,
  targetWeight: number | null,
  previousReps: number | null,
  previousWeight: number | null
) =>
  Array.from({ length: count }, (_, i) => ({
    id: `set-${i + 1}`,
    setNumber: i + 1,
    targetReps,
    targetWeight,
    actualReps: null,
    actualWeight: null,
    previousReps,
    previousWeight,
    status: 'pending' as const,
  }))

const PUSH_DAY_EXERCISES: WorkoutExercise[] = [
  {
    id: 'ex-1',
    name: 'Bench Press',
    muscleGroups: ['Chest', 'Triceps'],
    sets: createSets(4, '10', 60, 10, 55),
    order: 1,
    status: 'active',
    notes: 'Keep elbows tucked at 45 degrees. Control the eccentric.',
    sourceVideoUrl: 'https://www.instagram.com/p/example1/',
    isBodyweight: false,
  },
  {
    id: 'ex-2',
    name: 'Incline DB Press',
    muscleGroups: ['Upper Chest', 'Shoulders'],
    sets: createSets(3, '12', 22, 12, 20),
    order: 2,
    status: 'pending',
    notes: '30-degree incline. Squeeze at the top.',
    sourceVideoUrl: 'https://www.instagram.com/p/example2/',
    isBodyweight: false,
  },
  {
    id: 'ex-3',
    name: 'Cable Fly',
    muscleGroups: ['Chest'],
    sets: createSets(3, '15', 15, 14, 12),
    order: 3,
    status: 'pending',
    notes: 'Squeeze at peak contraction. Slow on the way back.',
    sourceVideoUrl: 'https://www.instagram.com/p/example3/',
    isBodyweight: false,
  },
  {
    id: 'ex-4',
    name: 'Tricep Pushdown',
    muscleGroups: ['Triceps'],
    sets: createSets(3, '12', 25, 12, 22),
    order: 4,
    status: 'pending',
    notes: 'Keep elbows pinned to your sides.',
    sourceVideoUrl: null,
    isBodyweight: false,
  },
  {
    id: 'ex-5',
    name: 'Overhead Tricep Extension',
    muscleGroups: ['Triceps'],
    sets: createSets(3, '12', 18, 11, 15),
    order: 5,
    status: 'pending',
    notes: 'Full stretch at the bottom. Lock out at the top.',
    sourceVideoUrl: null,
    isBodyweight: false,
  },
  {
    id: 'ex-6',
    name: 'Dips',
    muscleGroups: ['Chest', 'Triceps'],
    sets: createSets(3, '10', null, 8, null),
    order: 6,
    status: 'pending',
    notes: 'Lean slightly forward for chest emphasis.',
    sourceVideoUrl: null,
    isBodyweight: true,
  },
]

export const MOCK_WORKOUT_PLAN: WorkoutPlan = {
  id: 'workout-1',
  title: 'Push Day',
  description: 'Chest & Triceps focus. 6 exercises.',
  platform: 'instagram',
  creatorName: null,
  creatorHandle: '@user392',
  sourceUrl: 'https://www.instagram.com/p/example/',
  thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
  exercises: PUSH_DAY_EXERCISES,
  estimatedDurationMinutes: 59,
  difficulty: 'intermediate',
  isPersonalCopy: false,
  templateId: null,
}

export const createMockSession = (): WorkoutSession => ({
  id: `session-${Date.now()}`,
  plan: MOCK_WORKOUT_PLAN,
  status: 'in_progress',
  startedAt: Date.now(),
  completedAt: null,
  activeExerciseIndex: 0,
})
