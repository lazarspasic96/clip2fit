import { subMonths, startOfMonth, startOfWeek, format, isAfter, isBefore, differenceInDays, addDays } from 'date-fns'

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
const buildDayLookup = (days: HeatmapDay[]): Map<string, HeatmapDay> => {
  const map = new Map<string, HeatmapDay>()
  for (const day of days) {
    map.set(day.date, day)
  }
  return map
}

const buildDateRange = (): { rangeStart: Date; today: Date } => {
  const today = new Date()
  const rangeStart = startOfMonth(subMonths(today, 11))
  return { rangeStart, today }
}

const toGridCell = (dateStr: string, dayMap: Map<string, HeatmapDay>): GridCell => {
  const existing = dayMap.get(dateStr)
  return {
    date: dateStr,
    count: existing?.count ?? 0,
    categories: existing?.categories ?? [],
  }
}

export const buildHeatmapGrid = (days: HeatmapDay[]): WeekColumn[] => {
  const dayMap = buildDayLookup(days)
  const { rangeStart, today } = buildDateRange()
  const gridStart = startOfWeek(rangeStart, { weekStartsOn: 0 })
  const totalWeeks = Math.ceil((differenceInDays(today, gridStart) + 1) / 7)

  const weeks: WeekColumn[] = []

  for (let w = 0; w < totalWeeks; w++) {
    const cells: GridCell[] = []

    for (let d = 0; d < 7; d++) {
      const date = addDays(gridStart, w * 7 + d)
      if (isBefore(date, rangeStart)) continue
      if (isAfter(date, today)) break

      cells.push(toGridCell(format(date, 'yyyy-MM-dd'), dayMap))
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
