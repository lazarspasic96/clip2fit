# Plan: Replace @gorhom/bottom-sheet with formSheet Routes

## Context

The app uses `@gorhom/bottom-sheet` in 13 source files (11 sheet components + 1 provider + 1 screen import). This adds a dependency with a patch file, a provider in the root layout, and custom keyboard handling (`BottomSheetTextInput`). Native `formSheet` presentation (via `react-native-screens ~4.22`) provides the same UX with zero dependency, native keyboard avoidance, and simpler code. Each sheet becomes a route screen that owns its own business logic instead of receiving callbacks from parents.

**Existing reference**: `process-url` screen already uses `presentation: 'formSheet'` in `app/(protected)/_layout.tsx:19-26`.

### Android Note
`formSheet` on `react-native-screens ~4.22` renders as a partial bottom sheet on Android (not full-screen). Known Android issues with `fitToContents`: keyboard overlap ([#2664](https://github.com/software-mansion/react-native-screens/issues/2664)), no dynamic resize with keyboard ([#3181](https://github.com/software-mansion/react-native-screens/issues/3181)). **Mitigation**: use fractional detents (`[0.7]`) instead of `fitToContents` for sheets containing text inputs. Android is limited to 3 detents max.

---

## Phase 0: Infrastructure

### Task 0.1 — Create catalog filter store
**New**: `stores/catalog-filter-store.ts`
- Module-level store with `getFilters`, `setFilters`, `resetFilters`, `subscribe`, `getSnapshot`
- Same pattern as `contexts/workout-builder-context.tsx` (ref + listeners + version counter)
- Holds `CatalogFilters` (from `types/catalog.ts`)
- No React context, no provider — consumed via `useSyncExternalStore`

### Task 0.2 — Register all sheet routes in protected layout
**Modify**: `app/(protected)/_layout.tsx`
- Add `import { Colors } from '@/constants/colors'`
- Add 10 `<Stack.Screen>` entries for `sheets/*` routes with `presentation: 'formSheet'`
- Common options: `sheetGrabberVisible: true`, `sheetCornerRadius: 20`, `headerShown: false`, `contentStyle: { backgroundColor: Colors.background.secondary }`
- Detent mapping:

| Route | Detents | Has TextInput? |
|-------|---------|:-:|
| `sheets/edit-personal-info` | `[0.6]` | Yes |
| `sheets/edit-body-measurements` | `[0.7]` | Yes |
| `sheets/edit-fitness-goal` | `fitToContents` | No |
| `sheets/day-options` | `fitToContents` | No |
| `sheets/workout-picker` | `[0.6, 0.9]` | No |
| `sheets/finish-workout` | `fitToContents` | No |
| `sheets/exercise-learning` | `[0.8]` | No |
| `sheets/edit-exercise` | `[0.6]` | Yes |
| `sheets/catalog-filters` | `[0.8]` | No |

Sheets with text inputs use fractional detents to avoid Android `fitToContents` keyboard issues.
`exercise-info` route skipped — dead code (zero importers), just delete the component.

---

## Phase 1: ConfirmationSheet → Alert.alert()

### Task 1.1 — Migrate my-workouts.tsx
**Modify**: `app/(protected)/(tabs)/my-workouts.tsx`
- Add `Alert` to `react-native` imports
- Remove `ConfirmationSheet` import
- Remove `deleteTargetId` state + derived `deleteTarget`, `deleteTitle`, `deleteDescription`, `deleteError`
- Remove `<ConfirmationSheet>` JSX
- In swipe `onAction`: call `Alert.alert(title, description, [Cancel, Delete])` inline, `onPress` triggers `deleteMutation.mutate(item.id)`

### Task 1.2 — Migrate workout-proposal.tsx
**Modify**: `components/proposal/workout-proposal.tsx`
- Add `Alert` to `react-native` imports
- Remove `ConfirmationSheet` import + `showDiscardModal` state
- Remove `<ConfirmationSheet>` JSX
- In `handleDiscardPress`: if dirty, call `Alert.alert(title, description, [Cancel, Discard])`, `onPress` calls `onDiscard()`

### Task 1.3 — Delete confirmation sheet
**Delete**: `components/ui/confirmation-sheet.tsx`

---

## Phase 2: Settings Sheets → formSheet Routes

Current parent: `app/(protected)/settings.tsx` manages `activeSheet` state, `saveMutation`, passes callbacks.
New: each route owns `useProfileQuery()` + `useSaveProfileMutation()`. Parent just navigates.

### Task 2.1 — Create edit-personal-info route
**New**: `app/(protected)/sheets/edit-personal-info.tsx`
- Port form from `components/settings/edit-personal-info-sheet.tsx`
- Replace `BottomSheetTextInput` → `TextInput`, `BottomSheetScrollView` → `ScrollView`
- Remove ref/visible/onDismiss pattern
- Own `useProfileQuery()` for initial values, `useSaveProfileMutation()` for save
- On success: `router.back()`
- Validation stays client-side (same logic)

### Task 2.2 — Create edit-body-measurements route
**New**: `app/(protected)/sheets/edit-body-measurements.tsx`
- Same pattern as 2.1, most complex form (height/weight dual units, SegmentedControl)
- Replace `BottomSheetTextInput` → `TextInput` (native formSheet handles keyboard)
- Own hooks for data + mutation

### Task 2.3 — Create edit-fitness-goal route
**New**: `app/(protected)/sheets/edit-fitness-goal.tsx`
- Simplest form — radio selection, no text inputs
- Own hooks for data + mutation

### Task 2.4 — Update settings.tsx parent
**Modify**: `app/(protected)/settings.tsx`
- Remove all 3 sheet component imports
- Remove `ActiveSheet` type, `activeSheet` state, `handleSave`, `saveMutation`
- Remove 3 `<EditXxxSheet>` JSX blocks
- Replace `setActiveSheet('personal')` → `router.push('/(protected)/sheets/edit-personal-info')` (same for body, goal)
- Screen becomes read-only profile display + navigation

### Task 2.5 — Delete old settings sheets
**Delete**:
- `components/settings/edit-personal-info-sheet.tsx`
- `components/settings/edit-body-measurements-sheet.tsx`
- `components/settings/edit-fitness-goal-sheet.tsx`

---

## Phase 3: Schedule Sheets → formSheet Routes

Current parent: `app/(protected)/(tabs)/schedule.tsx` uses refs, `selectedDay` state, sequential present/dismiss with 300ms delays. Two sheets work in sequence: day-options → workout-picker.
New: `router.push` for day-options, which does `router.replace` to workout-picker when needed.

### Task 3.1 — Create day-options route
**New**: `app/(protected)/sheets/day-options.tsx`
- Route params: `dayOfWeek` (string, parsed to number)
- Own `useScheduleQuery` to get entry for that day
- Actions:
  - "Change/Assign Workout" → `router.replace('/(protected)/sheets/workout-picker?dayOfWeek=...')` (replace so back goes to schedule)
  - "Clear" → call `useUpdateScheduleMutation`, `router.back()` on success
- Haptics preserved

### Task 3.2 — Create workout-picker route
**New**: `app/(protected)/sheets/workout-picker.tsx`
- Route params: `dayOfWeek` (string)
- Own `useWorkoutsQuery` + `useScheduleQuery` + `useUpdateScheduleMutation`
- `FlatList` of workouts (replace `BottomSheetFlatList`)
- On select: mutate schedule assignment, `router.back()` on success
- "Clear" button if day already assigned

### Task 3.3 — Update schedule.tsx parent
**Modify**: `app/(protected)/(tabs)/schedule.tsx`
- Remove `BottomSheetModal` import
- Remove `DayOptionsSheet` + `WorkoutPickerSheet` imports
- Remove `optionsRef`, `pickerRef`, `selectedDay` state
- Remove all handler functions for sheets (handleSelectWorkout, handleClear, handleChangeWorkout, handleAssignFromOptions)
- Remove both sheet JSX blocks
- Simplify `handleDayPress`:
  ```tsx
  if (entry.workoutId === null) router.push(`/sheets/workout-picker?dayOfWeek=${day}`)
  else router.push(`/sheets/day-options?dayOfWeek=${day}`)
  ```
- Remove checkmark flash animation (sheet dismissal is sufficient feedback)

### Task 3.4 — Delete old schedule sheets
**Delete**:
- `components/schedule/day-options-sheet.tsx`
- `components/schedule/workout-picker-sheet.tsx`

---

## Phase 4: Workout Sheets → formSheet Routes

### Task 4.1 — Add `finishResult` to ActiveWorkoutContext
**Modify**: `contexts/active-workout-context.tsx`
- Add `finishResult: ApiSessionResponse | null`, `setFinishResult`, `clearFinishResult` to context value
- Store in a ref (same pattern as existing refs in this context)
- This lets the finish-workout route write mutation results for the parent to consume

### Task 4.2 — Create finish-workout route
**New**: `app/(protected)/sheets/finish-workout.tsx`
- Reads `useActiveWorkout()` for session data
- Computes exercise stats (completed, skipped, pending counts)
- "Finish Workout" button: calls `useFinishWorkout().mutate(session)`, on success writes `setFinishResult(data)` + `router.back()`
- "Keep Going" button: `router.back()`

### Task 4.3 — Update active-workout-shell.tsx
**Modify**: `components/workout/active-workout-shell.tsx`
- Remove `FinishWorkoutSheet` import, `showFinishSheet` state, `finishMutation`
- Replace `handleFinish`: `router.push('/(protected)/sheets/finish-workout')`
- Add `useEffect` watching `finishResult` from context → handle PRs or `finishSession() + onBack()`
- Call `clearFinishResult()` after consuming

### Task 4.4 — Update command-center-workout.tsx
**Modify**: `components/workout/command-center/command-center-workout.tsx`
- Same changes as 4.3 if it also renders `FinishWorkoutSheet`

### Task 4.5 — Create exercise-learning route
**New**: `app/(protected)/sheets/exercise-learning.tsx`
- Route params: `catalogExerciseId` (string), `videoUrl` (string, optional), `showPrimaryMuscles` (string)
- Own `useCatalogDetail(catalogExerciseId)` for exercise data
- Read-only display: video, images, instructions, muscle tags
- `ScrollView` replaces `BottomSheetScrollView`

### Task 4.6 — Update baseline-pulse-dashboard.tsx
**Modify**: `components/workout/designs/design-a-baseline/baseline-pulse-dashboard.tsx`
- Remove `ExerciseLearningSheet` import + `showLearningSheet` state
- Remove `<ExerciseLearningSheet>` JSX
- Learning pill `onPress`: `router.push({ pathname: '/sheets/exercise-learning', params: { ... } })`

### Task 4.7 — Delete old workout sheets
**Delete**:
- `components/workout/finish-workout-sheet.tsx`
- `components/workout/shared/exercise-info-sheet.tsx` (dead code, zero importers)
- `components/workout/shared/exercise-learning-sheet.tsx`

---

## Phase 5: Edit Exercise Sheet → formSheet Route

### Task 5.1 — Create edit-exercise route
**New**: `app/(protected)/sheets/edit-exercise.tsx`
- Route params: `workoutId` (string), `exerciseIndex` (string — index in exercises array)
- Own `useWorkoutQuery(workoutId)` to get exercise data
- Form: `TextInput` for sets, reps, notes (replaces `BottomSheetTextInput`)
- "Done": calls `useUpdateWorkoutMutation` with updated exercises array
- Fork-on-edit: if `data.id !== workoutId` in `onSuccess`, dismiss sheet + `router.replace` to new workout detail
- Normal save: `router.back()`, parent refetches via query invalidation

### Task 5.2 — Update workout-detail-content.tsx
**Modify**: `components/workout-detail/workout-detail-content.tsx`
- Remove `EditExerciseSheet` import + `selectedExerciseIndex` state
- Remove `handleUpdateExercise`, `selectedExercise` computation
- Remove `<EditExerciseSheet>` JSX
- `onEdit`: `router.push({ pathname: '/sheets/edit-exercise', params: { workoutId: id, exerciseIndex: String(index) } })`

### Task 5.3 — Delete old edit-exercise sheet
**Delete**: `components/workout-detail/edit-exercise-sheet.tsx`

---

## Phase 6: Catalog Filter Sheet → formSheet Route + Store

### Task 6.1 — Create catalog-filters route
**New**: `app/(protected)/sheets/catalog-filters.tsx`
- Port UI from `components/catalog/shared/catalog-filter-sheet.tsx`
- Replace `BottomSheetScrollView` → `ScrollView`
- Read initial state from `catalogFilterStore.getFilters()` into local `useState` (copy-on-mount)
- "Show Exercises": write to `catalogFilterStore.setFilters(...)` + `router.back()`
- "Clear All": reset local state only (not store — store updates on Apply)
- Swipe dismiss: store unchanged (same behavior as before)

### Task 6.2 — Update exercise-catalog.tsx
**Modify**: `app/(protected)/exercise-catalog.tsx`
- Replace `useState<CatalogFilters>(EMPTY_FILTERS)` → `useSyncExternalStore(catalogFilterStore.subscribe, catalogFilterStore.getSnapshot)` + `catalogFilterStore.getFilters()`
- Pass `catalogFilterStore.setFilters` as `setFilters` prop to `CardCarouselDesign`

### Task 6.3 — Update card-carousel-design.tsx
**Modify**: `components/catalog/designs/card-carousel-design.tsx`
- Remove `CatalogFilterSheet` import + `filterSheetVisible` state
- Remove `handleFilterApply` function
- Remove `<CatalogFilterSheet>` JSX
- Filter button `onPress`: `router.push('/(protected)/sheets/catalog-filters')`

### Task 6.4 — Delete old catalog filter sheet
**Delete**: `components/catalog/shared/catalog-filter-sheet.tsx`

---

## Phase 7: Cleanup

### Task 7.1 — Remove BottomSheetModalProvider
**Modify**: `app/_layout.tsx`
- Remove `import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'`
- Remove `<BottomSheetModalProvider>` / `</BottomSheetModalProvider>` wrapper

### Task 7.2 — Delete patch file
**Delete**: `patches/@gorhom+bottom-sheet+5.2.8.patch`

### Task 7.3 — Uninstall package
Run: `npm uninstall @gorhom/bottom-sheet`

### Task 7.4 — Verify
- `grep -r "@gorhom/bottom-sheet" --include="*.ts" --include="*.tsx"` — expect zero hits
- `npx tsc --noEmit` — no type errors
- `npm run lint` — no lint errors

---

## Summary

| Category | New | Modified | Deleted |
|----------|-----|----------|---------|
| Routes | 9 screens | — | — |
| Store | 1 (`catalog-filter-store.ts`) | — | — |
| Layout | — | 2 (`_layout.tsx`, `(protected)/_layout.tsx`) | — |
| Parents | — | 8 screens/components | — |
| Context | — | 1 (`active-workout-context.tsx`) | — |
| Old sheets | — | — | 11 components |
| Patch | — | — | 1 file |
| **Total** | **10** | **11** | **12** |

---

## Verification

1. `grep -r "@gorhom/bottom-sheet" --include="*.ts" --include="*.tsx"` — zero hits
2. `npx tsc --noEmit` — no type errors
3. `npm run lint` — no lint errors
4. Manual test each sheet on iOS:
   - Settings: edit personal info, body measurements, fitness goal — keyboard, save, dismiss
   - Schedule: day options → assign/change/clear workout
   - Active workout: finish workout → PR celebration flow
   - Exercise learning pill → content display
   - Workout detail: edit exercise → save, fork handling
   - Catalog: open filters → apply/clear/dismiss
   - My Workouts: swipe delete → Alert confirmation
   - Proposal: discard → Alert confirmation
5. Manual test on Android: verify partial sheet presentation, keyboard behavior with fractional detents
