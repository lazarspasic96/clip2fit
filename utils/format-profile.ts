import type {
  ActivityLevel,
  Equipment,
  ExperienceLevel,
  FitnessGoal,
  FocusArea,
  Gender,
  HeightUnit,
  InjuryTag,
  TrainingStyle,
  WeightUnit,
  WorkoutLocation,
} from '@/types/profile'
import {
  ACTIVITY_LEVELS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  FITNESS_GOALS,
  FOCUS_AREAS,
  GENDERS,
  INJURY_TAGS,
  TRAINING_STYLES,
  WORKOUT_LOCATIONS,
} from '@/types/profile'
import { formatDobDisplay, formatDobIso } from '@/utils/dob-date'

export const displayGender = (gender?: Gender): string | undefined => {
  if (gender === undefined) return undefined
  return GENDERS.find((g) => g.value === gender)?.label
}

export const displayGoal = (goal?: FitnessGoal): string | undefined => {
  if (goal === undefined) return undefined
  return FITNESS_GOALS.find((g) => g.value === goal)?.label
}

export const inchesToFeetInches = (totalInches: number): { feet: number; inches: number } => {
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

export const feetInchesToInches = (feet: number, inches: number): number =>
  feet * 12 + inches

export const formatHeight = (height?: number, unit?: HeightUnit): string | undefined => {
  if (height === undefined || unit === undefined) return undefined
  if (unit === 'cm') return `${height} cm`
  const { feet, inches } = inchesToFeetInches(height)
  return `${feet}'${inches}"`
}

export const formatWeight = (weight?: number, unit?: WeightUnit): string | undefined => {
  if (weight === undefined || unit === undefined) return undefined
  return `${weight} ${unit}`
}

export const formatDateOfBirth = (dob?: string | Date): string | undefined => {
  if (dob === undefined) return undefined
  if (dob instanceof Date) return formatDobDisplay(formatDobIso(dob))
  return formatDobDisplay(dob)
}

export const displayExperience = (level?: ExperienceLevel): string | undefined => {
  if (level === undefined) return undefined
  return EXPERIENCE_LEVELS.find((l) => l.value === level)?.label
}

export const displayActivityLevel = (level?: ActivityLevel): string | undefined => {
  if (level === undefined) return undefined
  return ACTIVITY_LEVELS.find((l) => l.value === level)?.label
}

export const displayLocation = (location?: WorkoutLocation): string | undefined => {
  if (location === undefined) return undefined
  return WORKOUT_LOCATIONS.find((l) => l.value === location)?.label
}

const formatList = (labels: string[], max: number): string => {
  if (labels.length <= max) return labels.join(', ')
  return `${labels.length} items`
}

export const displayEquipment = (equipment?: Equipment[]): string | undefined => {
  if (equipment === undefined || equipment.length === 0) return undefined
  const labels = equipment.map((e) => EQUIPMENT_OPTIONS.find((o) => o.value === e)?.label ?? e)
  return formatList(labels, 2)
}

export const displaySchedule = (freq?: number, dur?: number): string | undefined => {
  if (freq === undefined && dur === undefined) return undefined
  const parts: string[] = []
  if (freq !== undefined) parts.push(`${freq}x / week`)
  if (dur !== undefined) parts.push(`${dur} min`)
  return parts.join(', ')
}

export const displayTrainingStyles = (styles?: TrainingStyle[]): string | undefined => {
  if (styles === undefined || styles.length === 0) return undefined
  const labels = styles.map((s) => TRAINING_STYLES.find((o) => o.value === s)?.label ?? s)
  return formatList(labels, 2)
}

export const displayFocusAreas = (areas?: FocusArea[]): string | undefined => {
  if (areas === undefined || areas.length === 0) return undefined
  const labels = areas.map((a) => FOCUS_AREAS.find((o) => o.value === a)?.label ?? a)
  return formatList(labels, 2)
}

export const displayInjuries = (injuries?: InjuryTag[]): string | undefined => {
  if (injuries === undefined || injuries.length === 0) return undefined
  const filtered = injuries.filter((i) => i !== 'none')
  if (filtered.length === 0) return 'None'
  const labels = filtered.map((i) => INJURY_TAGS.find((o) => o.value === i)?.label ?? i)
  return formatList(labels, 2)
}

