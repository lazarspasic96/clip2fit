# Active Workout Screen — 3 UI Designs with Toggle

## Context

When user taps "Start" on [todays-workout-card.tsx](components/home/todays-workout-card.tsx), we open a full-screen active workout session. The screen must track exercises, sets, reps, weight, rest timers, and elapsed time. We're building **3 distinct UI designs** with a toggle to switch between them so you can compare and pick one.

---

## Phase 0: Shared Foundation

All 3 designs share the same types, state management, hooks, and utility components.

### New files to create

**Types** — `types/workout.ts`
- `WorkoutSet` — id, setNumber, targetReps/Weight, actualReps/Weight, previousReps/Weight, status (pending|active|completed|skipped), isPR, restDurationSeconds
- `WorkoutExercise` — id, name, muscleGroups, sets[], order, status, notes (AI-extracted), sourceVideoUrl
- `WorkoutPlan` — id, title, description, platform, creatorHandle, sourceUrl, thumbnailUrl, exercises[], estimatedDuration, difficulty, equipment
- `WorkoutSession` — id, plan, status (not_started|in_progress|paused|rest_timer|completed), startedAt, activeExerciseIndex, activeSetIndex

**Mock data** — `utils/mock-workout-session.ts`
- Full `WorkoutPlan` with 6 exercises, 3-4 sets each, pre-populated `previousReps/Weight` data
- One set configured to trigger PR when entered higher

**Constants** — `constants/workout.ts`
- DEFAULT_REST_SECONDS = 90, REST_WARNING_SECONDS = 5

**Context** — `contexts/active-workout-context.tsx`
- `useReducer`-based state machine (matches existing `ProfileFormProvider` pattern)
- Actions: START_WORKOUT, COMPLETE_SET, SKIP_SET, ADD_SET, SKIP_EXERCISE, NAVIGATE_EXERCISE, START_REST_TIMER, TICK_REST_TIMER, SKIP_REST, PAUSE, RESUME, FINISH
- Exposes computed selectors: currentExercise, currentSet, progress, formattedElapsed

**Hooks**
- `hooks/use-elapsed-timer.ts` — workout clock, pause-aware, `useRef` for accumulated time
- `hooks/use-rest-timer.ts` — wraps existing [use-countdown.ts](hooks/use-countdown.ts), adds haptics via `expo-haptics`

**Shared components** — `components/workout/`
- `set-check-button.tsx` — lime circle check, spring scale animation, haptic on press
- `weight-input.tsx` — minimal numeric input (underline only, no box border)
- `reps-input.tsx` — same pattern
- `previous-performance.tsx` — dimmed italic "60kg x 12"
- `pr-badge.tsx` — lime "PR" badge with pop-in animation
- `exercise-notes.tsx` — expandable AI-extracted notes
- `source-video-button.tsx` — opens original TikTok/IG video
- `creator-attribution.tsx` — platform icon + @handle (reuse PLATFORM_ICONS from todays-workout-card)
- `rest-timer-overlay.tsx` — full-screen countdown (used by Design 1 & 2)
- `finish-workout-summary.tsx` — completion stats (time, volume, sets, PRs)
- `discard-workout-modal.tsx` — confirmation when closing early

**Route** — `app/(protected)/active-workout.tsx`
- Register in [_layout.tsx](app/(protected)/_layout.tsx) as `fullScreenModal` with `gestureEnabled: false`
- Receives workout ID via route params
- Contains **design toggle** (3 buttons at top to switch views during development)

**Wire Start button** — Update [todays-workout-card.tsx](components/home/todays-workout-card.tsx):
- `onPress={() => router.push('/(protected)/active-workout?id=workout-1')}`

---

## Phase 1: Design 1 — "Story Mode"

**Concept:** One exercise at a time, full-screen immersive. Instagram Stories-style segmented progress at top. Swipe horizontally between exercises. Large typography. Rest timer = full-screen breathing ring.

**Why it's unique:** Mirrors how the user originally consumed the workout on TikTok/IG. Content-first, distraction-free. Most Gen-Z aligned.

