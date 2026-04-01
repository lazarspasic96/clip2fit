# Phase 1: Smart Targets — Implementation Plan

## Overview

Formula-based weight suggestions on active workout screen. No LLM. Pure progression logic. Ships in 5-7 days.

**Data flow:** Start workout → fetch history → compute targets → render chips → user taps → fills input → completes set → analytics.

---

## Phase A: Backend API (clip2fit-api)

### A1. New endpoint: `GET /api/stats/exercise-history`

**File:** `clip2fit-api/src/app/api/stats/exercise-history/route.ts`

**Input:** `?ids=uuid1,uuid2,uuid3` (comma-separated catalogExerciseIds)

**Query logic:**
```sql
-- For each catalogExerciseId:
-- 1. Count distinct completed sessions
-- 2. Get the MOST RECENT completed session's set logs (actualWeight, actualReps per set)

WITH exercise_sessions AS (
  SELECT DISTINCT
    e.catalog_exercise_id,
    ws.id AS session_id,
    ws.completed_at
  FROM session_exercise_logs sel
  JOIN exercises e ON sel.exercise_id = e.id
  JOIN workout_sessions ws ON sel.session_id = ws.id
  WHERE e.catalog_exercise_id = ANY($ids)
    AND ws.status = 'completed'
    AND sel.status = 'completed'
),
session_counts AS (
  SELECT catalog_exercise_id, COUNT(*) AS session_count
  FROM exercise_sessions
  GROUP BY catalog_exercise_id
),
latest_sessions AS (
  SELECT DISTINCT ON (catalog_exercise_id)
    catalog_exercise_id, session_id
  FROM exercise_sessions
  ORDER BY catalog_exercise_id, completed_at DESC
)
SELECT
  sc.catalog_exercise_id,
  sc.session_count,
  ssl.set_number,
  ssl.actual_weight,
  ssl.actual_reps,
  ssl.status
FROM session_counts sc
JOIN latest_sessions ls USING (catalog_exercise_id)
JOIN session_exercise_logs sel ON sel.session_id = ls.session_id
  JOIN exercises e ON sel.exercise_id = e.id AND e.catalog_exercise_id = sc.catalog_exercise_id
JOIN session_set_logs ssl ON ssl.session_exercise_log_id = sel.id
  AND ssl.status = 'completed'
ORDER BY sc.catalog_exercise_id, ssl.set_number;
```

**Response shape:**
```typescript
type ExerciseHistoryResponse = Record<string, {
  sessionCount: number
  lastSession: {
    sets: Array<{
      setNumber: number
      actualWeight: number | null
      actualReps: number | null
    }>
  }
}>
```

**Auth:** Same pattern as `/api/stats/summary` — extract userId from session.

---

## Phase B: Frontend Utilities

### B1. `utils/progression.ts`

Pure functions, no side effects, fully testable.

```typescript
// --- Types ---
type ParsedReps = { type: 'exact'; value: number } | { type: 'range'; low: number; high: number }
type TargetResult = { weight: number; delta: number; isProgress: boolean } | null
type IncrementCategory = 'upper_compound' | 'lower_compound' | 'isolation'

// --- Functions ---

parseTargetReps(targetReps: string | null): ParsedReps | null
  // "8" → { type: 'exact', value: 8 }
  // "8-12" → { type: 'range', low: 8, high: 12 }
  // "AMRAP", "to failure", "30 sec", "8/side", null → null

getProgressionTarget(parsed: ParsedReps): number
  // exact → value, range → high (upper bound)

muscleGroupCategory(groups: string[]): IncrementCategory
  // Uses primary (first) muscle group
  // Maps MuscleGroupKey → category via lookup table
  // Fallback: 'upper_compound' (2.5kg default)

getIncrement(category: IncrementCategory): number
  // upper_compound → 2.5, lower_compound → 5, isolation → 1.25

isEligible(exercise: { catalogExerciseId?: string | null; isBodyweight?: boolean; targetReps: string | null }, sessionCount: number): boolean
  // All conditions: catalogExerciseId exists, !isBodyweight, reps parseable, sessionCount >= 2

computeTarget(params: {
  previousSets: Array<{ actualWeight: number | null; actualReps: number | null }>
  targetReps: string | null
  muscleGroups: string[]
}): TargetResult
  // 1. Parse reps → get progressionTarget
  // 2. Check all sets completed (non-null weight/reps)
  // 3. Check all actualReps >= progressionTarget
  // 4. If yes: previousWeight + increment
  // 5. If no: previousWeight (retry)
  // 6. Return { weight, delta, isProgress }
```

