# Refactor: My Workouts + Workout Detail (Inline Edit, Swipe Delete)

## Context

Currently, the workout flow is: **My Workouts list -> Workout Detail (read-only) -> Edit Workout (separate screen)**. The edit screen (`edit-workout.tsx`) is a full separate route that reuses the `WorkoutProposal` component. This adds unnecessary navigation friction.

**Goal**: Eliminate the separate edit screen. Make the Workout Detail screen support inline editing of individual exercises (tap to edit). Add swipe-to-delete for both workout cards (in My Workouts list) and exercise rows (in Workout Detail). Redesign the My Workouts cards with brand-color icons and richer info.

---

## Phase 1: Reusable `SwipeableRow` Component

**New file**: `components/ui/swipeable-row.tsx`

Build a generic swipeable row using `react-native-gesture-handler` + `react-native-reanimated`:

- `Gesture.Pan()` — horizontal only, `activeOffsetX: [-10, 10]` to avoid conflicting with vertical scroll
- Shared values: `translateX`, animated radius values
- Threshold logic: if swiped past 30% of action width -> snap open, else snap back
- `withSpring` for snappy open/close feel
- **Radius handling**:
  - Default: card has full `borderRadius: 16` + `borderCurve: 'continuous'`
  - When swiped open: card loses right radius (`borderTopRightRadius: 0`, `borderBottomRightRadius: 0`), action button has no left radius (`borderTopLeftRadius: 0`, `borderBottomLeftRadius: 0`) but keeps right radius
  - Animate radius via `interpolate` (16 -> 0 as swipe progresses)
- Props: `children`, `actionWidth`, `actionContent` (render prop for delete button), `onAction`, `enabled`
- Auto-close when another row opens (via shared context or callback)
- Haptic feedback (light impact) when threshold crossed

**Deps already installed**: `react-native-gesture-handler` ~2.28.0, `react-native-reanimated` ~4.1.1

---

## Phase 2: My Workouts Screen Redesign

**File**: `app/(protected)/(tabs)/my-workouts.tsx`

### Card Redesign — `WorkoutCard`

Extract to **new file**: `components/my-workouts/workout-card.tsx`

Design direction: bold, dark cards with **lime accent** highlights. Each card feels like a mini workout poster.

- **Left accent bar**: 3px vertical lime (`#84cc16`) bar on the left edge of card
- **Title row**: workout title (bold, primary), platform icon (use SVG from `platform-icons.tsx`, sized 16px) in brand accent color
- **Description**: 1-2 lines of `workout.description`, `numberOfLines={2}`, secondary text
- **Metadata row** with **brand-color icons** (lime `#84cc16`):
  - `Dumbbell` icon + exercise count
  - `Clock` icon + duration
  - `Flame` icon + difficulty (color-coded: green/yellow/red)
- **Creator row**: `@handle` in tertiary text
- **Thumbnail**: 52x52 rounded image on right (if available)
- Add `borderCurve: 'continuous'` on card
- Card background: `bg-background-secondary` (slightly elevated from list bg)

### Swipe-to-Delete Workout

Wrap each `WorkoutCard` in `SwipeableRow`:
- Action: red delete button with `Trash2` icon + "Delete" text
- `actionWidth: 80`
- On swipe action: show `DeleteWorkoutModal` (reuse existing from `components/workout-detail/`)
- Move `DeleteWorkoutModal` to `components/ui/delete-workout-modal.tsx` (shared)

### List Enhancements
- Staggered entry: `FadeInUp.delay(index * 40)` on each card (on initial mount only)
- `LinearTransition` layout animation when a workout is deleted (remaining cards animate up)
- Keep pull-to-refresh

### Empty State
- Reuse existing but add brand accent to the dumbbell icon

**Also new file**: `components/my-workouts/empty-state.tsx` (extract from screen)

---

## Phase 3: Workout Detail — Remove Whole-Workout Delete, Add Edit Mode + Bottom Sheet

### Header Changes

**File**: `components/workout-detail/detail-header.tsx`

- Remove the `Trash2` delete button (delete is now swipe on My Workouts list)
- Remove `onDelete` prop
- Keep back button + pencil edit button
- Pencil toggles edit mode for the entire screen:
  - **Read mode**: back button + pencil icon
  - **Edit mode**: "Cancel" text button (left) + "Save" button (right, brand accent)

### Workout Detail Content

**File**: `components/workout-detail/workout-detail-content.tsx`

- Add `isEditing` state (toggled by header pencil button)
- When `isEditing === true`:
  - Header shows Cancel/Save
  - Exercise rows become swipeable to delete
  - Tapping an exercise card opens the **Edit Exercise Sheet** (bottom sheet)
  - `LinearTransition` layout animation when exercise deleted
- When `isEditing === false`:
  - Read-only view (current behavior)
  - Tapping exercise does nothing
- Track edited exercises in local state: `editableExercises: ApiExercise[] | null`
  - Initialize from `rawWorkout.exercises` when entering edit mode
  - `isDirty` = JSON.stringify comparison
- On save: call `useUpdateWorkoutMutation` -> exit edit mode
- On cancel: if dirty -> show discard modal, else exit edit mode
- Remove `DeleteWorkoutModal`, `handleDelete`, `showDeleteModal` (no whole-workout delete)
- Sticky footer: "Start Workout" (read mode) / "Save Changes" (edit mode, disabled if !isDirty)

