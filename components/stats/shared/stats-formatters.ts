import { parseUtcInstantMs } from '@/types/stats'

export const formatCompactNumber = (value: number) =>
  Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatDurationLabel = (seconds: number) => {
  if (seconds <= 0) return '0m'
  const minutes = Math.round(seconds / 60)
  return `${minutes}m`
}

export const formatInstantDate = (value: string): string => {
  const timestamp = parseUtcInstantMs(value)
  if (!Number.isFinite(timestamp)) return 'N/A'
  return new Date(timestamp).toLocaleDateString()
}

export const formatWeight = (value: number): string =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1)