**Increment mapping:**
```
upper_compound (2.5kg): chest, shoulders, lats, middle_back, lower_back, traps, neck
lower_compound (5kg):   quadriceps, hamstrings, glutes, abductors, adductors
isolation (1.25kg):     biceps, triceps, forearms, abdominals, calves
```

Uses `normalizeMuscleGroup()` from `utils/muscle-color.ts` for alias resolution.

### B2. Tests: `__tests__/progression.test.ts`

~25 cases organized by function:

**parseTargetReps:** "8" → exact 8, "8-12" → range {8,12}, "AMRAP" → null, "to failure" → null, "30 sec" → null, "8/side" → null, null → null, "" → null

**isEligible:** catalogId+weighted+parseable+2sessions → true, no catalogId → false, bodyweight → false, AMRAP → false, 1 session → false, 0 sessions → false

**computeTarget:** all reps hit upper bound → +increment, all hit exact → +increment, some missed → retry (same weight), all missed → retry, no completed sets → null, mixed null data → null

**getIncrement:** chest → 2.5, quadriceps → 5, biceps → 1.25, unknown/empty → 2.5 default

**muscleGroupCategory:** single group maps correctly, multi-group uses first, alias ("pecs") normalizes correctly

---

## Phase C: Frontend Hook

### C1. `hooks/use-exercise-history.ts`

```typescript
// Follows useQuery + apiGet pattern from hooks/use-api.ts
// Query key: queryKeys.stats.exerciseHistory(ids)

useExerciseHistory(catalogExerciseIds: string[]): {
  history: ExerciseHistoryResponse
  isLoading: boolean
  error: string | null
}

// Skip fetch if ids array is empty
// Deduplicate ids before sending
// Sort ids for stable query key
// staleTime: 5 min (matches stats pattern)
```

**Add to `constants/query-keys.ts`:**
```typescript
stats: {
  // ... existing
  exerciseHistory: (ids: string[]) => ['stats', 'exercise-history', ...ids.sort()] as const,
}
```

---

## Phase D: UI Components

### D1. `components/workout/smart-target-chip.tsx`

**Props:**
```typescript
type SmartTargetChipProps = {
  target: { weight: number; delta: number; isProgress: boolean }
  state: 'suggested' | 'applied' | 'overridden'
  weightUnit: 'kg' | 'lbs'
  onApply: () => void
}
```

**Render by state:**
- `suggested`: `75kg +2.5` — tappable, `bg-brand-accent/8`, `text-content-secondary`
- `applied`: `checkmark 75kg` — non-interactive, `bg-brand-accent/15`, `text-brand-accent`
- `overridden`: `75kg` — non-interactive, 40% opacity

**Specs:** `rounded-md`, `px-2 py-0.5`, `text-xs font-inter font-medium`, `hitSlop={{top:10,bottom:10,left:10,right:10}}`, `accessibilityRole="button"`, `accessibilityLabel="Apply suggested weight of 75kg"`

**Copy format:**
- Progress: `{weight}{unit} +{delta}` (e.g., "75kg +2.5")
- Retry: `{weight}{unit} same` (e.g., "72.5kg same")
- Applied: `checkmark {weight}` (checkmark icon + weight only, no delta)
- Overridden: `{weight}` at 40% opacity

### D2. Modify `set-table-row.tsx`

