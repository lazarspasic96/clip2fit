import { subMonths, startOfMonth, startOfWeek, format, isAfter, isBefore } from 'date-fns'

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

/**
 * Build a grid covering exactly 12 months (1st of month 11 months ago → today).
 * Columns = weeks (Sun–Sat). First/last columns may be partial.
 */
export const buildHeatmapGrid = (days: HeatmapDay[]): WeekColumn[] => {
  const dayMap = new Map<string, HeatmapDay>()
  for (const day of days) {
    dayMap.set(day.date, day)
  }

  const today = new Date()
  // 11 months back from today's month → gives us 12 months inclusive
  const rangeStart = startOfMonth(subMonths(today, 11))
  // Align to the Sunday on or before rangeStart
  const gridStart = startOfWeek(rangeStart, { weekStartsOn: 0 })

  const weeks: WeekColumn[] = []
  const cursor = new Date(gridStart)

  while (!isAfter(cursor, today)) {
    const cells: GridCell[] = []

    for (let dow = 0; dow < 7; dow++) {
      // Skip days before range start (partial first week)
      if (isBefore(cursor, rangeStart)) {
        cursor.setDate(cursor.getDate() + 1)
        continue
      }
      if (isAfter(cursor, today)) break

      const dateStr = format(cursor, 'yyyy-MM-dd')
      const existing = dayMap.get(dateStr)

      cells.push({
        date: dateStr,
        count: existing?.count ?? 0,
        categories: existing?.categories ?? [],
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    if (cells.length > 0) {
      weeks.push({ cells })
    }
  }

  return weeks
}

/**
 * Get month label positions for the grid.
 * Places a label at the first week where a new month starts.
 * Skips labels that are too close together to prevent overlap.
 */
export const getMonthLabels = (
  weeks: WeekColumn[],
): { label: string; weekIndex: number }[] => {
  const labels: { label: string; weekIndex: number }[] = []
  let lastMonth = -1
  let lastWeekIndex = -Infinity
  const MIN_WEEK_GAP = 3

  for (let i = 0; i < weeks.length; i++) {
    const firstCell = weeks[i].cells[0]
    if (firstCell === undefined) continue

    const month = parseInt(firstCell.date.split('-')[1], 10) - 1
    if (month !== lastMonth) {
      if (i - lastWeekIndex >= MIN_WEEK_GAP) {
        const date = new Date(firstCell.date + 'T00:00:00')
        labels.push({ label: format(date, 'MMM'), weekIndex: i })
        lastWeekIndex = i
      }
      lastMonth = month
    }
  }

  return labels
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
