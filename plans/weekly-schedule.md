# Weekly Workout Schedule — Implementation Spec

## Context

Home screen `WeeklyTrainingPlan` uses hardcoded mock data (`PLACEHOLDER_WEEK`). This adds a real scheduling system: Drizzle schema + API endpoints in the backend repo, a dedicated Schedule tab with 3 swappable design variants, and wires the home screen to real data.

**Decisions locked:**
- One workout per day, 7 days (Mon-Sun), auto-save per change
- Reference (FK) — not snapshot. Editing a workout propagates to all scheduled days
- Home fallback: empty state when no schedule for today (no latest-workout fallback)
- Deleted workout silently becomes unassigned (no warning state)
- "Start Workout" from Home only — Schedule tab is planning-only
- Picker shows day badges on workouts already assigned to other days
- Organic discovery — no onboarding prompt for schedule
- 3 design variants (Stack / Calendar / Grid) with visible segmented control, separate files, no transition animation
- Full backend implementation (Drizzle + routes) included in plan
- Success feedback: green checkmark flash on row after save
- Stats card at top: training/rest day counts + muscle coverage from workout-level `targetMuscles`
- Fixed header (title + toggle + stats), scrollable day rows below
- Picker sorted most-recent-first (matches Library)

---

## Phase 0: Backend — Schema & API

Backend repo: `/Users/lazarspasic/git/clip2fit-api/src`

### 0A — Drizzle schema: `src/lib/db/schema.ts`

Add `weeklySchedules` table + relations to existing schema file:

```typescript
export const weeklySchedules = pgTable('weekly_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  dayOfWeek: smallint('day_of_week').notNull(), // 0=Mon, 6=Sun
  workoutId: uuid('workout_id').references(() => workouts.id, { onDelete: 'set null' }),
  isRestDay: boolean('is_rest_day').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueUserDay: unique().on(table.userId, table.dayOfWeek),
  checkDayRange: check('chk_day_range', sql`${table.dayOfWeek} >= 0 AND ${table.dayOfWeek} <= 6`),
  checkRestOrWorkout: check('chk_rest_or_workout', sql`NOT (${table.workoutId} IS NOT NULL AND ${table.isRestDay} = true)`),
}))
```

Add relations:
```typescript
export const weeklySchedulesRelations = relations(weeklySchedules, ({ one }) => ({
  user: one(profiles, { fields: [weeklySchedules.userId], references: [profiles.id] }),
  workout: one(workouts, { fields: [weeklySchedules.workoutId], references: [workouts.id] }),
}))
```

Add to existing `workoutsRelations`: `scheduleEntries: many(weeklySchedules)`
Add to existing `profilesRelations`: `scheduleEntries: many(weeklySchedules)`

### 0B — Zod validation: `src/lib/validations.ts`

```typescript
export const scheduleEntrySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  workout_id: z.string().uuid().nullable(),
  is_rest_day: z.boolean(),
}).refine(
  (d) => !(d.workout_id !== null && d.is_rest_day),
  { message: 'Cannot assign workout and rest day simultaneously' }
)

export const upsertScheduleSchema = z.object({
  entries: z.array(scheduleEntrySchema).length(7)
    .refine(
      (entries) => new Set(entries.map(e => e.day_of_week)).size === 7,
      { message: 'Must include exactly one entry per day (0-6)' }
    ),
})
```

### 0C — Route: `src/app/api/schedules/route.ts`

**GET** — fetch user's schedule with joined workouts:
```
1. getAuthUser(request) → 401 if null
2. db.query.weeklySchedules.findMany({
     where: eq(weeklySchedules.userId, user.id),
     with: { workout: { with: { exercises: { orderBy: [asc(exercises.order)] } } } },
     orderBy: [asc(weeklySchedules.dayOfWeek)]
   })
3. Return 200 with array (may be 0-7 items)
```

**PUT** — bulk upsert all 7 days:
```
1. getAuthUser(request) → 401 if null
2. Parse + validate body with upsertScheduleSchema → 400 if invalid
3. db.transaction(async (tx) => {
     // Delete existing schedule rows for user
     tx.delete(weeklySchedules).where(eq(weeklySchedules.userId, user.id))
     // Insert 7 new rows
     tx.insert(weeklySchedules).values(entries.map(e => ({
       userId: user.id,
       dayOfWeek: e.day_of_week,
       workoutId: e.workout_id,
       isRestDay: e.is_rest_day,
     })))
   })
4. Re-query with workout joins (same as GET)
5. Return 200
```

Using delete+insert in transaction instead of upsert — simpler and atomic.

### 0D — Drizzle migration

Run `npx drizzle-kit generate` then `npx drizzle-kit migrate` in the backend repo.

---

## Phase 1: Mobile — Types & Data Layer

### 1A — New file: `types/schedule.ts`

