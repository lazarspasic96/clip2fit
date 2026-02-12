# Handoff: Weekly Workout Schedule

## Goal

Weekly schedule system: backend API + 3-tab mobile layout + Schedule screen with 3 design variants (Stack/Calendar/Grid) + home screen integration. Full spec: `plans/weekly-schedule.md`.

## Current Progress

### Phase 0: Backend — DONE

Backend repo: `/Users/lazarspasic/git/clip2fit-api/src`

- **Schema**: `weeklySchedules` table in `src/lib/db/schema.ts` — uuid PK, userId (FK profiles, cascade), dayOfWeek (smallint 0-6), workoutId (FK workouts, set null), isRestDay. Constraints: unique(userId, dayOfWeek), check day range, check rest-or-workout mutual exclusion.
- **Relations**: Added `scheduleEntries: many(weeklySchedules)` to `profilesRelations` and `workoutsRelations`. Added `weeklySchedulesRelations` (one user, one workout).
- **Validation**: `scheduleEntrySchema` and `upsertScheduleSchema` in `src/lib/validations.ts` — 7 entries, unique days, no workout+rest simultaneously.
- **Route**: `src/app/api/schedules/route.ts` — GET (fetch with joined workouts) + PUT (bulk upsert via delete+insert transaction, re-query with joins).
- **Migration**: Generated via `drizzle-kit generate` → `drizzle/0000_funny_pandemic.sql`. **Not yet run** — needs `drizzle-kit migrate` or `drizzle-kit push`.

### Phase 1: Mobile Data Layer — DONE

- `types/schedule.ts` — `DayOfWeek`, `DayStatus`, `WeekDay`, `ApiScheduleEntry`, `ScheduleEntry`, `WeeklySchedule`, `UpsertSchedulePayload`
- `utils/api.ts` — Added `apiPut` (same pattern as `apiPatch`)
- `constants/query-keys.ts` — Added `schedule.current`
- `hooks/use-schedule.ts` — `useScheduleQuery()` (fills missing days to always return 7), `useUpdateScheduleMutation()` (invalidates schedule key)
- `utils/schedule.ts` — `DAY_LABELS`, `DAY_SHORT_LABELS`, `getTodayDayOfWeek()`, `buildEmptySchedule()`, `scheduleToPayload()`, `buildWeekDaysFromSchedule()`, `getScheduleStats()`

### Phase 2: Tab Bar — DONE

- `app/(protected)/(tabs)/_layout.tsx` — Added `schedule` screen between index and my-workouts
- `components/ui/custom-tab-bar.tsx` — 3 tabs + FAB: Home | Schedule | + | Library. Dynamic loop with FAB after index 1. CalendarDays icon for Schedule. Renamed "My Workouts" → "Library".

### Phase 3: Schedule Screen — DONE (15 new files)

- `app/(protected)/(tabs)/schedule.tsx` — Orchestrator: segmented control, day press → options/picker sheets, mutation with checkmark flash
- `components/schedule/schedule-segmented-control.tsx` — Stack/Calendar/Grid toggle
- `components/schedule/schedule-stats-card.tsx` — Training/rest day counts + muscle coverage pills
- `components/schedule/schedule-day-row.tsx` — Reusable day row (green/blue accent bars, today badge, FadeInUp stagger, checkmark flash)
- `components/schedule/layouts/stack-layout.tsx` — 7 vertical ScheduleDayRow cards
- `components/schedule/layouts/calendar-layout.tsx` — Horizontal week strip + detail card
- `components/schedule/layouts/grid-layout.tsx` — 2-column compact grid
- `components/schedule/workout-picker-sheet.tsx` — BottomSheetModal with search, rest day, clear, BottomSheetFlatList of workouts with day badges
- `components/schedule/workout-picker-item.tsx` — Workout row with muscle pills, duration, difficulty, day badges
- `components/schedule/day-options-sheet.tsx` — Action sheet: Change Workout / Mark Rest / Assign / Clear
- `components/schedule/option-row.tsx` — Extracted shared option row component
- `components/schedule/empty-schedule-state.tsx` — "No workouts yet" with CTA to import

### Phase 4: Home Screen Integration — DONE