**Layout:**
```
[===|===|   |   |   |   ]  ← segmented progress (one per exercise, lime fills)
01                          ← faint watermark number (opacity 0.04)
Bench Press                 ← exercise name, 28px bold
Chest, Triceps              ← muscle group pills

┌─────────────────────┐
│ SET 1    60kg x 12  │  ← pill-shaped set rows
│ [60] kg  [12] reps  │
│         [check]     │
│ prev: 55kg x 10     │
└─────────────────────┘
┌─────────────────────┐
│ SET 2               │
│ ...                 │
└─────────────────────┘

+ Add Set

Notes: "Keep elbows tucked..."
[Watch Video]

● ● ○ ○ ○ ○            ← swipe dots
Skip Exercise
```

**Key interactions:**
- Swipe left/right between exercises (horizontal FlatList/PagerView)
- Set rows are floating pills with subtle glassmorphism (bg-background-tertiary)
- Check → haptic + spring scale + lime tint → auto-trigger rest overlay after 500ms
- Rest overlay: full-screen black (0.95 opacity), large lime ring depleting, "Skip" button
- All sets done → card scales down + fades → auto-swipe to next exercise
- Exercise complete → progress segment fills lime

**Components** — `components/workout/story-mode/`
- `story-mode-workout.tsx` — main container
- `story-progress-bar.tsx` — segmented bar (one segment per exercise)
- `exercise-carousel.tsx` — horizontal FlatList
- `story-exercise-card.tsx` — full-screen card for one exercise
- `story-set-row.tsx` — pill-shaped set row
- `breathing-ring.tsx` — SVG circular countdown for rest timer

**Pros:** Most immersive, largest tap targets, mirrors social media UX, calming rest timer
**Cons:** No workout overview at glance, carousel + keyboard tricky, more animation work

---

## Phase 2: Design 2 — "Command Center"

**Concept:** Scrollable accordion list. All exercises visible. Active = expanded with set table. Completed = collapsed with checkmark. Sticky header with timer. "Previous performance" column prominent. Power-user friendly.

**Why it's unique:** The set table with PREVIOUS column creates a "beat your past self" motivation loop. Dense but premium. Spreadsheet precision with beautiful typography.

**Layout:**
```
Chest & Triceps      01:23:45  [||] [X]  ← sticky header
[====|====|    |    |    |    ]           ← progress segments

▼ Bench Press                    ✓ 4/4   ← completed, collapsed
▼ Incline DB Press               ✓ 3/3   ← completed, collapsed

▽ Cable Fly (expanded)                    ← active exercise
  Chest
  ┌────┬──────────┬─────┬─────┬───┐
  │SET │ PREVIOUS │  KG │REPS │ ✓ │
  ├────┼──────────┼─────┼─────┼───┤
  │ 1  │ 15 x 12  │ 15  │ 12  │ ✓ │  ← lime tint
  │●2  │ 15 x 10  │ [_] │ [_] │ ○ │  ← pulsing dot = active
  │ 3  │ 12 x 10  │     │     │ ○ │
  └────┴──────────┴─────┴─────┴───┘
  + Add Set
  Notes: "Squeeze at peak..."
  [Watch Video]

▶ Tricep Pushdown              3 sets    ← upcoming, collapsed
▶ Skull Crushers               3 sets    ← upcoming, collapsed

              [Finish Workout]            ← sticky footer
```

**Key interactions:**
- Accordion: single expand, tapping one collapses others
- Expand/collapse = animated height (spring, 300ms)
- Active set row has pulsing lime dot on left edge
- Check → haptic + row lime tint + pulsing dot moves down
- All sets done → accordion collapses → next auto-expands → scroll to it
- Previous column in italic dimmed text — instant comparison
- PR badge pops in beside check when weight exceeds previous
- Keyboard: use `KeyboardAwareScrollView` from react-native-keyboard-controller
- Finish button: ghost when incomplete, fills lime when all done

**Components** — `components/workout/command-center/`
- `command-center-workout.tsx` — main container
- `sticky-header.tsx` — title, timer, pause, close
- `exercise-accordion.tsx` — expandable card
- `accordion-header.tsx` — collapsed row (name + status)
- `set-table.tsx` — table with columns
- `set-table-row.tsx` — individual set row with inputs
- `active-row-indicator.tsx` — pulsing lime dot

**Pros:** Full overview, previous performance is motivating, keyboard-natural, scales to many exercises
**Cons:** More utilitarian, less "fun," accordion animation must be perfect, denser UI

---

## Phase 3: Design 3 — "Flow State"

**Concept:** Active exercise dominates 65% of screen. Draggable bottom sheet shows workout queue (3 snap points: peek/half/full). Set tracker = horizontal card carousel. Floating "Dynamic Island" timer at top. Spatial depth metaphor.