```typescript
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// Relocated from utils/mock-data.ts
export type DayStatus = 'completed' | 'skipped' | 'active' | 'activeRest' | 'future' | 'rest'
export type WeekDay = { label: string; date: number; workoutLabel?: string; status: DayStatus }

// API response (snake_case)
export interface ApiScheduleEntry {
  id: string
  day_of_week: DayOfWeek
  workout_id: string | null
  is_rest_day: boolean
  workout: ApiWorkout | null  // joined
  created_at: string
  updated_at: string
}

// Frontend (camelCase)
export interface ScheduleEntry {
  dayOfWeek: DayOfWeek
  workoutId: string | null
  isRestDay: boolean
  workout: WorkoutPlan | null
}

export interface WeeklySchedule {
  entries: ScheduleEntry[]  // always 7 items, index = dayOfWeek
}

export interface UpsertSchedulePayload {
  entries: Array<{ day_of_week: DayOfWeek; workout_id: string | null; is_rest_day: boolean }>
}
```

Mapper: `mapApiScheduleEntry()` → camelCase + `mapApiWorkout()` for nested workout.

Update imports in: `day-card.tsx`, `status-indicator.tsx`, `weekly-training-plan.tsx`, `index.tsx` (home screen).

### 1B — Add `apiPut` to `utils/api.ts`

Same pattern as `apiPatch` (line 62-70), `method: 'PUT'`.

### 1C — Extend `constants/query-keys.ts`

Add: `schedule: { current: ['schedule'] as const }`

### 1D — New file: `hooks/use-schedule.ts`

```typescript
useScheduleQuery() → GET /api/schedules
  - Maps API entries to WeeklySchedule
  - Fills missing days with { workoutId: null, isRestDay: false, workout: null }
  - Always returns exactly 7 entries

useUpdateScheduleMutation() → PUT /api/schedules
  - Invalidates queryKeys.schedule.current on success
  - Returns updated schedule
```

### 1E — New file: `utils/schedule.ts`

```
DAY_LABELS: Record<DayOfWeek, string>        // Monday, Tuesday, ...
DAY_SHORT_LABELS: Record<DayOfWeek, string>  // Mon, Tue, ...
getTodayDayOfWeek(): DayOfWeek               // 0-6 (Mon=0)
buildEmptySchedule(): WeeklySchedule         // 7 unassigned entries
scheduleToPayload(schedule): UpsertSchedulePayload
buildWeekDaysFromSchedule(schedule): WeekDay[]  // for home screen calendar
getScheduleStats(schedule): { trainingDays: number, restDays: number, muscles: string[] }
```

`buildWeekDaysFromSchedule`: computes date numbers for current week, maps statuses (active/activeRest for today, rest for rest days, future for upcoming assigned days). MVP: no history, past days show as `future`.

`getScheduleStats`: counts assigned vs rest days, unions `targetMuscles` from all assigned workouts.

---

## Phase 2: Tab Bar → 3 Tabs + FAB

**New layout:** `[Home] [Schedule] [+FAB] [Library]`

### 2A — Modify `app/(protected)/(tabs)/_layout.tsx`

Add `schedule` screen between `index` and `my-workouts`.

### 2B — Modify `components/ui/custom-tab-bar.tsx`

- Import `CalendarDays` from lucide
- Add to TAB_CONFIG: `schedule: { icon: CalendarDays, label: 'Schedule' }`
- Rename: `'my-workouts'` label → `'Library'`
- Refactor render: dynamic loop over `state.routes`, insert FAB component after index 1
- 4-column flex layout: each tab + FAB gets equal flex space

---

## Phase 3: Schedule Screen — 3 Design Variants

### 3A — New file: `app/(protected)/(tabs)/schedule.tsx`

Main screen orchestrator:
- `useScheduleQuery()` + `useUpdateScheduleMutation()`
- `useWorkoutsQuery()` for picker data
- `useState<'stack' | 'calendar' | 'grid'>` for active design (default: `'stack'`)
- `useState<DayOfWeek | null>` for selectedDay (bottom sheet context)

**Layout (fixed + scrollable):**
```
[SafeArea top padding]
[Header: "My Schedule" title]
[Segmented Control: Stack | Calendar | Grid]  ← fixed
[Stats Card]                                   ← fixed
[--- scrollable area ---]
  [Design-specific day rows content]
[--- end scrollable ---]
[TAB_BAR_HEIGHT bottom padding]
```

Handles: `handleAssignWorkout(day, workoutId, isRestDay)` → optimistic local update + mutation → green checkmark flash → revert on error with toast.

### 3B — New file: `components/schedule/schedule-segmented-control.tsx`

3-segment toggle: Stack / Calendar / Grid
- Dark background pills, active segment = `bg-brand-accent` with dark text
- Props: `activeLayout`, `onLayoutChange`

