import { MUSCLE_GROUP_LABELS } from '@/types/catalog'
import {
  CATEGORY_COLORS,
  type MuscleCategory,
  FULL_BODY_COLOR,
  MUSCLE_CATEGORY_LABELS,
  MUSCLE_GROUP_COLORS,
  type MuscleGroupKey,
  MUSCLE_GROUP_TO_CATEGORY,
} from '@/constants/muscle-colors'

type MuscleChipTone = 'soft' | 'solid' | 'ghost'

const toSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const GROUP_ALIASES: Record<string, MuscleGroupKey> = {
  abs: 'abdominals',
  abdominal: 'abdominals',
  abdominals: 'abdominals',
  abductor: 'abductors',
  abductors: 'abductors',
  adductor: 'adductors',
  adductors: 'adductors',
  bicep: 'biceps',
  biceps: 'biceps',
  calf: 'calves',
  calves: 'calves',
  chest: 'chest',
  pectorals: 'chest',
  pectoral: 'chest',
  forearm: 'forearms',
  forearms: 'forearms',
  glute: 'glutes',
  glutes: 'glutes',
  hamstring: 'hamstrings',
  hamstrings: 'hamstrings',
  lat: 'lats',
  lats: 'lats',
  latissimus: 'lats',
  lower_back: 'lower_back',
  low_back: 'lower_back',
  spine: 'lower_back',
  middle_back: 'middle_back',
  mid_back: 'middle_back',
  upper_back: 'middle_back',
  neck: 'neck',
  levator_scapulae: 'neck',
  quad: 'quadriceps',
  quads: 'quadriceps',
  quadricep: 'quadriceps',
  quadriceps: 'quadriceps',
  shoulder: 'shoulders',
  shoulders: 'shoulders',
  delts: 'shoulders',
  deltoids: 'shoulders',
  serratus_anterior: 'chest',
  trap: 'traps',
  traps: 'traps',
  trapezius: 'traps',
  tricep: 'triceps',
  triceps: 'triceps',
}

const CATEGORY_ALIASES: Record<string, MuscleCategory> = {
  arm: 'arms',
  arms: 'arms',
  back: 'back',
  chest: 'chest',
  core: 'core',
  full_body: 'full_body',
  fullbody: 'full_body',
  leg: 'legs',
  legs: 'legs',
  shoulder: 'shoulders',
  shoulders: 'shoulders',
}

const formatFallbackLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const parseHex = (hex: string): [number, number, number] | null => {
  const raw = hex.trim().replace('#', '')
  if (raw.length !== 6) return null

  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  if ([r, g, b].some((value) => Number.isNaN(value))) return null
  return [r, g, b]
}

const toRgba = (hex: string, alpha: number): string => {
  const rgb = parseHex(hex)
  if (rgb === null) return hex
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

const getContrastTextColor = (hex: string): string => {
  const rgb = parseHex(hex)
  if (rgb === null) return '#09090b'

  const [r, g, b] = rgb
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.56 ? '#09090b' : '#fafafa'
}

export const normalizeMuscleGroup = (raw: string | null | undefined): MuscleGroupKey | null => {
  if (raw === null || raw === undefined) return null
  const normalized = toSlug(raw)
  if (normalized.length === 0) return null
  return GROUP_ALIASES[normalized] ?? null
}

export const normalizeMuscleCategory = (raw: string | null | undefined): MuscleCategory | null => {
  if (raw === null || raw === undefined) return null
  const normalized = toSlug(raw)
  if (normalized.length === 0) return null
  return CATEGORY_ALIASES[normalized] ?? null
}

export const getMuscleCategory = (raw: string | null | undefined): MuscleCategory | null => {
  const group = normalizeMuscleGroup(raw)
  if (group !== null) return MUSCLE_GROUP_TO_CATEGORY[group]
  return normalizeMuscleCategory(raw)
}

export const getMuscleColor = (raw: string | null | undefined): string => {
  const group = normalizeMuscleGroup(raw)
  if (group !== null) return MUSCLE_GROUP_COLORS[group]

  const category = normalizeMuscleCategory(raw)
  if (category !== null) return CATEGORY_COLORS[category]

  return FULL_BODY_COLOR
}

export const getMuscleLabel = (raw: string | null | undefined): string => {
  if (raw === null || raw === undefined || raw.trim().length === 0) return 'Unknown'

  const group = normalizeMuscleGroup(raw)
  if (group !== null) return MUSCLE_GROUP_LABELS[group] ?? formatFallbackLabel(group)

  const category = normalizeMuscleCategory(raw)
  if (category !== null) return MUSCLE_CATEGORY_LABELS[category]

  return formatFallbackLabel(raw)
}

export const getMuscleChipColors = (raw: string | null | undefined, tone: MuscleChipTone = 'soft') => {
  const color = getMuscleColor(raw)

  if (tone === 'solid') {
    return {
      backgroundColor: color,
      borderColor: toRgba(color, 0.95),
      textColor: getContrastTextColor(color),
    }
  }

  if (tone === 'ghost') {
    return {
      backgroundColor: 'transparent',
      borderColor: toRgba(color, 0.5),
      textColor: color,
    }
  }

  return {
    backgroundColor: toRgba(color, 0.14),
    borderColor: toRgba(color, 0.35),
    textColor: color,
  }
}