**Why it's unique:** The Dynamic Island timer that expands for rest is a premium micro-interaction nobody else has. Bottom sheet creates a music-playlist-like queue. Set cards feel like a card game — swipe through, check to flip.

**Layout:**
```
    ┌──────────────────────┐
    │ 01:23:45  ◯  [||]   │  ← floating island (blur bg)
    └──────────────────────┘
              (expands to full-width during rest timer)

    Bench Press
    4 sets x 12 reps
    Chest, Triceps

    ┌──────┐  ┌──────┐  ┌──────┐
    │ SET 1│  │ SET 2│  │ SET 3│  ← horizontal card carousel
    │ 60kg │  │ [__] │  │      │     active card = scale 1.0
    │ 12rep│  │ [__] │  │      │     others = scale 0.85, dimmed
    │  ✓   │  │  ○   │  │  ○   │
    │prev: │  │      │  │      │
    │55x10 │  │      │  │      │
    └──────┘  └──────┘  └──────┘

    Notes    [Watch Video]

  ─────────── ← sheet handle ───────────
    Up Next: Incline DB Press
    ┌ Cable Fly          3 sets    ○  ┐
    │ Tricep Pushdown    3 sets    ○  │  ← queue list
    │ Skull Crushers     3 sets    ○  │
    └ @user392 via Instagram          ┘
```

**Key interactions:**
- Set cards: horizontal scroll, active = centered at scale 1.0, adjacent = 0.85 + opacity 0.6
- Check → card flips (rotateY 180) to reveal checkmark face → auto-scrolls to next
- Rest: floating island expands width (120px → screen-40px), shows countdown ring on right side
- Bottom sheet: 3 snap points — peek (15%, just "Up Next"), half (50%, full queue), full (85%)
- Exercise complete: current fades down, next rises up from sheet
- Sheet supports drag-to-reorder (session only, not permanent)
- Close button (X) top-right, above island

**Components** — `components/workout/flow-state/`
- `flow-state-workout.tsx` — main container
- `floating-timer-island.tsx` — Dynamic Island timer with rest expansion
- `progress-ring.tsx` — small SVG ring (32px)
- `active-exercise-stage.tsx` — top 65% area
- `set-card-carousel.tsx` — horizontal card scroller
- `set-card.tsx` — individual set card (front/back for flip)
- `queue-bottom-sheet.tsx` — draggable sheet
- `queue-item.tsx` — exercise in queue list

**New dep needed:** `@gorhom/bottom-sheet` (or custom with gesture-handler + reanimated)

**Pros:** Best spatial metaphor, Dynamic Island is delightful, progressive disclosure, thumb-friendly
**Cons:** Highest complexity, new dependency, sheet + keyboard is tricky, card flip may feel gimmicky

---

## Design Toggle Implementation

In `app/(protected)/active-workout.tsx`:
- State: `useState<'story' | 'command' | 'flow'>('command')`
- 3 pill buttons at very top (below safe area): "Story" | "Command" | "Flow"
- Conditionally render the chosen design component
- Toggle is dev-only — remove when final design is chosen

---

## Implementation Order

1. **Phase 0** — Types, constants, mock data, context, hooks, shared components, route, wire Start button (~15 components/files)
2. **Phase 1** — Story Mode (~6 components)
3. **Phase 2** — Command Center (~7 components)
4. **Phase 3** — Flow State (~7 components + new dep)
5. **Polish** — Pick winner, remove toggle + unused designs

## Verification

- Start Expo dev server (`npm start`)
- Navigate to home screen with active state
- Tap "Start" on TodaysWorkoutCard → active-workout screen opens
- Toggle between 3 designs
- Test: enter weight/reps → check set → rest timer fires → auto-advance
- Test: complete all sets → exercise advances → complete all exercises → summary
- Test: close button → discard confirmation
- Test: pause/resume → elapsed timer freezes/continues
- Test keyboard interaction in each design (especially Command Center with many inputs)

## Unresolved Questions

1. **Weight unit** — kg or lbs default? Should pull from user profile/onboarding?
2. **Default rest time** — 60s or 90s when AI doesn't extract one? Vary by exercise type?
3. **Previous column before history** — Show AI-suggested targets? "First time" placeholder?
4. **Bottom sheet dep** — For Flow State: add `@gorhom/bottom-sheet` or build custom?
5. **Offline persistence** — Save session to AsyncStorage so it survives app kill? Or lose it?
