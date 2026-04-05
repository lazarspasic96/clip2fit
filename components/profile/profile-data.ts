import type { LucideIcon } from 'lucide-react-native'
import {
  Activity,
  CalendarDays,
  ChartColumn,
  Clock3,
  Dumbbell,
  HeartPulse,
  LogOut,
  MapPin,
  Ruler,
  Scale,
  ShieldAlert,
  Target,
  Trash2,
  UserRound,
} from 'lucide-react-native'

import type { UserProfile } from '@/types/profile'
import {
  EXPERIENCE_LEVELS,
} from '@/types/profile'
import {
  displayActivityLevel,
  displayEquipment,
  displayExperience,
  displayFocusAreas,
  displayGender,
  displayGoal,
  displayInjuries,
  displayLocation,
  displaySchedule,
  displayTrainingStyles,
  formatDateOfBirth,
  formatHeight,
  formatWeight,
} from '@/utils/format-profile'

export type ProfileActionKey =
  | 'stats'
  | 'name'
  | 'gender'
  | 'dob'
  | 'height'
  | 'weight'
  | 'goal'
  | 'experience'
  | 'activity'
  | 'location'
  | 'equipment'
  | 'schedule'
  | 'styles'
  | 'focus'
  | 'injuries'
  | 'delete-account'
  | 'sign-out'

type ProfileActionTone = 'default' | 'accent' | 'danger'

export interface ProfileActionItem {
  key: ProfileActionKey
  label: string
  value: string
  description: string
  icon: LucideIcon
  tone: ProfileActionTone
  route?: string
}

export interface ProfileSection {
  key: string
  title: string
  eyebrow: string
  items: ProfileActionItem[]
}

export interface ProfileScreenModel {
  displayName: string
  email: string
  initials: string
  goalValue: string
  scheduleValue: string
  locationValue: string
  sections: ProfileSection[]
  accountActions: ProfileActionItem[]
}

const DEFAULT_VALUE = 'Not set'

