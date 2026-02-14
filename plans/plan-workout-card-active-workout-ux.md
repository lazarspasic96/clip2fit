# Plan: Today's Workout Card & Active Workout UX Overhaul

## Context
User wants to fix the today's workout card (remove platform icons, rest button, add smart Start/Continue), fix the active workout screen (show tabs, back button, fix finish button style, bottom sheet instead of overlay), and handle abandoned sessions.

API compatibility verified: `POST /api/sessions`, `GET /api/sessions/last` — client types match server spec.

---

## Phase 1: Lift ActiveWorkoutProvider + Context Changes

### `contexts/active-workout-context.tsx`
- Add `clearSession()` method → `setSession(null)`
- Expose `activeWorkoutId: string | null` → derived from `session?.plan.id ?? null`
- Add both to `WorkoutContextValue` interface

### `app/(protected)/_layout.tsx`
- Wrap `<Stack>` with `<ActiveWorkoutProvider>`
- Remove `<Stack.Screen name="active-workout" .../>` entry (moves to tabs in Phase 2)

---

## Phase 2: Route Restructuring — Tabs Visible

### Create `app/(protected)/(tabs)/(home)/_layout.tsx`
Stack navigator with `headerShown: false`, two screens: `index` and `active-workout`

### Move files
- `app/(protected)/(tabs)/index.tsx` → `app/(protected)/(tabs)/(home)/index.tsx` (no content changes)
- `app/(protected)/active-workout.tsx` → `app/(protected)/(tabs)/(home)/active-workout.tsx`
  - Remove `ActiveWorkoutProvider` + `BottomSheetModalProvider` wrappers (provider now at layout level)
  - Simplify to just `<ActiveWorkoutContent />`

### `app/(protected)/(tabs)/_layout.tsx`
- `<Tabs.Screen name="index" />` → `<Tabs.Screen name="(home)" />`

### `components/ui/custom-tab-bar.tsx`
- TAB_CONFIG key: `index` → `'(home)'`

### Update navigation paths
- `todays-workout-card.tsx`: `/(protected)/active-workout?id=` → relative or updated path
- Any other refs to the old route

---

## Phase 3: Today's Workout Card

### `components/home/todays-workout-card.tsx`
**Remove:**
- `PLATFORM_ICONS` constant + platform icon `<Image>` rendering
- "Rest" `<Pressable>` button
- Creator handle row with platform icon (keep just the text handle)

**Add:**
- `useActiveWorkout()` hook → read `activeWorkoutId`
- Derive `isActive = activeWorkoutId === workout.id`
- Conditional button area:
  - `isActive === false` → "Start Workout" (green) + "View" (secondary) — current layout minus Rest
  - `isActive === true` → "Continue" only (green, navigates to active-workout — resumes session). Hide "View" button.

---

## Phase 4: Finish Workout Bottom Sheet

### Create `components/workout/finish-workout-sheet.tsx`
Follow `ConfirmationSheet` pattern using `@gorhom/bottom-sheet`

**Two-phase sheet** (confirmation → results):

Props: `visible`, `onFinish`, `onKeepGoing`, `onDone`, `saveResult: ApiSaveSessionResponse | null`, `saveError: boolean`, `isSaving: boolean`

**Phase A — Confirmation (before save, `saveResult === null && !isSaving`):**
1. Title: "Finish Workout?"
2. Stats: exercises completed (X/Y), duration
3. Warning (amber text, if exercises remain): "You have X exercises left"
4. Two buttons: "Finish" (green accent, calls `onFinish`) | "Keep Going" (secondary, calls `onKeepGoing` → dismisses sheet)

**Phase B — Results (after save, `saveResult !== null || saveError`):**
1. Title: "Workout Complete"
2. Stats row: duration (min) | exercises (X/Y) | volume (kg)
3. PR section: PR list → "No new PRs" → error state
4. "Done" button (green accent, calls `onDone`)

**Transition**: `isSaving === true` → show loading state on "Finish" button (spinner/disabled)

Move `computeTotalVolume` + `formatVolume` from overlay to this file.

### Delete `components/workout/finish-workout-overlay.tsx`

---

## Phase 5: Active Workout Content Refactor

### `components/workout/active-workout-content.tsx`

**5a — Session resume logic:**
Update the startup `useEffect`:
- If `session !== null && session.plan.id === id` → already active, skip `startWorkout()`, set `hasStarted.current = true`
- If `session !== null && session.plan.id !== id` → different workout active. Alert: "You have an active workout. Start a new one?" → "Start new" calls `clearSession()` then proceeds; "Cancel" navigates back
- If `session === null` → current behavior (load, enrich, startWorkout)

**5b — Remove discard confirmation sheet:**
- Remove `showDiscard` state, `handleSaveAndExit`, `handleDiscard`
- Remove `<ConfirmationSheet>` render
- `onClose` (now `onBack`) simply calls `router.back()`

**5c — Replace overlay with finish sheet (two-phase flow):**
- Add `showFinishSheet` state (boolean)
- `CommandCenterWorkout` "Finish Workout" press → `setShowFinishSheet(true)` (does NOT call `finishWorkout()` yet)
- Sheet opens in confirmation phase (Phase A): shows progress + warning
- "Keep Going" → `setShowFinishSheet(false)` → user continues workout
- "Finish" → `finishWorkout()` → auto-save triggers → sheet transitions to results phase (Phase B)
- "Done" → `clearSession()` → navigate back
- Render: `<FinishWorkoutSheet visible={showFinishSheet} onFinish={handleFinish} onKeepGoing={handleKeepGoing} onDone={handleDone} saveResult={saveResult} saveError={saveError} isSaving={saveSession.isPending} />`

**5d — Padding for tab bar:**
- Add `paddingBottom: TAB_BAR_HEIGHT` to content area so finish button sits above tab bar

---

## Phase 6: Header + Finish Button Style

### `components/workout/command-center/workout-header.tsx`
- Replace `X` icon with `ChevronLeft` from lucide-react-native
- Rename prop `onClose` → `onBack`
- Adjust icon size to 24

### `components/workout/command-center/command-center-workout.tsx`
- Rename `onClose` → `onBack` prop
- **Fix finish button**: remove conditional opacity
  ```
  Before: ${isWorkoutComplete ? 'bg-brand-accent' : 'bg-brand-accent/60'}
  After:  bg-brand-accent
  ```

---

## Phase 7: Abandoned Sessions (Proposal)

**MVP approach**: Session lives in context at layout level. If user navigates away, they can return via "Continue" button. If app is killed, session is lost — no persistent storage.

**Future enhancement (not in this PR):**
1. Persist active session to AsyncStorage/MMKV on every state change
2. On app launch, check for stale session and prompt resume
3. Server-side TTL: auto-close partial sessions after 24h

No code changes for Phase 7 in this implementation. The lifted context already provides in-session persistence.

---

## Verification
1. Start workout from home → active-workout screen shows with tabs visible
2. Press back → home shows "Continue" button instead of "Start Workout"
3. Tap "Continue" → resumes same session (same exercise, same progress)
4. Press "Finish Workout" → bottom sheet opens with progress + PRs
5. Press "Done" → navigates to home, button reverts to "Start Workout"
6. Switch tabs during workout → tab bar works, returning to Home shows "Continue"
7. Finish button always looks clickable (full green, no dimming)

---

## Unresolved Questions
1. **Tab bar padding**: Need to verify visual spacing between sticky "Finish Workout" footer and the tab bar. May need layout adjustments.
2. **"View" button on workout-detail screen**: Should it also show "Continue" if active session exists? (Out of scope for now)
