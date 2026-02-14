import type { FitnessGoal, Gender, HeightUnit, WeightUnit } from '@/types/profile'
import { FITNESS_GOALS, GENDERS } from '@/types/profile'

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