### 3C — New file: `components/schedule/schedule-stats-card.tsx`

Stats card showing:
- Left: "X training days" + "Y rest days" with colored dots
- Right: muscle group pills (from `getScheduleStats`), max 4-5 visible + "+N more"
- Compact single-row card, `bg-background-secondary` with border

### 3D — Design A: `components/schedule/layouts/stack-layout.tsx`

**"Stack" — Vertical card list**
- 7 `ScheduleDayRow` cards stacked vertically in ScrollView
- Each card: full-width, shows day name (bold) + date, workout details or empty/rest state
- **Assigned**: solid card, green left accent bar (4px), workout title + muscle pills + duration
- **Rest**: blue-tinted card, moon icon, "Rest Day"
- **Unassigned**: dashed border, plus icon, "Tap to assign"
- **Today highlight**: `border-brand-logo` border
- Entering: `FadeInUp.delay(index * 50).springify()`
- Green checkmark flash: Reanimated opacity animation on save success

### 3E — Design B: `components/schedule/layouts/calendar-layout.tsx`

**"Calendar" — Horizontal week strip + detail card below**
- Top: horizontal row of 7 compact day cells (like home screen DayCard but larger, ~48x64)
  - Each cell: day letter + date number + status dot
  - Active/selected cell: brand-accent background, white text
  - Tap cell to select day
- Below: large detail card for the selected day
  - Shows full workout info (title, description preview, exercise count, duration, muscles)
  - Or rest day info
  - Or empty state with "Assign Workout" button
- Selected day card is the interaction target (tap to open picker/options)

### 3F — Design C: `components/schedule/layouts/grid-layout.tsx`

**"Grid" — 2-column compact grid**
- 2 columns, 4 rows (last row has 1 item centered or spanning)
- Each cell: compact square-ish card
  - Day name (abbreviated), workout title (truncated), colored accent by status
  - Tap to open picker/options
- Today's cell: highlighted border
- More compact, shows the whole week at a glance
- Uses `flexWrap: 'wrap'` or manual 2-col rows

### 3G — Shared: `components/schedule/schedule-day-row.tsx`

Reusable day row component used by Stack layout. Props:
```typescript
interface ScheduleDayRowProps {
  entry: ScheduleEntry
  dayOfWeek: DayOfWeek
  isToday: boolean
  onPress: () => void
  showCheckmark: boolean  // briefly true after successful save
  index: number           // for staggered animation delay
}
```

### 3H — New file: `components/schedule/workout-picker-sheet.tsx`

`BottomSheetModal` following `confirmation-sheet.tsx` pattern:
- Header: "Select Workout" + close X
- "Rest Day" option (moon icon, blue row)
- "Clear Assignment" option (if editing assigned day, red-tinted)
- Divider
- Search `TextInput` with magnifying glass icon
- `BottomSheetFlatList` of workouts from `useWorkoutsQuery()`
- Each item via `WorkoutPickerItem` — shows:
  - Title, muscle group pills, duration, difficulty badge
  - **Day badges**: small "M", "T", etc. pills showing which days this workout is already assigned to (derived from current schedule state passed as prop)
- Snap points: `['60%', '90%']`
- `expo-haptics` `impactAsync(Light)` on selection

### 3I — New file: `components/schedule/workout-picker-item.tsx`

Row in picker list:
```typescript
interface WorkoutPickerItemProps {
  workout: WorkoutPlan
  assignedDays: DayOfWeek[]  // days this workout is already scheduled
  isSelected: boolean         // currently assigned to the day being edited
  onSelect: () => void
}
```
Shows: title, muscle pills, duration, difficulty badge, day badges (small colored circles with day letters).

### 3J — New file: `components/schedule/day-options-sheet.tsx`

Simple action sheet for assigned/rest days:
- "Change Workout" → dismiss, open picker
- "Mark as Rest Day" (if assigned) → immediate mutation
- "Assign Workout" (if rest) → dismiss, open picker
- "Clear" → immediate mutation
- Haptic feedback per action

### 3K — New file: `components/schedule/empty-schedule-state.tsx`

When user has 0 workouts in library:
- Illustration or icon
- "Import your first workout to start planning"
- CTA button → navigates to add-workout

---

## Phase 4: Home Screen Integration

### 4A — Modify `app/(protected)/(tabs)/index.tsx`

- Remove `PLACEHOLDER_WEEK` constant and `WeekDay` import from mock-data
- Add `useScheduleQuery()` call
- Build `WeekDay[]` via `buildWeekDaysFromSchedule(schedule)`
- Pass to `<WeeklyTrainingPlan days={weekDays} />`
- Today's workout: `schedule.entries[getTodayDayOfWeek()]`
  - If has workout → show `TodaysWorkoutCard` with scheduled workout
  - If rest day → show nothing (or existing rest card if available)
  - If unassigned + no schedule at all → show `EmptyWorkoutCard`
  - If unassigned + has schedule → show empty state "No workout scheduled today"

