# Handoff: Smart Targets Phase 1 — Uncommitted, Ready to Ship

## For the Next Agent

**Status:** Phase 1 Smart Targets is code-complete (Phases A–E all done). All changes are **uncommitted on `main`**. Tests verified passing (56/56) as of 2026-04-02.

**Your first task:** Create a feature branch, commit all changes, and ship via PR. The user has reviewed the work and understands what was built — no re-explanation needed.

**Do NOT re-debate architecture decisions** — they were locked in prior sessions (see table below).

Full implementation plan: `plans/plan-smart-targets-phase1.md`

---

## Goal

Build formula-based weight suggestions ("smart targets") on the active workout screen. When a user starts a workout, eligible exercises show a chip suggesting the next weight based on their performance history. No LLM, pure progression logic.

This is Phase 1 of the AI Personal Trainer feature (5 phases total). Phase 1 must ship before any LLM-powered features.

---

## Current Progress — ALL PHASES DONE

### Phase B: Progression Utils + Tests — DONE

**Files created:**
- `utils/progression.ts` — 6 exported functions: `parseTargetReps`, `getProgressionTarget`, `muscleGroupCategory`, `getIncrement`, `isEligible`, `computeTarget`
- `__tests__/progression.test.ts` — 56 test cases, all passing
- `vitest.config.ts` — Vitest configured with `@/` path alias
- `package.json` — Added `test` and `test:watch` scripts (vitest)

**Run tests:** `npm test`

### Phase A: Backend Endpoint — DONE

**File created (in clip2fit-api repo):**
- `/Users/lazarspasic/git/clip2fit-api/src/app/api/stats/exercise-history/route.ts`

**Endpoint:** `GET /api/stats/exercise-history?ids=uuid1,uuid2,uuid3`

Returns `Record<catalogExerciseId, { sessionCount, lastSession: { sets: [{ setNumber, actualWeight, actualReps }] } }>`

### Phase C: Frontend Hook — DONE

**Files created/modified:**
- `hooks/use-smart-targets-history.ts` — `useSmartTargetsHistory(catalogExerciseIds: string[])` hook
- `constants/query-keys.ts` — Added `stats.exerciseHistoryBulk(ids)` key

### Phase D: UI Components + Wiring — DONE

**Files created:**
- `components/workout/smart-target-chip.tsx` — 3-state chip (suggested/applied/overridden)
- `hooks/use-smart-target.ts` — Orchestrator hook: fetch → eligible → compute

**Files modified:**
- `components/workout/designs/design-b-pulse/pulse-set-card.tsx` — **PRIMARY** integration (actual active workout UI)
- `components/workout/command-center/set-table-row.tsx` — Secondary integration (unused CommandCenter design, future-proof)

### Phase E: Integration Testing, Edge Cases, Polish — DONE

- **Hardcoded WEIGHT_STEP fixed**: `pulse-set-card.tsx` imports `WEIGHT_STEP` from `use-set-input.ts` instead of duplicating `2.5`
- **Exported `WEIGHT_STEP`** from `components/workout/shared/use-set-input.ts`
- **hitSlop increased to 12pt**: Chip ~20pt + 12pt each side = 44pt minimum touch target
- **All edge cases verified** — every degradation path returns `{ target: null }`, workout unaffected:
  - History loading / API error / no catalogExerciseId / bodyweight / exotic reps / 1 session / null data / all sets done → no chip shown
- **TypeScript clean** (only pre-existing `TAG` error in `use-api.ts:195`)
- **56/56 tests pass**

---

## What Worked

- **Vitest for unit testing** pure TS functions — fast, zero config beyond path alias
- **`normalizeMuscleGroup()`** from `utils/muscle-color.ts` handles all alias resolution (no new alias map needed)
- **`MuscleGroupKey` type** ensures the increment map is exhaustive at compile time
- **Exotic rep pattern detection** via single regex (covers AMRAP, failure, sec, min, /side, per side, each side, hold)
- **`useSmartTarget()` hook** cleanly encapsulates: fetch history → check eligibility → compute target
- **Chip state tracking via `useRef<number | null>`** for applied weight comparison (avoids stale closure issues with stepper)
- **Resetting chip state by comparing `activeSet.id`** to a ref (no useEffect needed, runs during render — React-sanctioned pattern)
- **TanStack Query with `staleTime: 5min`** — history doesn't refetch mid-workout

## What Didn't Work / Watch Out For

- **The plan targets wrong files.** Plan says modify `set-table-row.tsx` and `active-workout-content.tsx`, but the ACTUAL active workout UI renders through:
  ```
  ActiveWorkoutContent → ActiveWorkoutShell → OrbitDashboard → PulseDashboard → PulseSetCard
  ```
  `PulseSetCard` uses stepper-based input (not table rows). The `SetTableRow` / `CommandCenterWorkout` is an **unused** older design. Both were modified, but `PulseSetCard` is where users see the chip.

- **`package.json` gets auto-modified** by linters/formatters between reads — always re-read before editing.

- **Stepper weight tracking is inherently racy** — `input.incrementWeight()` uses a state setter (`w => w + STEP`) but chip tracking needs the new value immediately. Solved by computing `input.weight + WEIGHT_STEP` inline (works because both use same baseline before React re-renders).

- **5 chip states was too many** — earlier iterations had `loading`, `error`, `suggested`, `applied`, `overridden`. Simplified to 3 (loading/error just show no chip).

---

## What Remains Before Shipping