### Edit Exercise Bottom Sheet

**New file**: `components/workout-detail/edit-exercise-sheet.tsx`

A `Modal` (transparent, animationType="slide") styled as a bottom sheet:

- **Visual**: dark background overlay + rounded-top sheet panel from bottom
- **Grab handle**: small gray bar at top center
- **Content** (inside `KeyboardAwareScrollView`):
  - Exercise name as sheet title (read-only, bold)
  - Muscle group pills (read-only)
  - Editable fields:
    - **Sets**: number-pad input
    - **Reps**: text input (supports "8-10", "AMRAP")
    - **Notes**: multiline text input with placeholder "Add notes..."
  - "Done" button (brand accent) at bottom
- **Dismiss**: tap overlay, tap Done, or swipe down
- On Done: calls `onUpdate(updatedExercise)` -> parent updates `editableExercises` state

### Exercise Row — Dual Mode

**File**: `components/workout-detail/detail-exercise-row.tsx` (refactor)

**Read mode** (default):
- Current layout: order number, name, muscle pills, sets x reps, weight, notes
- Small pencil icon (tertiary color, right side) to hint editability
- No swipe, not tappable

**Edit mode** (`isEditing === true`):
- Wrapped in `SwipeableRow` with red delete action
- Entire card is tappable (opens Edit Exercise Sheet)
- Small pencil icon becomes brand-accent color
- `LinearTransition` layout animation when deleted (list reflows)
- Radius handling on swipe matches the `SwipeableRow` pattern

### Data Flow

```
WorkoutDetailContent
  state: isEditing, editableExercises, selectedExerciseIndex
  ├── DetailHeader (isEditing, onToggleEdit, onSave, onCancel)
  ├── ScrollView
  │   └── DetailExerciseRow[]
  │         isEditing -> wraps in SwipeableRow
  │         onTap -> sets selectedExerciseIndex (opens sheet)
  │         onDelete -> removes from editableExercises
  ├── EditExerciseSheet (visible when selectedExerciseIndex !== null)
  │     exercise data -> edit fields -> onUpdate callback
  └── Sticky footer: "Start Workout" | "Save Changes"
```

---

## Phase 4: Cleanup

- **Delete** `app/(protected)/edit-workout.tsx` route
- **Delete** `components/edit-workout/edit-workout-content.tsx`
- **Remove** `edit-workout` screen config from `app/(protected)/_layout.tsx`
- **Remove** edit-workout navigation from `workout-detail-content.tsx` (`handleEdit` -> `router.push(edit-workout)`)
- **Move** `DeleteWorkoutModal` to shared location (`components/ui/`) since it's used by My Workouts swipe
- Update `detail-header.tsx` to remove `onDelete` prop + trash icon
- Verify no dead imports or references to `edit-workout` route remain

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/ui/swipeable-row.tsx` | Reusable swipe-to-reveal component |
| `components/my-workouts/workout-card.tsx` | Redesigned workout card |
| `components/my-workouts/empty-state.tsx` | Extracted empty state |
| `components/workout-detail/edit-exercise-sheet.tsx` | Bottom sheet for editing exercise details |

## Files to Modify

| File | Change |
|------|--------|
| `app/(protected)/(tabs)/my-workouts.tsx` | Use new card, wrap in SwipeableRow, add animations |
| `components/workout-detail/workout-detail-content.tsx` | Add edit mode, remove delete button/modal |
| `components/workout-detail/detail-header.tsx` | Remove trash, add edit toggle/save/cancel |
| `components/workout-detail/detail-exercise-row.tsx` | Dual read/edit mode, inline editing, swipe delete |
| `components/workout-detail/delete-workout-modal.tsx` | Move to `components/ui/` |
| `app/(protected)/_layout.tsx` | Remove edit-workout screen |

## Files to Delete

| File | Reason |
|------|--------|
| `app/(protected)/edit-workout.tsx` | Replaced by inline edit |
| `components/edit-workout/edit-workout-content.tsx` | No longer needed |

---

## Verification

1. **My Workouts list**: cards show lime icons, description, thumbnail, creator. Swipe left reveals red delete button with correct radius (card: no right radius, button: no left radius). Delete triggers confirmation modal then removes from list with layout animation
2. **Workout Detail (read mode)**: no delete/trash icon in header, pencil icon visible. Exercise rows are read-only with subtle pencil hint. "Start Workout" sticky at bottom
3. **Workout Detail (edit mode)**: tap pencil -> header shows Cancel + Save. Tap exercise card -> bottom sheet opens with editable sets/reps/notes. Edit and tap Done -> changes reflected in list. Swipe exercise left -> delete with correct radius. Save persists via API. Cancel (if dirty) shows discard modal
4. **Bottom sheet**: slides up from bottom, dark overlay, grab handle. Keyboard avoidance works for notes field. Dismiss via overlay tap, Done button, or swipe down
5. **Navigation**: no route to edit-workout exists. Back from detail returns to My Workouts
6. **Gestures**: swipe doesn't conflict with vertical scroll. Only one row open at a time. Haptic on threshold cross
