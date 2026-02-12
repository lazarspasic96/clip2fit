# Active Workout Screen — 3 UI Designs with Toggle

## Context

When user taps "Start" on [todays-workout-card.tsx](components/home/todays-workout-card.tsx), open a full-screen active workout session. User marks exercises/sets complete, optionally enters weight/reps. Building **3 distinct UI designs** with a toggle to compare, then pick one.

## Interview Decisions (v1 scope)

- **No timer** — no elapsed timer, no rest timer, no stopwatch
- **No pause** — no pause/resume
- **No PR detection** — skip for v1
- **No Add Set** — user works with the planned sets only
- **No validation** — check button always enabled, fields can be empty
- **No data persistence** — UI only, data lost on close
- **Ghost placeholders** — inputs empty, target values shown as placeholder text
- **Bodyweight exercises** — hide weight field entirely (exercise-level `isBodyweight` flag)
- **Previous data** — show fake previous performance from mock data (dimmed italic)
- **Small icon** per exercise (muscle group icon, 16-24px beside name)
- **Source video** — deep link to TikTok/IG app (opens external app)
- **Discard** — simple confirmation: "End workout? Progress won't be saved."
- **Summary** — overlay on same screen, minimal stats (time + exercises completed)
- **Instant summary** — no celebration animation, jump straight to stats
- **Mock data** — Push Day (Bench, Incline DB, Cable Fly, Tricep Pushdown, Overhead Ext, Dips)
- **All 3 designs fully functional** — shared context/hooks, different UI skins
- **Bottom sheet** — install `@gorhom/bottom-sheet` for Flow State design
- **Toggle** — 3 pill buttons at very top (above safe area, status bar area)

---

## Phase 0: Shared Foundation

### New types — `types/workout.ts`

```typescript
type SetStatus = 'pending' | 'completed' | 'skipped'
type ExerciseStatus = 'pending' | 'active' | 'completed' | 'skipped'

interface WorkoutSet {
  id: string
  setNumber: number
  targetReps: number
  targetWeight: number | null  // null = bodyweight
  actualReps: number | null
  actualWeight: number | null
  previousReps: number | null  // fake, from mock
  previousWeight: number | null
  status: SetStatus
}

interface WorkoutExercise {
  id: string
  name: string
  muscleGroups: string[]
  sets: WorkoutSet[]
  order: number
  status: ExerciseStatus
  notes: string | null         // AI-extracted
  sourceVideoUrl: string | null
  isBodyweight: boolean        // hides weight field
}

interface WorkoutPlan {
  id: string
  title: string
  description: string
  platform: 'tiktok' | 'instagram' | 'youtube'
  creatorHandle: string
  sourceUrl: string
  thumbnailUrl: string
  exercises: WorkoutExercise[]
  estimatedDurationMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface WorkoutSession {
  id: string
  plan: WorkoutPlan
  status: 'in_progress' | 'completed'
  startedAt: number
  activeExerciseIndex: number
}
```

### Mock data — `utils/mock-workout-session.ts`

Push Day, 6 exercises with fake previous data:
1. Bench Press — 4x10 @ 60kg (prev: 55kg x 10)
2. Incline DB Press — 3x12 @ 22kg (prev: 20kg x 12)
3. Cable Fly — 3x15 @ 15kg (prev: 12kg x 14)
4. Tricep Pushdown — 3x12 @ 25kg (prev: 22kg x 12)
5. Overhead Tricep Extension — 3x12 @ 18kg (prev: 15kg x 11)
6. Dips — 3x10, bodyweight (prev: BW x 8). `isBodyweight: true`

### Context — `contexts/active-workout-context.tsx`

`useReducer`-based. Simplified actions for v1:
- `START_WORKOUT` — init session from plan
- `COMPLETE_SET` — mark set done, store actualReps/Weight
- `SKIP_EXERCISE` — mark all sets skipped, advance
- `NAVIGATE_EXERCISE` — jump to specific exercise index
- `FINISH_WORKOUT` — set status to completed

