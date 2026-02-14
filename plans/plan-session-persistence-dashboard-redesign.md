# Plan: Workout Session Persistence + Finish Workout + Dashboard UI Redesign

## Context

When a user starts a workout and the app gets killed/backgrounded, all progress is **lost** — the session lives only in React Context (RAM). There's also **no Finish button** — the old `finish-workout-overlay.tsx` was deleted. Tabs remain visible during active workouts, and the current UI has tiny TextInput fields impractical for gym use.

This plan: (1) persists sessions to MMKV with silent auto-restore, (2) adds Finish Workout flow with PR celebration, (3) hides tabs during workout, (4) redesigns active workout UI with a Dashboard design (progress ring + bottom sheet steppers).

---

## Phase 1: Session Persistence + Finish Workout + Tab Hiding

### 1A. Silent Auto-Restore with MMKV

**Decision: MMKV** — synchronous, fast, perfect for a single JSON blob. Project uses dev client (native modules already in use).

**Install:** `npx expo install react-native-mmkv`

**Create `utils/session-storage.ts`:**
- `const storage = new MMKV({ id: 'active-workout' })`
- `saveSession(session)` — `storage.set('session', JSON.stringify(session))`
- `loadSession(): WorkoutSession | null` — parse or return null
- `clearPersistedSession()` — `storage.delete('session')`
- All try/catch wrapped; parse failure clears corrupt data

**Modify `contexts/active-workout-context.tsx`:**
- On mount: `loadSession()` → if found, silently set as active session (no prompt)
- Refactor mutations with auto-save helper:
  ```typescript
  const updateAndPersist = (updater: (prev: WorkoutSession) => WorkoutSession) => {
    setSession((prev) => {
      if (prev === null) return prev
      const next = updater(prev)
      saveSession(next)
      return next
    })
  }
  ```
- `startWorkout`: save after `buildInitialSession`
- `completeSet`, `skipExercise`, `navigateExercise`: use `updateAndPersist`
- `clearSession()`: call `clearPersistedSession()` then `setSession(null)`

---

### 1B. Finish Workout

**Add types to `types/api.ts`:**
```typescript
ApiSessionPayload { workout_id, status, started_at, completed_at, exercises[] }
ApiSessionExercise { exercise_id, status, order, sets[] }
ApiSessionSet { set_number, target_reps, target_weight, actual_reps, actual_weight, status }
ApiSessionResponse { id, prs: ApiPR[] }
ApiPR { exercise_name, exercise_id, catalog_exercise_id, new_weight, previous_weight }
```

**Create `hooks/use-finish-workout.ts`:**
- `useMutation` → `apiPost<ApiSessionResponse>('/api/sessions', payload)`
- `buildSessionPayload(session)` maps context state → API shape
- `status`: all exercises completed/skipped → `'completed'`, otherwise `'partial'`
- `'active'` exercises mapped to `'pending'` for the API
- Invalidates `queryKeys.schedule.current` on success

**Create `components/workout/finish-workout-sheet.tsx`:**
- Reuses `ConfirmationSheet` pattern (already in `components/ui/confirmation-sheet.tsx`)
- Shows: X exercises completed, Y skipped, Z pending
- Warning if pending exercises remain
- Actions: "Keep Going" (dismiss) + "Finish Workout" (brand-accent)
- Loading/error states

**Create `components/workout/pr-celebration.tsx`:**
- Full-screen overlay with Reanimated FadeIn/FadeOut
- Trophy icon (lucide) + PR list: "Bench Press: 65kg (was 60kg)"
- "Nice!" dismiss button, auto-dismiss 5s
- `Haptics.notificationAsync(Success)`

**Modify `components/workout/command-center/workout-header.tsx`:**
- Layout swap: ← back (left) → title (center) → "Finish" pill (right, bg-brand-accent)
- Add `onFinish` prop

**Modify `components/workout/command-center/command-center-workout.tsx`:**
- Add `showFinishSheet`, `prs`, `showPrCelebration` state
- Use `useFinishWorkout` hook
- Flow: Finish tap → sheet → confirm → API → clear session → PRs → navigate back