**Changes:**
1. Accept new prop: `target?: TargetResult | null`
2. Accept new prop: `onApplyTarget?: (weight: number) => void`
3. Track chip state internally: starts as 'suggested', becomes 'applied' when tapped, becomes 'overridden' if user types different weight
4. Weight column becomes vertical stack when target exists (+20pt height)
5. Chip renders above weight input for active/editing sets only
6. After set completed: show small chip indicating applied/overridden status

**State logic:**
```
initial: suggested
tap chip → fill weight input → applied
type different weight → overridden
edit set → re-show as suggested (reset)
```

### D3. Modify `active-workout-content.tsx`

**Changes:**
1. Collect all `catalogExerciseId` values from workout exercises
2. Call `useExerciseHistory(ids)` at top of component
3. For each exercise + set: call `isEligible()` + `computeTarget()`
4. Pass `target` and `onApplyTarget` to each `SetTableRow`

---

## Phase E: Integration & Polish

### E1. Wire up data flow

In `active-workout-content.tsx` (or the component that renders the exercise sets):
1. Extract catalogExerciseIds from all exercises
2. Fetch history once per workout session start
3. Pre-compute targets per exercise (map catalogExerciseId → TargetResult)
4. Pass to set rows
5. `onApplyTarget` callback: update the weight input state in the set row

### E2. Edge cases

- History loading: no chip shown (row stays compact)
- API error: no chip shown (workout still works)
- Exercise without catalogExerciseId: no chip
- Exotic reps: no chip
- Only 1 session: no chip
- Bodyweight exercise: no chip
- Partial/corrupt data from API: no chip (degrade gracefully)
- Future sets: chip hidden (only active set)
- Completed sets: small chip showing applied/overridden

### E3. Accessibility

- `accessibilityRole="button"` on suggested chip
- `accessibilityLabel` describes the action: "Apply suggested weight of 75 kilograms"
- Applied/overridden chips are not focusable (decorative)
- 44pt minimum touch area via hitSlop

---

## Implementation Order

```
Day 1-2: Phase B — utils/progression.ts + tests (~25 cases)
Day 2:   Phase A — Backend endpoint (exercise-history)
Day 3:   Phase C — useExerciseHistory hook + query key
Day 3-4: Phase D1 — SmartTargetChip component
Day 4-5: Phase D2-D3 — Modify set-table-row + active-workout-content
Day 5-6: Phase E — Integration, edge cases, polish
Day 6-7: QA — /design-review + /review
```

**Start with tests (Phase B)** — progression logic is the foundation. Everything else depends on it being correct.

---

## What NOT to Build

- No bodyweight targets (Phase 1.5)
- No deloads (Phase 2+)
- No fuzzy name matching (catalogExerciseId only)
- No LLM calls (pure formula)
- No swipe-to-dismiss
- No free-tier blurred chip
- No PostHog events yet
- No "AI:" prefix on chips
- No manual useMemo/useCallback (React Compiler)

---

## Verification Plan (gstack)

After implementation:
1. `/design-review` — visual QA on chip (spacing, colors, dark mode, touch targets)
2. `/review` — pre-landing code review (diff against base branch)
3. Manual testing on iOS simulator with active workout containing:
   - Exercise WITH catalogExerciseId + 2+ sessions → chip shows
   - Exercise WITHOUT catalogExerciseId → no chip
   - Bodyweight exercise → no chip
   - AMRAP exercise → no chip
   - Tap chip → weight fills → chip becomes applied
   - Type different weight → chip becomes overridden
   - Complete set → small chip persists

---

## Files Summary

### Create
| File | Purpose |
|------|---------|
| `utils/progression.ts` | Core progression logic |
| `__tests__/progression.test.ts` | ~25 unit tests |
| `hooks/use-exercise-history.ts` | TanStack Query hook |
| `components/workout/smart-target-chip.tsx` | 3-state chip component |
| `clip2fit-api/src/app/api/stats/exercise-history/route.ts` | Backend endpoint |

### Modify
| File | Change |
|------|--------|
| `constants/query-keys.ts` | Add exerciseHistory key |
| `components/workout/command-center/set-table-row.tsx` | Vertical stack + chip integration |
| `components/workout/active-workout-content.tsx` | Fetch history + compute targets |