Computed selectors:
- `currentExercise` — exercise at activeExerciseIndex
- `progress` — { completed: number, total: number }
- `isWorkoutComplete` — all exercises completed/skipped
- `completedAt` — timestamp when finished (for summary time calc)

### Shared components — `components/workout/`

| Component | File | Purpose |
|-----------|------|---------|
| SetCheckButton | `set-check-button.tsx` | Lime circle, spring scale anim, haptic |
| WeightInput | `weight-input.tsx` | Underline-only numeric, ghost placeholder |
| RepsInput | `reps-input.tsx` | Same pattern as WeightInput |
| PreviousPerformance | `previous-performance.tsx` | Dimmed italic "55kg x 10" |
| ExerciseNotes | `exercise-notes.tsx` | Expandable AI notes section |
| SourceVideoButton | `source-video-button.tsx` | Deep link to TikTok/IG via Linking |
| CreatorAttribution | `creator-attribution.tsx` | Platform icon + @handle |
| FinishWorkoutOverlay | `finish-workout-overlay.tsx` | Overlay with minimal stats + Done btn |
| DiscardWorkoutModal | `discard-workout-modal.tsx` | Simple "End workout?" confirmation |
| ExerciseIcon | `exercise-icon.tsx` | Small muscle group icon (16-24px) |
| SegmentedProgressBar | `segmented-progress-bar.tsx` | One segment per exercise, lime fill |

### Route setup

**`app/(protected)/active-workout.tsx`** — screen file
- Register in [_layout.tsx](app/(protected)/_layout.tsx): `presentation: 'fullScreenModal'`, `gestureEnabled: false`, `animation: 'slide_from_bottom'`
- Route params: `?id=workout-1`
- Design toggle state: `useState<'story' | 'command' | 'flow'>('command')`
- Toggle pills rendered at absolute top (status bar area), z-index above everything

**Wire Start** — [todays-workout-card.tsx](components/home/todays-workout-card.tsx):
- Import `useRouter`, add `router.push('/(protected)/active-workout?id=workout-1')` on Start press

### Install dependency

```bash
npx expo install @gorhom/bottom-sheet
```

---

## Phase 1: Design 1 — "Story Mode"

One exercise at a time. Swipe between exercises. Full-screen immersive.

```
[===|===|   |   |   |   ]  ← segmented progress
01                          ← faint watermark (opacity 0.04)
🏋 Bench Press              ← icon + name, 28px bold
   Chest, Triceps           ← muscle pills

┌─────────────────────┐
│ SET 1               │  ← pill-shaped rows
│ [__] kg  [__] reps  │     ghost: "60"  "10"
│      [check]        │
│ prev: 55kg x 10     │
└─────────────────────┘
┌─────────────────────┐
│ SET 2 ...           │
└─────────────────────┘

Notes: "Keep elbows tucked..."
[Watch Video]

● ● ○ ○ ○ ○            ← pagination dots
Skip Exercise
```

**Interactions:**
- Horizontal FlatList, one exercise per "page"
- Check → haptic + spring scale + lime row tint
- All sets done → auto-swipe to next exercise
- Skip Exercise → mark skipped, auto-swipe

**Components** — `components/workout/story-mode/`
- `story-mode-workout.tsx`
- `story-progress-bar.tsx`
- `exercise-carousel.tsx`
- `story-exercise-card.tsx`
- `story-set-row.tsx`

---

## Phase 2: Design 2 — "Command Center"

Scrollable accordion list. All exercises visible. Active = expanded.