**Add to `constants/query-keys.ts`:** `sessions.last` key

---

### 1C. Tab Hiding

**Modify `components/ui/custom-tab-bar.tsx`:**
- Import `useActiveWorkout`, read `session`
- If `session !== null` → return `null`
- Wrap existing return in Reanimated `Animated.View` with `FadeIn.duration(200)` for smooth reappear

**Modify `components/workout/active-workout-content.tsx`:**
- Replace `paddingBottom: TAB_BAR_HEIGHT` → `paddingBottom: insets.bottom`

---

### Phase 1 Execution Order

1. Install `react-native-mmkv`
2. Create `utils/session-storage.ts`
3. Modify `contexts/active-workout-context.tsx` (persistence + auto-restore)
4. Modify `components/ui/custom-tab-bar.tsx` (tab hiding)
5. Modify `components/workout/active-workout-content.tsx` (remove tab padding)
6. Add types to `types/api.ts`
7. Add query key to `constants/query-keys.ts`
8. Create `hooks/use-finish-workout.ts`
9. Create `components/workout/finish-workout-sheet.tsx`
10. Create `components/workout/pr-celebration.tsx`
11. Modify `components/workout/command-center/workout-header.tsx` (Finish button)
12. Modify `components/workout/command-center/command-center-workout.tsx` (finish flow)

---

## Phase 2: "The Dashboard" — Gym-Friendly Active Workout Redesign

### Design Overview

Split-screen layout: top section shows progress ring + live stats (constant motivation), bottom section is a `@gorhom/bottom-sheet` (already installed) with inline steppers for the current set.

```
┌──────────────────────────────────┐
│  ←        BENCH PRESS     Finish │  header (48px)
├──────────────────────────────────┤
│            ┌───────┐             │
│            │  62%  │             │  circular progress ring (120px)
│            │ 32:15 │             │  elapsed timer inside
│            └───────┘             │
│                                  │
│   5/8 exs   12/24 sets   32m    │  stats row (3 columns)
│  ▓▓▓▓▓▓▓░░░░░ segmented bar    │  exercise progress
├── bottom sheet (draggable) ──────┤
│                                  │
│  Set 3 of 4          ● ● ◯ ◯   │  set dots
│                                  │
│  [ - ]    65 kg    [ + ]        │  weight stepper (40x40 buttons)
│  [ - ]    10 reps  [ + ]       │  reps stepper
│                                  │
│  Previous: 60kg × 10            │  tertiary text
│                                  │
│  ┌──────────────────────────────┐│
│  │         LOG SET              ││  CTA (48px, brand-accent)
│  └──────────────────────────────┘│
│                                  │
│  [ Skip Set ]  [ Skip Exercise ] │  secondary actions
└──────────────────────────────────┘
```

### Component Breakdown

All in `components/workout/dashboard/`:

**`dashboard-workout.tsx`** — Top-level container
- Top section (fixed ~40%): header + progress ring + stats + segmented bar
- Bottom section: `BottomSheet` with snap points `['45%', '80%']`
- At 80%: shows all sets list below the current set card

**`progress-ring.tsx`** — SVG circular progress
- 120x120, uses `react-native-svg` Circle with `strokeDasharray`/`strokeDashoffset`
- Animated with Reanimated `useAnimatedProps` + `withTiming`
- Center: elapsed timer (using `useEffect` interval)
- Ring color: brand-accent (`#84cc16`)

**`stats-row.tsx`** — Three-column stats
- Exercises: "5/8" with label "exercises"
- Sets: "12/24" with label "sets"
- Time: "32:15" with label "elapsed"
- Uses existing `Colors.content.secondary` for labels

**`set-stepper-card.tsx`** — Current set with inline steppers
- Set indicator: "Set 3 of 4" + filled/empty dots
- Two `InlineStepper` components side by side
- Previous performance text below
- Full-width "Log Set" button
- Pre-filled from target values; updates via stepper buttons

