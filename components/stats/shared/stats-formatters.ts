export const formatCompactNumber = (value: number) =>
  Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatDurationLabel = (seconds: number) => {
  if (seconds <= 0) return '0m'
  const minutes = Math.round(seconds / 60)
  return `${minutes}m`
}