```
Push Day                          [X]  ← header
[====|====|    |    |    |    ]        ← progress

▼ Bench Press                  ✓ 4/4  ← collapsed, done
▼ Incline DB Press             ✓ 3/3  ← collapsed, done

▽ Cable Fly (expanded)                 ← active
  🏋 Chest
  SET  PREVIOUS   KG    REPS   ✓
   1   15 x 12    15     12    ✓   ← lime tint
  ●2   15 x 10   [__]  [__]   ○   ← active row
   3   12 x 10                 ○
  Notes: "Squeeze at peak..."
  [Watch Video]

▶ Tricep Pushdown           3 sets   ← upcoming
▶ Overhead Extension        3 sets

              [Finish Workout]        ← sticky footer
```

**Interactions:**
- Single-expand accordion (tap collapses others)
- Animated height (spring, 300ms)
- Pulsing lime dot on active set row
- Check → haptic + lime tint + dot advances
- All sets done → collapse + auto-expand next + scroll
- Finish button: ghost when incomplete, lime when all done
- `KeyboardAwareScrollView` from react-native-keyboard-controller

**Components** — `components/workout/command-center/`
- `command-center-workout.tsx`
- `workout-header.tsx`
- `exercise-accordion.tsx`
- `accordion-header.tsx`
- `set-table.tsx`
- `set-table-row.tsx`

---

## Phase 3: Design 3 — "Flow State"

Active exercise dominates screen. Bottom sheet shows queue. Set cards carousel.

```
    Bench Press
    4 sets x 10 reps
    🏋 Chest, Triceps

    ┌──────┐  ┌──────┐  ┌──────┐
    │ SET 1│  │ SET 2│  │ SET 3│  ← card carousel
    │[__]kg│  │      │  │      │     active = scale 1.0
    │[__]rp│  │      │  │      │     others = 0.85, dimmed
    │  ○   │  │      │  │      │
    │55x10 │  │      │  │      │
    └──────┘  └──────┘  └──────┘

    Notes   [Watch Video]   [X]

  ──────── sheet handle ────────
    Up Next: Incline DB Press
    Cable Fly          3 sets  ○
    Tricep Pushdown    3 sets  ○
    @user392 via Instagram
```

**Interactions:**
- Set cards: horizontal scroll, active centered scale 1.0, others 0.85 + opacity 0.6
- Check → card flips (rotateY 180) to checkmark face → auto-scroll next
- Bottom sheet (`@gorhom/bottom-sheet`): 3 snap points — peek (15%), half (50%), full (85%)
- Exercise complete: current fades down, next rises up
- Close button (X) top-right corner

**Components** — `components/workout/flow-state/`
- `flow-state-workout.tsx`
- `active-exercise-stage.tsx`
- `set-card-carousel.tsx`
- `set-card.tsx`
- `queue-bottom-sheet.tsx`
- `queue-item.tsx`

---

## Design Toggle

In `app/(protected)/active-workout.tsx`:
- `useState<'story' | 'command' | 'flow'>('command')`
- 3 pill buttons at absolute top (in status bar area), z-index above all content
- Each pill: `bg-background-tertiary` default, `bg-brand-accent` when active
- Conditionally render: `StoryModeWorkout | CommandCenterWorkout | FlowStateWorkout`
- Dev-only — remove when winner is chosen

---

## Implementation Order

1. **Phase 0** — `npm install @gorhom/bottom-sheet`, types, mock data, context, shared components, route, wire Start button
2. **Phase 1** — Story Mode (5 components)
3. **Phase 2** — Command Center (6 components)
4. **Phase 3** — Flow State (6 components)

## Key Files Modified

- [app/(protected)/_layout.tsx](app/(protected)/_layout.tsx) — add active-workout route
- [components/home/todays-workout-card.tsx](components/home/todays-workout-card.tsx) — wire Start button
- [utils/mock-data.ts](utils/mock-data.ts) — keep untouched, new mock in separate file

## Verification

- `npm start` → home screen (active state) → tap Start → active-workout opens
- Toggle between 3 designs via top pills
- Check sets (with/without entering data) → exercise advances
- Complete all exercises → summary overlay with time + exercises count
- Tap X → discard confirmation → back to home
- Test keyboard with weight/reps inputs in each design