**`inline-stepper.tsx`** — Reusable `[- VALUE+]` control
- 40x40 touch target buttons (meets Apple HIG minimum)
- Value display: 32px bold font, 80px wide
- Configurable: step size (default: 2.5kg for weight, 1 for reps), min/max, unit label
- Long-press for continuous increment (requestAnimationFrame loop)
- Haptic on each step (`Haptics.impactAsync(Light)`)
- Tap the number to open keyboard input as fallback

**`set-dots.tsx`** — Horizontal dot indicator
- Filled circle = completed, accent border = active, empty = pending
- 12px dots with 6px gap

**`exercise-header.tsx`** — Exercise name + navigation
- Exercise name (20px bold), muscle group pills
- Swipe left/right to change exercise (PanGesture)
- Or tap segmented bar segments to jump

**`all-sets-list.tsx`** — Expanded view when sheet at 80%
- Compact list of all sets for current exercise
- Completed: green bg, actual values, checkmark
- Active: accent border (current)
- Pending: muted, target values

### Files to Create

| File | Lines (est.) | Purpose |
|------|-------------|---------|
| `components/workout/dashboard/dashboard-workout.tsx` | ~120 | Top-level layout with BottomSheet |
| `components/workout/dashboard/progress-ring.tsx` | ~80 | SVG circular progress + timer |
| `components/workout/dashboard/stats-row.tsx` | ~40 | Three-column live stats |
| `components/workout/dashboard/set-stepper-card.tsx` | ~100 | Current set input card |
| `components/workout/dashboard/inline-stepper.tsx` | ~90 | Reusable [-VALUE+] control |
| `components/workout/dashboard/set-dots.tsx` | ~30 | Horizontal dot indicator |
| `components/workout/dashboard/exercise-header.tsx` | ~80 | Name + muscle pills + swipe nav |
| `components/workout/dashboard/all-sets-list.tsx` | ~60 | Full sets list in expanded sheet |

### Integration

**Modify `components/workout/active-workout-content.tsx`:**
- Replace `CommandCenterWorkout` import with `DashboardWorkout`
- Pass same `onBack` prop

### Shared State

All dashboard components consume `useActiveWorkout()` from context. The existing actions (`completeSet`, `skipExercise`, `navigateExercise`) work unchanged — the dashboard is purely a UI layer swap.

---

## Critical Files Summary

| File | Action | Phase |
|------|--------|-------|
| `contexts/active-workout-context.tsx` | Modify | 1A |
| `utils/session-storage.ts` | Create | 1A |
| `components/ui/custom-tab-bar.tsx` | Modify | 1C |
| `components/workout/active-workout-content.tsx` | Modify | 1C, 2 |
| `components/workout/command-center/workout-header.tsx` | Modify | 1B |
| `components/workout/command-center/command-center-workout.tsx` | Modify | 1B |
| `hooks/use-finish-workout.ts` | Create | 1B |
| `components/workout/finish-workout-sheet.tsx` | Create | 1B |
| `components/workout/pr-celebration.tsx` | Create | 1B |
| `types/api.ts` | Modify | 1B |
| `constants/query-keys.ts` | Modify | 1B |
| `components/workout/dashboard/*.tsx` (8 files) | Create | 2 |

---

## Verification

### Phase 1
1. Start workout, complete 2 sets → force-kill app → relaunch → navigate to same workout → verify sets preserved
2. Start workout → verify tabs hidden → finish/exit → verify tabs reappear
3. Tap Finish → verify sheet shows correct summary (X completed, Y pending)
4. Confirm Finish → verify API call succeeds (`POST /api/sessions`), session clears
5. Finish with PRs → verify celebration overlay + haptic
6. Finish with pending exercises → verify `"partial"` status sent

### Phase 2
7. Verify progress ring animates smoothly as sets complete
8. Verify stepper buttons are >= 40px touch targets
9. Verify inline steppers work: tap +/-, long-press continuous, tap number for keyboard
10. Verify bottom sheet snaps between 45% and 80%
11. Verify exercise navigation: swipe or tap segmented bar
12. Verify "Log Set" completes set + advances to next
13. Test on device: one-handed use, sweaty fingers, quick glancing
