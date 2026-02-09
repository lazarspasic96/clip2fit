export type HomeScreenState = 'empty' | 'active' | 'rest'

export type MockWorkout = {
  id: string
  title: string
  description: string
  platform: 'tiktok' | 'instagram' | 'youtube'
  creatorHandle: string
  thumbnailUrl: string
  duration: string
  exerciseCount: number
  calories: number
}

export type DayStatus = 'completed' | 'skipped' | 'active' | 'activeRest' | 'future' | 'rest'

export type WeekDay = {
  label: string
  date: number
  workoutLabel?: string
  status: DayStatus
}

export const MOCK_WORKOUT: MockWorkout = {
  id: '1',
  title: 'Todays Workout',
  description: 'Full body workout.',
  platform: 'instagram',
  creatorHandle: '@user392',
  thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
  duration: '59 min',
  exerciseCount: 6,
  calories: 150,
}

const EMPTY_WEEK: WeekDay[] = [
  { label: 'M', date: 15, status: 'active' },
  { label: 'T', date: 16, status: 'future' },
  { label: 'W', date: 17, status: 'future' },
  { label: 'T', date: 18, status: 'future' },
  { label: 'F', date: 19, status: 'future' },
  { label: 'S', date: 20, status: 'future' },
  { label: 'S', date: 21, status: 'future' },
]

const ACTIVE_WEEK: WeekDay[] = [
  { label: 'M', date: 15, workoutLabel: 'Pull', status: 'completed' },
  { label: 'T', date: 16, workoutLabel: 'Push', status: 'skipped' },
  { label: 'W', date: 17, workoutLabel: 'Full', status: 'active' },
  { label: 'T', date: 18, workoutLabel: 'Leg', status: 'future' },
  { label: 'F', date: 19, status: 'rest' },
  { label: 'S', date: 20, workoutLabel: 'Upper', status: 'future' },
  { label: 'S', date: 21, status: 'rest' },
]

const REST_WEEK: WeekDay[] = [
  { label: 'M', date: 15, workoutLabel: 'Pull', status: 'completed' },
  { label: 'T', date: 16, workoutLabel: 'Push', status: 'completed' },
  { label: 'W', date: 17, workoutLabel: 'Full', status: 'completed' },
  { label: 'T', date: 18, workoutLabel: 'Leg', status: 'completed' },
  { label: 'F', date: 19, status: 'activeRest' },
  { label: 'S', date: 20, workoutLabel: 'Upper', status: 'future' },
  { label: 'S', date: 21, status: 'rest' },
]

export const MOCK_DATA = {
  empty: {
    subtitle: 'Turn your favorite influencer workouts into real training sessions.',
    week: EMPTY_WEEK,
    streakText: 'No data. Start collect!',
    workout: null,
  },
  active: {
    subtitle: 'You are in the top of 2% of our user.',
    week: ACTIVE_WEEK,
    streakText: '8 weeks in a row. Great job!!!',
    workout: MOCK_WORKOUT,
  },
  rest: {
    subtitle: 'You are in the top of 2% of our user.',
    week: REST_WEEK,
    streakText: '8 weeks in a row. Great job!!!',
    workout: null,
  },
} as const