1. **Create feature branch + commit** — all changes are uncommitted on `main`
2. **On-device QA** — test the full flow on iOS simulator with real workout data:
   - Exercise WITH catalogExerciseId + 2+ sessions → chip shows
   - Exercise WITHOUT catalogExerciseId → no chip
   - Bodyweight exercise → no chip
   - AMRAP/exotic reps exercise → no chip
   - Tap chip → weight fills → chip becomes "applied"
   - Use stepper/manual input → chip becomes "overridden"
   - Complete set → chip resets to "suggested" for next set
   - All sets done → no chip
3. **Optional: `/design-review`** for visual QA on chip styling
4. **Optional: `/review`** for pre-landing code review

---

## Uncommitted Changes (as of 2026-04-02)

**Modified:**
- `.gitignore`, `CLAUDE.md`, `HANDOFF.md`
- `app/(protected)/(tabs)/profile/index.tsx`
- `components/workout/command-center/set-table-row.tsx`
- `components/workout/designs/design-b-pulse/pulse-set-card.tsx`
- `components/workout/shared/use-set-input.ts`
- `constants/query-keys.ts`
- `package-lock.json`, `package.json`, `skills-lock.json`

**New (untracked):**
- `TODOS.md`
- `__tests__/progression.test.ts`
- `components/workout/smart-target-chip.tsx`
- `docs/founder-verdicts.md`
- `hooks/use-smart-target.ts`, `hooks/use-smart-targets-history.ts`
- `plans/plan-smart-targets-phase1.md`
- `utils/progression.ts`
- `vitest.config.ts`

---

## Key Architecture Decisions (Locked)

All decisions were reviewed and locked in a prior session. Do NOT re-debate:

| Decision | Choice | Why |
|----------|--------|-----|
| Scope | Weighted exercises only, 2+ sessions, catalogExerciseId required | Narrow = correct |
| Deloads | None in Phase 1 | One bad session ≠ regression |
| Rep ranges | Upper bound ("8-12" → progress at 12) | Prevents premature progression |
| Chip states | 3 only: suggested/applied/overridden | 5 was too many |
| Chip copy | `75kg +2.5` (not "AI: 75kg") | Utility, not marketing |
| Free tier | No chip shown (no blurred paywall) | Mid-workout paywall is hostile |
| Analytics | On set completion, not chip tap | Tap ≠ final decision |
| Chip placement | Above weight stepper in PulseSetCard | Plan said table row, but actual UI uses stepper |

---

## What NOT to Build (Phase 1)

- No bodyweight targets (Phase 1.5)
- No deloads (Phase 2+)
- No fuzzy name matching (catalogExerciseId only)
- No LLM calls (pure formula)
- No swipe-to-dismiss
- No free-tier blurred chip
- No PostHog events yet
- No "AI:" prefix on chips
- No manual `useMemo`/`useCallback` (React Compiler)

---

## Key Files

| File | Why |
|------|-----|
| `plans/plan-smart-targets-phase1.md` | Full implementation plan with SQL, types, specs |
| `utils/progression.ts` | Core logic — `isEligible`, `computeTarget` |
| `__tests__/progression.test.ts` | 56 test cases |
| `hooks/use-smart-targets-history.ts` | TanStack Query hook for bulk history fetch |
| `hooks/use-smart-target.ts` | Orchestrator: fetch → eligible → compute for current exercise |
| `components/workout/smart-target-chip.tsx` | 3-state chip component |
| `components/workout/designs/design-b-pulse/pulse-set-card.tsx` | Primary integration point (actual active workout UI) |
| `components/workout/shared/use-set-input.ts` | Weight/reps stepper state (exports `WEIGHT_STEP`) |
| `components/workout/command-center/set-table-row.tsx` | Secondary integration (unused CommandCenter layout) |
| `contexts/active-workout-context.tsx` | Session state, completeSet(), currentExercise |
| `constants/query-keys.ts` | exerciseHistoryBulk key |
| `clip2fit-api/src/app/api/stats/exercise-history/route.ts` | Backend endpoint |

---

## Component Tree (Active Workout Flow)

```
ActiveWorkoutContent
  └─ ActiveWorkoutShell
       └─ OrbitDashboard
            └─ PulseDashboard
                 ├─ OrbitRing (timer/progress)
                 ├─ ExerciseLearningPill
                 └─ PulseSetCard  ← SMART TARGET CHIP LIVES HERE
                      ├─ SetDots
                      ├─ SmartTargetChip (when eligible)
                      ├─ Weight stepper (StepperButton + TappableValue)
                      ├─ Reps stepper
                      ├─ PreviousPerformance
                      ├─ LogSetButton
                      └─ Skip exercise
```

---

## Broader Context

### AI Personal Trainer Roadmap (5 phases)
1. **Smart Targets** (formula-based) — CODE COMPLETE, UNCOMMITTED
2. **AI Weekly Plan** (LLM generates weekly plans)
3. **Mascot + Chat** (bottom sheet chat with AI trainer)
4. **Routine Evolution** (AI proposes permanent template changes)
5. **Content Discovery** (AI recommends videos to convert)

### Next After Shipping Phase 1
- **Phase 1.5** (see `TODOS.md`): Fuzzy exercise name matching + bodyweight progression
- **Phase 2**: AI Weekly Plan + schema fix (`override_of` column on `planned_workouts`)

### Other In-Progress Work

- **Form Coach** (pose detection camera): Code complete through Phase 7. Needs runtime verification on physical device. Independent from AI Trainer. See `plans/plan-form-coach-pose-camera.md`.

### Review Status (Prior Sessions)

```
Eng Review:    CLEARED (2026-03-23)
Design Review: CLEARED (2026-03-23, score 5/10 → 8/10)
Outside Voices: Codex + Claude subagent — all issues resolved
Tests:         56/56 passing (verified 2026-04-02)
```
