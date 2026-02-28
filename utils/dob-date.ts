import {
  differenceInYears,
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
  startOfDay,
  subYears,
} from 'date-fns'

const DOB_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DOB_ISO_FORMAT = 'yyyy-MM-dd'
const DOB_DISPLAY_FORMAT = 'MMM d, yyyy'
const MIN_AGE = 13
const MAX_AGE = 120

export type DobIsoDate = string & { readonly __brand: 'DobIsoDate' }

export const dobMinDate = (referenceDate: Date = new Date()): Date =>
  subYears(startOfDay(referenceDate), MAX_AGE)

export const dobMaxDate = (referenceDate: Date = new Date()): Date =>
  subYears(startOfDay(referenceDate), MIN_AGE)

export const clampDobDate = (candidate: Date, referenceDate: Date = new Date()): Date => {
  const minDate = dobMinDate(referenceDate)
  const maxDate = dobMaxDate(referenceDate)

  if (isBefore(candidate, minDate)) return minDate
  if (isAfter(candidate, maxDate)) return maxDate
  return candidate
}

export const formatDobIso = (date: Date): DobIsoDate =>
  format(startOfDay(date), DOB_ISO_FORMAT) as DobIsoDate

export const parseDobIso = (value: string): Date | null => {
  if (!DOB_ISO_REGEX.test(value)) return null

  const parsed = parse(value, DOB_ISO_FORMAT, new Date())
  if (!isValid(parsed)) return null
  if (format(parsed, DOB_ISO_FORMAT) !== value) return null

  return startOfDay(parsed)
}

export const isDobIsoDate = (value: string): value is DobIsoDate => parseDobIso(value) !== null

export const formatDobDisplay = (dob?: string): string | undefined => {
  if (dob === undefined) return undefined
  const parsed = parseDobIso(dob)
  if (parsed === null) return undefined
  return format(parsed, DOB_DISPLAY_FORMAT)
}

export const dobAge = (dob: string, referenceDate: Date = new Date()): number => {
  const parsed = parseDobIso(dob)
  if (parsed === null) return Number.NaN
  return differenceInYears(startOfDay(referenceDate), parsed)
}

export const isDobInAllowedRange = (dob: string, referenceDate: Date = new Date()): boolean => {
  const parsed = parseDobIso(dob)
  if (parsed === null) return false

  const minDate = dobMinDate(referenceDate)
  const maxDate = dobMaxDate(referenceDate)
  return !isBefore(parsed, minDate) && !isAfter(parsed, maxDate)
}