### 4B — Modify `components/home/weekly-training-plan.tsx`

Wire "View" button to navigate to Schedule tab: `router.push('/(protected)/(tabs)/schedule')`

---

## Files Summary

### New files — Backend (`/Users/lazarspasic/git/clip2fit-api/src`)
| File | Purpose |
|---|---|
| `src/app/api/schedules/route.ts` | GET + PUT handlers |
| Schema addition in `src/lib/db/schema.ts` | `weeklySchedules` table + relations |
| Validation addition in `src/lib/validations.ts` | `scheduleEntrySchema`, `upsertScheduleSchema` |
| Drizzle migration (generated) | DDL for `weekly_schedules` table |

### New files — Mobile (15)
| File | Purpose |
|---|---|
| `types/schedule.ts` | All schedule types + relocated DayStatus/WeekDay |
| `hooks/use-schedule.ts` | useScheduleQuery, useUpdateScheduleMutation |
| `utils/schedule.ts` | Day labels, date math, schedule mappers, stats |
| `app/(protected)/(tabs)/schedule.tsx` | Schedule tab screen orchestrator |
| `components/schedule/schedule-segmented-control.tsx` | Stack/Calendar/Grid toggle |
| `components/schedule/schedule-stats-card.tsx` | Training/rest counts + muscle pills |
| `components/schedule/layouts/stack-layout.tsx` | Design A: vertical card list |
| `components/schedule/layouts/calendar-layout.tsx` | Design B: week strip + detail |
| `components/schedule/layouts/grid-layout.tsx` | Design C: 2-column grid |
| `components/schedule/schedule-day-row.tsx` | Shared day row component |
| `components/schedule/workout-picker-sheet.tsx` | Bottom sheet workout picker |
| `components/schedule/workout-picker-item.tsx` | Workout row in picker (with day badges) |
| `components/schedule/day-options-sheet.tsx` | Bottom sheet day actions |
| `components/schedule/empty-schedule-state.tsx` | Empty state (no workouts in library) |

### Modified files — Mobile (8)
| File | Change |
|---|---|
| `utils/api.ts` | Add `apiPut` |
| `constants/query-keys.ts` | Add `schedule.current` |
| `app/(protected)/(tabs)/_layout.tsx` | Add `schedule` tab |
| `components/ui/custom-tab-bar.tsx` | 4-column layout, Schedule tab, rename Library |
| `app/(protected)/(tabs)/index.tsx` | Real schedule data, remove mock, wire today's workout |
| `components/home/weekly-training-plan.tsx` | Link View → Schedule tab |
| `components/home/day-card.tsx` | Update import path for types |
| `components/home/status-indicator.tsx` | Update import path for types |

---

## Implementation Order

1. **Phase 0** — Backend (schema + validation + routes + migration)
2. **Phase 1** — Mobile types, apiPut, query keys, hooks, utils
3. **Phase 2** — Tab bar restructuring (can parallel with Phase 1)
4. **Phase 3A-C** — Schedule screen skeleton + segmented control + stats card
5. **Phase 3D** — Stack layout (first design)
6. **Phase 3E** — Calendar layout (second design)
7. **Phase 3F** — Grid layout (third design)
8. **Phase 3H-K** — Shared bottom sheets + picker + empty state
9. **Phase 4** — Home screen integration

---

## Verification

1. **Backend**: `GET /api/schedules` returns [] for new user, `PUT` with 7 entries returns populated array with joined workouts
2. **Tab bar**: 4 items render — Home, Schedule, FAB, Library — correct icons and labels
3. **Schedule screen**: segmented control toggles between Stack/Calendar/Grid instantly (no animation)
4. **Stats card**: shows correct training/rest counts and muscle coverage pills
5. **Assign workout**: tap day → picker opens → select → row updates → green checkmark flashes → API call succeeds
6. **Day badges in picker**: workouts show M/T/W pills for days they're already assigned
7. **Rest day**: tap → options → "Mark Rest" → moon icon shows → auto-save
8. **Clear**: tap assigned → "Clear" → reverts to unassigned → auto-save
9. **Error handling**: kill network → assign workout → optimistic update reverts → error toast appears
10. **Home integration**: `WeeklyTrainingPlan` shows real schedule, today highlighted, "View" navigates to Schedule tab
11. **Today's workout**: `TodaysWorkoutCard` shows scheduled workout; empty state when no schedule for today
12. **Persistence**: close/reopen → schedule persists from API
13. **Deleted workout**: delete from Library → schedule slot silently becomes unassigned
14. **Lint + types**: `npm run lint` and `npm run typecheck` pass in both repos
