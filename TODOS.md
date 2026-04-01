# TODOS

## Phase 1.5: Smart Targets Expansion

### Fuzzy Exercise Name Matching
**What:** Add exercise name normalization as fallback for exercises without `catalogExerciseId`.
**Why:** Video-extracted exercises often don't get linked to the catalog. Without fuzzy matching, these exercises never get smart targets — limiting coverage.
**Risks:** False matches ("Bench Press" → "Incline Bench"). Needs confidence threshold.
**Context:** Phase 1 uses `catalogExerciseId` only (safe). This enables Phase 1.5 to expand coverage.
**Depends on:** Phase 1 shipped + catalog exercise linking during video extraction improved.

### Bodyweight Exercise Progression
**What:** Add rep-based targets for bodyweight exercises (push-ups, pull-ups, dips, etc.).
**Why:** Phase 1 only covers weighted exercises. Bodyweight exercises are common in converted workouts.
**Risks:** Edge cases — weighted pull-ups (hybrid), assisted variations, timed holds. Needs different increment logic.
**Context:** Formula outlined in design doc (`nextReps = previousReps + 2`). Deferred from Phase 1 for scope.
**Depends on:** Phase 1 shipped.

## Phase 2: Schema Fix

### Planned Workouts Override Column
**What:** Add `override_of UUID REFERENCES planned_workouts(id)` column to preserve original AI plan when creating chat overrides.
**Why:** Current schema (`UNIQUE(user_id, planned_date)`) means chat overrides destroy the original weekly plan row. No revert path.
**Risks:** Slightly more complex queries (filter out overridden rows).
**Context:** Codex review caught this schema contradiction. Must be fixed before Phase 2 (chat overrides) ships.
**Depends on:** Phase 2 schema design.

