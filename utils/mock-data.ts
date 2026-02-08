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

export type WeekDay = {
  label: string
  date: number
  workoutLabel?: string
  isRest: boolean
  isToday: boolean
  dotColors: string[]
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
  { label: 'M', date: 15, isRest: false, isToday: true, dotColors: [] },
  { label: 'T', date: 16, isRest: false, isToday: false, dotColors: [] },
  { label: 'W', date: 17, isRest: false, isToday: false, dotColors: [] },
  { label: 'T', date: 18, isRest: false, isToday: false, dotColors: [] },
  { label: 'F', date: 19, isRest: false, isToday: false, dotColors: [] },
  { label: 'S', date: 20, isRest: false, isToday: false, dotColors: [] },
  { label: 'S', date: 21, isRest: false, isToday: false, dotColors: [] },
]

const ACTIVE_WEEK: WeekDay[] = [
  { label: 'M', date: 15, workoutLabel: 'Pull', isRest: false, isToday: false, dotColors: ['#84cc16', '#ef4444'] },
  { label: 'T', date: 16, workoutLabel: 'Push', isRest: false, isToday: false, dotColors: ['#ef4444', '#84cc16'] },
  { label: 'W', date: 17, workoutLabel: 'Full', isRest: false, isToday: true, dotColors: ['#3b82f6'] },
  { label: 'T', date: 18, workoutLabel: 'Leg', isRest: false, isToday: false, dotColors: ['#a855f7'] },
  { label: 'F', date: 19, isRest: true, isToday: false, dotColors: ['#60a5fa'] },
  { label: 'S', date: 20, workoutLabel: 'Upper', isRest: false, isToday: false, dotColors: ['#84cc16'] },
  { label: 'S', date: 21, isRest: true, isToday: false, dotColors: ['#60a5fa'] },
]

const REST_WEEK: WeekDay[] = [
  { label: 'M', date: 15, workoutLabel: 'Pull', isRest: false, isToday: false, dotColors: ['#84cc16'] },
  { label: 'T', date: 16, workoutLabel: 'Push', isRest: false, isToday: false, dotColors: ['#84cc16', '#ef4444'] },
  { label: 'W', date: 17, workoutLabel: 'Full', isRest: false, isToday: false, dotColors: ['#3b82f6'] },
  { label: 'T', date: 18, workoutLabel: 'Leg', isRest: false, isToday: false, dotColors: ['#a855f7'] },
  { label: 'F', date: 19, isRest: true, isToday: true, dotColors: ['#60a5fa'] },
  { label: 'S', date: 20, workoutLabel: 'Upper', isRest: false, isToday: false, dotColors: ['#84cc16'] },
  { label: 'S', date: 21, isRest: true, isToday: false, dotColors: ['#60a5fa'] },
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