const getInitials = (name?: string, email?: string): string => {
  if (name === undefined || name.trim().length === 0) {
    const emailInitial = email?.trim()[0]?.toUpperCase()
    return emailInitial ?? 'C'
  }
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'C'
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

const withFallback = (value?: string): string => {
  if (value === undefined) return DEFAULT_VALUE
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : DEFAULT_VALUE
}

const toneForValue = (value?: string): ProfileActionTone =>
  value !== undefined && value.trim().length > 0 ? 'accent' : 'default'

export const buildProfileScreenModel = ({
  profile,
  email,
}: {
  profile: UserProfile | null
  email?: string
}): ProfileScreenModel => {
  const goal = displayGoal(profile?.fitnessGoal)
  const experience = displayExperience(profile?.experienceLevel)
  const activity = displayActivityLevel(profile?.activityLevel)
  const schedule = displaySchedule(profile?.trainingFrequency, profile?.sessionDuration)
  const location = displayLocation(profile?.workoutLocation)
  const focusAreas = displayFocusAreas(profile?.focusAreas)
  const trainingStyles = displayTrainingStyles(profile?.trainingStyles)
  const equipment = displayEquipment(profile?.equipment)
  const injuries = displayInjuries(profile?.injuries)
  const gender = displayGender(profile?.gender)
  const dateOfBirth = formatDateOfBirth(profile?.dateOfBirth)
  const height = formatHeight(profile?.height, profile?.heightUnit)
  const weight = formatWeight(profile?.weight, profile?.weightUnit)

  const experienceLabel =
    profile?.experienceLevel !== undefined
      ? EXPERIENCE_LEVELS.find((item) => item.value === profile.experienceLevel)?.subtitle
      : undefined

  const actions: Record<Exclude<ProfileActionKey, 'sign-out'>, ProfileActionItem> = {
    stats: {
      key: 'stats',
      label: 'Stats',
      value: 'Progress and PRs',
      description: 'Review trends, exercise history, and streaks.',
      icon: ChartColumn,
      tone: 'accent',
      route: '/(protected)/stats',
    },
    name: {
      key: 'name',
      label: 'Name',
      value: withFallback(profile?.fullName),
      description: 'How you show up around the app.',
      icon: UserRound,
      tone: toneForValue(profile?.fullName),
      route: '/(protected)/sheets/edit-name',
    },
    gender: {
      key: 'gender',
      label: 'Gender',
      value: withFallback(gender),
      description: 'Used for a more personal profile.',
      icon: UserRound,
      tone: toneForValue(gender),
      route: '/(protected)/sheets/edit-gender',
    },
    dob: {
      key: 'dob',
      label: 'Date of Birth',
      value: withFallback(dateOfBirth),
      description: 'Your age and birthday details.',
      icon: CalendarDays,
      tone: toneForValue(dateOfBirth),
      route: '/(protected)/sheets/edit-date-of-birth',
    },
    height: {
      key: 'height',
      label: 'Height',
      value: withFallback(height),
      description: 'Used in plans and progress context.',
      icon: Ruler,
      tone: toneForValue(height),
      route: '/(protected)/sheets/edit-height',
    },
    weight: {
      key: 'weight',
      label: 'Weight',
      value: withFallback(weight),
      description: 'Bodyweight tracking baseline.',
      icon: Scale,
      tone: toneForValue(weight),
      route: '/(protected)/sheets/edit-weight',
    },
    goal: {
      key: 'goal',
      label: 'Fitness Goal',
      value: withFallback(goal),
      description: 'What your training should optimize for.',
      icon: Target,
      tone: toneForValue(goal),
      route: '/(protected)/sheets/edit-fitness-goal',
    },
    experience: {
      key: 'experience',
      label: 'Experience Level',
      value: withFallback(experience),
      description: experienceLabel ?? 'Your current training familiarity.',
      icon: ChartColumn,
      tone: toneForValue(experience),
      route: '/(protected)/sheets/edit-experience',
    },
    activity: {
      key: 'activity',
      label: 'Activity Level',
      value: withFallback(activity),
      description: 'How active you are outside the gym.',
      icon: Activity,
      tone: toneForValue(activity),
      route: '/(protected)/sheets/edit-activity-level',
    },
    location: {
      key: 'location',
      label: 'Workout Location',
      value: withFallback(location),
      description: 'Home, gym, both, or outdoors.',
      icon: MapPin,
      tone: toneForValue(location),
      route: '/(protected)/sheets/edit-workout-location',
    },
    equipment: {
      key: 'equipment',
      label: 'Equipment',
      value: withFallback(equipment),
      description: 'What gear you have available.',
      icon: Dumbbell,
      tone: toneForValue(equipment),
      route: '/(protected)/sheets/edit-equipment',
    },
    schedule: {
      key: 'schedule',
      label: 'Schedule',
      value: withFallback(schedule),
      description: 'Weekly frequency and session duration.',
      icon: Clock3,
      tone: toneForValue(schedule),
      route: '/(protected)/sheets/edit-schedule',
    },
    styles: {
      key: 'styles',
      label: 'Training Styles',
      value: withFallback(trainingStyles),
      description: 'The methods you like to train with.',
      icon: Activity,
      tone: toneForValue(trainingStyles),
      route: '/(protected)/sheets/edit-training-style',
    },
    focus: {
      key: 'focus',
      label: 'Focus Areas',
      value: withFallback(focusAreas),
      description: 'Muscle groups and priorities.',
      icon: HeartPulse,
      tone: toneForValue(focusAreas),
      route: '/(protected)/sheets/edit-focus-areas',
    },
    injuries: {
      key: 'injuries',
      label: 'Injuries',
      value: withFallback(injuries),
      description: 'Flags any limitations that affect programming.',
      icon: ShieldAlert,
      tone: toneForValue(injuries),
      route: '/(protected)/sheets/edit-injuries',
    },
    'delete-account': {
      key: 'delete-account',
      label: 'Delete Account',
      value: 'Permanent action',
      description: 'Remove your account and data.',
      icon: Trash2,
      tone: 'danger',
      route: '/(protected)/sheets/delete-account',
    },
  }

  const emailName = email?.split('@')[0]?.trim()
  const displayName = profile?.fullName?.trim() || emailName || 'Your Profile'
  return {
    displayName,
    email: withFallback(email),
    initials: getInitials(profile?.fullName, email),
    goalValue: withFallback(goal),
    scheduleValue: withFallback(schedule),
    locationValue: withFallback(location),
    sections: [
      {
        key: 'identity',
        title: 'Identity',
        eyebrow: 'Personal info',
        items: [actions.name, actions.gender, actions.dob],
      },
      {
        key: 'body',
        title: 'Body metrics',
        eyebrow: 'Measurements',
        items: [actions.height, actions.weight],
      },
      {
        key: 'training',
        title: 'Training profile',
        eyebrow: 'Foundation',
        items: [actions.goal, actions.experience, actions.activity],
      },
      {
        key: 'setup',
        title: 'Workout setup',
        eyebrow: 'Preferences',
        items: [actions.location, actions.equipment, actions.schedule, actions.styles, actions.focus, actions.injuries],
      },
    ],
    accountActions: [
      {
        key: 'sign-out',
        label: 'Sign Out',
        value: 'End session',
        description: 'Log out of your account on this device.',
        icon: LogOut,
        tone: 'default',
      },
      actions['delete-account'],
    ],
  }
}
