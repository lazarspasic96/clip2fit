import type { HeatmapDay, WorkoutCategory } from '@/types/heatmap'
import { CATEGORY_COLORS } from '@/types/heatmap'
import { Colors } from '@/constants/colors'

export interface GridCell {
  date: string
  count: number
  categories: WorkoutCategory[]
}

export interface WeekColumn {
  cells: GridCell[]
}

const toDateString = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Build a full grid of weeks x 7 days for the given period.
 * Fills gaps with empty cells.
 */
export const buildHeatmapGrid = (
  days: HeatmapDay[],
  weeksBack = 52,
): WeekColumn[] => {
  const dayMap = new Map<string, HeatmapDay>()
  for (const day of days) {
    dayMap.set(day.date, day)
  }

  const today = new Date()
  const todayDow = today.getDay()

  // Start from the Monday `weeksBack` weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - todayDow - (weeksBack - 1) * 7 + 1)

  // Adjust to Monday (getDay() returns 0=Sun)
  if (start.getDay() !== 1) {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  }

  const weeks: WeekColumn[] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const cells: GridCell[] = []

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dateStr = toDateString(cursor)
      const existing = dayMap.get(dateStr)

      if (cursor <= today) {
        cells.push({
          date: dateStr,
          count: existing?.count ?? 0,
          categories: existing?.categories ?? [],
        })
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    if (cells.length > 0) {
      weeks.push({ cells })
    }
  }

  return weeks
}

/**
 * Pick the dominant category color for a cell.
 * No categories -> muted background.
 */
export const getCellColor = (categories: WorkoutCategory[]): string => {
  if (categories.length === 0) return Colors.background.secondary
  return CATEGORY_COLORS[categories[0]]
}

/**
 * Get secondary color for multi-category cells (border ring).
 */
export const getSecondaryColor = (categories: WorkoutCategory[]): string | null => {
  if (categories.length < 2) return null
  return CATEGORY_COLORS[categories[1]]
}
