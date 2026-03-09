# Button Consistency & Rounding Plan

## Problem
- `Button` component uses `rounded-md` (6px) — too sharp
- Stats empty state uses `rounded-xl` (12px) — looks better
- ~15 places use inline `Pressable` instead of `Button` component

## Phase 1: Update Button component rounding

**File:** `components/ui/button.tsx`
- Change `rounded-md` → `rounded-xl` for all variants
- This auto-fixes all existing `Button` usages (auth, onboarding, add-workout, etc.)

## Phase 2: Replace inline Pressable "Save" buttons in sheets

All 7 sheet screens use identical inline Pressable pattern instead of `Button`:
```
<Pressable className="rounded-md py-3.5 bg-background-button-primary ...">
```

Replace with `<Button>` in:
1. `app/(protected)/sheets/edit-name.tsx` (L65-73)
2. `app/(protected)/sheets/edit-weight.tsx` (L81-89)
3. `app/(protected)/sheets/edit-height.tsx` (L137-145)
4. `app/(protected)/sheets/edit-date-of-birth.tsx` (L57-65)
5. `app/(protected)/sheets/edit-fitness-goal.tsx` (L40-48)
6. `app/(protected)/sheets/edit-gender.tsx` (L57-65)
7. `app/(protected)/sheets/edit-exercise.tsx` (L106-114)

## Phase 3: Replace inline Pressable buttons in other components

### 3a. Empty states with CTA buttons
8. `components/stats/empty-stats-state.tsx` — "Start a Workout" (L16-21, `rounded-xl`)
9. `components/schedule/empty-schedule-state.tsx` — "Import Workout" (L19-26, `rounded-lg`)

### 3b. Finish workout sheet
10. `app/(protected)/sheets/finish-workout.tsx` — "Keep Going" + "Finish Workout" (L64-78)
    - Two side-by-side buttons. Use `Button` variant=secondary + variant=primary with `className="flex-1"`

### 3c. Catalog filter action buttons
11. `app/(protected)/sheets/catalog-filters.tsx` — "Clear All" + "Show Exercises" (L217-228)
    - Use `Button` variant=ghost + variant=primary with `className="flex-1"`

### 3d. Card action buttons (small inline buttons)
12. `components/home/todays-workout-card.tsx` — "Continue"/"Start Workout"/"View" (L42-63, `rounded-md`)
13. `components/home/completed-workout-card.tsx` — "Edit"/"View" (L41-53, `rounded-md`)

These are small inline card buttons (`px-4 py-2`), different sizing from standard Button. Need a `size="sm"` prop on Button, OR leave as-is since they're contextual card buttons (not full-width CTAs). **Decision: add `size` prop to Button.**

## Phase 4: Add `size` prop to Button

Add `size?: 'default' | 'sm'` to Button:
- `default`: `py-3.5` (current)
- `sm`: `py-2 px-4` (for card/inline buttons)

Then replace card buttons in todays-workout-card and completed-workout-card.

## Phase 5: Update remaining specialized buttons

14. `components/workout/shared/log-set-button.tsx` — uses `rounded-lg`, change to `rounded-xl`
15. `components/auth/google-sign-in-button.tsx` — uses `rounded-md`, change to `rounded-xl`

## NOT changing (intentional custom patterns)
- `BackButton` — circular icon button (`rounded-full`), fine as-is
- `DismissButton` — icon-only, no visible rounding needed
- `StepperButton` — small square +/- buttons, `rounded-lg` fine
- `SetCheckButton` — animated checkbox, `rounded-full` fine
- `SegmentedControl` — toggle group, own pattern
- `BottomActionButtons` — large tile buttons (`rounded-2xl`), cards not standard buttons
- Filter chips/presets — `rounded-full` pills, selection UI not action buttons
- Gender option chips — selection chips, not action buttons
- Settings/option rows — list items, not buttons
- `SourceVideoButton` — text link style
- `ExerciseNavArrows` — icon-only navigation
- Workout picker "Clear" — small contextual action
- Catalog empty state filter chips — `rounded-full` pills

## Unresolved questions
None — approach is clear.
