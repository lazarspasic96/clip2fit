# Cleanup: Remove Mock Data & Unused Code

## Context
Codebase audit found leftover mock data files, debug logging, and a mock fallback in the active workout screen. All home/library/schedule screens already use real API data — these are development leftovers. ~286 lines of dead code to remove.

---

## Phase 1: Delete Unused Mock Files

### 1. Delete `utils/mock-data.ts`
- 86 lines. Zero imports in source code
- Types (`DayStatus`, `WeekDay`) have equivalents in `types/schedule.ts`

### 2. Delete `utils/mock-processing-pipeline.ts`
- 75 lines. Zero imports. Was dev simulation of Trigger.dev pipeline

---

## Phase 2: Remove Mock Fallback in Active Workout Screen

### 3. Edit `components/workout/active-workout-content.tsx`
- Remove `import { MOCK_WORKOUT_PLAN }` (line 11)
- Change line 23 from `const workoutPlan = id !== undefined ? workout : MOCK_WORKOUT_PLAN` → use `workout` directly
- If `id` is undefined → **silent redirect back** (no toast, no error state)

### 4. Delete `utils/mock-workout-session.ts` entirely
- After step 3, all exports are unused (`MOCK_WORKOUT_PLAN`, `createMockSession`, `PUSH_DAY_EXERCISES`, `createSets`)
- 115 lines removed
- No test fixtures needed — TypeScript strict mode covers type safety

---

## Phase 3: Remove Debug Console Log

### 5. Edit `app/(protected)/_layout.tsx`
- Remove entire `useEffect` block (lines 11-17) that logs `session?.access_token`
- Remove `useEffect` import from react
- Remove `supabase` import from `@/utils/supabase`
- Just remove it — can re-add temporarily if needed for debugging

---

## Phase 4: Add TODO Comments for Remote Image URLs

### 6. Edit `components/home/rest-day-card.tsx`
- Add `// TODO: Replace with local asset` above the Unsplash URL (line 27)

### 7. Edit `components/home/todays-workout-card.tsx`
- Add `// TODO: Replace with local assets` above `PLATFORM_ICONS` (line 13)

---

## NOT Touching (Confirmed Decisions)
- `console.log('Import manually')` in bottom-action-buttons.tsx → leave as-is (planned feature)
- Empty `onPress={() => {}}` on Rest button in todays-workout-card.tsx → leave as-is (planned feature)
- `plans/*.md` (16 files) → leave as historical reference, don't touch docs
- `HANDOFF.md` stale mock references → leave as-is
- `SegmentedControl`, `RestDayCard`, `DIFFICULTY_COLORS`, `PLATFORM_ICONS` → verified in-use

---

## Summary

| Action | File | Lines |
|--------|------|-------|
| DELETE | `utils/mock-data.ts` | -86 |
| DELETE | `utils/mock-processing-pipeline.ts` | -75 |
| DELETE | `utils/mock-workout-session.ts` | -115 |
| EDIT | `components/workout/active-workout-content.tsx` | -3 |
| EDIT | `app/(protected)/_layout.tsx` | -7 |
| EDIT | `components/home/rest-day-card.tsx` | +1 |
| EDIT | `components/home/todays-workout-card.tsx` | +1 |
| **Total** | | **~284 lines removed** |

## Verification
- `npm run lint` — no new errors
- `npx tsc --noEmit` — no type errors from removed imports
- Active workout screen with real workout ID → works
- Active workout screen without ID → silently redirects back