- `app/(protected)/(tabs)/index.tsx` — Uses `useScheduleQuery()`, builds `WeekDay[]` via `buildWeekDaysFromSchedule()`, shows today's scheduled workout or "No workout scheduled today" or empty state
- `components/home/weekly-training-plan.tsx` — "View" button navigates to `/(protected)/(tabs)/schedule`
- `components/home/day-card.tsx` + `components/home/status-indicator.tsx` — Updated imports from `types/schedule` (was `utils/mock-data`)
- `hooks/use-api.ts` — `useDeleteWorkoutMutation` now also invalidates `queryKeys.schedule.current`

### Code Review Fixes — DONE

- Extracted `OptionRow` to own file (one component per file rule)
- Fixed dead branch in `buildWeekDaysFromSchedule` ternary
- Fixed schedule screen to check both `scheduleLoading` and `workoutsLoading`
- Added "No workout scheduled today" text on home screen (plan spec)
- Invalidate schedule query key when workout is deleted

## What Worked

- **Bulk upsert via delete+insert in transaction** — simpler than individual upserts, atomic
- **`buildFullSchedule()` pattern** — API may return 0-7 entries, hook always normalizes to exactly 7
- **Dynamic tab bar loop** — `state.routes.flatMap` with FAB insertion after index 1 scales to N tabs
- **`forwardRef` for bottom sheets** — parent controls present/dismiss via ref, sheet is stateless
- **Haptic feedback** on all picker/options interactions via `expo-haptics`

## What Didn't Work / Watch Out For

- **`forwardRef` needs `.displayName`** — ESLint `react/display-name` rule catches this
- **One component per file** — Initially had `OptionRow` inside `day-options-sheet.tsx`, had to extract
- **Optimistic updates not yet implemented** — Plan specifies optimistic local update + revert on error with toast. Current implementation does standard mutation (delay between tap and visual update). This is the biggest remaining UX gap.
- **Pre-existing lint warnings** — Unescaped `'` in `check-email.tsx` and `index.tsx` — not our changes
- **Typed Routes** — `schedule` route may show TS errors until Metro restarts

## Key Files Reference

| File | Purpose |
|------|---------|
| `plans/weekly-schedule.md` | Full implementation spec |
| `types/schedule.ts` | Schedule types + relocated DayStatus/WeekDay |
| `utils/schedule.ts` | Day labels, date math, stats, mappers |
| `hooks/use-schedule.ts` | useScheduleQuery, useUpdateScheduleMutation |
| `app/(protected)/(tabs)/schedule.tsx` | Schedule tab screen |
| `components/schedule/*.tsx` | 11 schedule components |
| `components/schedule/layouts/*.tsx` | 3 layout variants |
| `components/ui/custom-tab-bar.tsx` | Tab bar (3 tabs + FAB) |

## Current Route Structure

```
app/
  _layout.tsx                  # Root: auth + onboarding state machine
  (auth)/
    welcome.tsx, login.tsx, signup.tsx, check-email.tsx
  (protected)/
    _layout.tsx                # Stack: tabs + modals
    (tabs)/
      _layout.tsx              # Custom tab bar: Home | Schedule | + FAB | Library
      index.tsx                # Home screen
      schedule.tsx             # Schedule screen (Stack/Calendar/Grid)
      my-workouts.tsx          # Library screen
    onboarding/
    settings.tsx, add-workout.tsx, active-workout.tsx, etc.
```

## Next Steps

1. **Run migration** — `cd clip2fit-api && npx drizzle-kit migrate` (or `drizzle-kit push` for dev). The migration file is generated but not applied.
2. **Optimistic updates** — Add React Query optimistic update in `schedule.tsx` `handleAssign()`: set query data immediately, revert `onError`, show error toast. This is the plan's specified pattern and the biggest UX improvement remaining.
3. **Test on device** — `npm start` → verify 4-item tab bar, schedule screen loads, segmented control toggles, picker opens, assignments save to API.
4. **Error toast** — Need a toast library or component for showing mutation errors. Consider `react-native-toast-message` or a custom component.
5. **Workout history tracking** — `DayStatus` currently doesn't track completed/skipped for past days (all show as `future`). When workout session completion is persisted, `buildWeekDaysFromSchedule` should check completion history.
6. **`utils/mock-data.ts` cleanup** — `DayStatus` and `WeekDay` types moved to `types/schedule.ts`. If nothing else imports from `utils/mock-data.ts`, it can be removed.
