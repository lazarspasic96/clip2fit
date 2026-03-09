# Backend Plan: Enrich Manual Workout Metadata

## Context

Workouts created manually via `POST /api/workouts` are missing `targetMuscles`, `estimatedDurationMinutes`, `equipment`, and `difficulty`. These fields are populated by AI extraction for video-imported workouts but left `NULL` for manual creations. This causes:

- No colored abbreviation badge on the home screen segmented strip
- No muscle chips on schedule day rows
- No duration shown anywhere
- Workouts appear incomplete compared to video-imported ones

The data to derive all of these already exists — every exercise in a manual workout has a `catalogExerciseId` linking to the 873-entry exercise catalog with `target`, `secondaryMuscles`, `equipment`, and `difficulty`.

---

## Phase 1: Create `POST /api/workouts` Endpoint (or fix existing)

This endpoint is called by the mobile app but **not documented** in `api-docs.md`. It either exists undocumented or needs to be created/fixed.

### 1.1 Accept `CreateWorkoutPayload`

Current payload from mobile (`types/catalog.ts:75-87`):

```typescript
{
  title: string
  exercises: {
    catalogExerciseId: string
    sets: number
    reps: string
    targetWeight: number | null
    restBetweenSets: string | null  // e.g. "90s"
    notes: string | null
    order: number
    isBodyweight: boolean
  }[]
}
```

No changes needed to the mobile payload — backend will derive missing metadata.

### 1.2 Derive Metadata from Catalog Exercises

After Zod validation, before inserting the workout row:

```
Step A — Lookup catalog exercises
  SELECT id, name, target, secondary_muscles, equipment, difficulty
  FROM exercises_catalog
  WHERE id IN (:catalogExerciseIds)

Step B — Compute targetMuscles
  Collect all `target` values (primary muscle) from each catalog exercise
  Deduplicate, preserving first-occurrence order
  Example: [bench press → "pectorals", lateral raise → "delts"] → ["pectorals", "delts"]

Step C — Compute equipment
  Collect all `equipment` values from each catalog exercise
  Deduplicate, filter out "body weight" if mixed with other equipment
  Example: ["barbell", "body weight", "dumbbell"] → ["barbell", "dumbbell"]
  (keep "body weight" only if it's the ONLY equipment)

Step D — Compute estimatedDurationMinutes
  Formula: ceil((totalSets × 2.5 + totalRestMinutes) × 1.1)
  Where:
    totalSets = sum of all exercises' `sets`
    totalRestMinutes = sum of (sets - 1) × parseRestSeconds(restBetweenSets) / 60
    1.1 = buffer factor for transitions
  Example: 5 exercises × 3 sets, 90s rest
    = ceil((15 × 2.5 + 10 × 1.5) × 1.1) = ceil((37.5 + 15) × 1.1) = ceil(57.75) = 58 min

Step E — Compute difficulty
  Aggregate difficulty from catalog exercises:
    - If any exercise is "advanced" → "advanced"
    - Else if any is "intermediate" → "intermediate"
    - Else → "beginner"
  Fallback: "intermediate" if catalog exercises have no difficulty set
```

### 1.3 Insert Workout Row

```sql
INSERT INTO workouts (
  id, user_id, title, description,
  platform, source_url, source_url_hash,
  creator_name, creator_handle, thumbnail_url,
  target_muscles, equipment,
  estimated_duration_minutes, difficulty
) VALUES (
  gen_random_uuid(), :userId, :title, NULL,
  NULL, NULL, NULL,           -- no video source
  NULL, NULL, NULL,           -- no creator
  :derivedTargetMuscles,      -- ["pectorals", "delts"]
  :derivedEquipment,          -- ["barbell", "dumbbell"]
  :derivedDuration,           -- 58
  :derivedDifficulty          -- "intermediate"
)
```

### 1.4 Insert Exercises + Junction Row

Same as existing conversion flow:
- Insert all exercises with `workoutId` reference
- For each exercise, look up `muscleGroups` from catalog: `[target, ...secondaryMuscles]`
- Insert `user_workouts` junction row for ownership

### 1.5 Return Full `ApiWorkout`

Use existing `formatWorkoutResponse()` to return the same shape as `GET /api/workouts/[id]`.

---

## Phase 2: Fix `PATCH /api/workouts/[id]` Recomputation

Currently when exercises are replaced via PATCH, `targetMuscles`, `equipment`, `estimatedDurationMinutes` are NOT recomputed. They retain stale values from the original creation.

### 2.1 Recompute on Exercise Replacement

When `exercises` array is provided in PATCH body:

```
After: DELETE + INSERT exercises
Add:   Recompute targetMuscles, equipment, estimatedDurationMinutes, difficulty
       using same logic as Phase 1 (Steps B-E)
       UPDATE workouts SET target_muscles = :new, equipment = :new, ...
       WHERE id = :id AND user_id IS NOT NULL
```

This ensures that editing a manual workout (adding/removing exercises) keeps metadata accurate.

---

## ~~Phase 3: Backfill Existing Manual Workouts~~ — SKIPPED

No backfill needed. The database will be wiped before production launch, so existing manual workouts with `NULL` metadata don't need to be migrated.

---

## Phase 4: Document `POST /api/workouts` in `api-docs.md`

Add full documentation following the existing format (see endpoints 1-18 for style).

### Endpoint Spec

```
## XX. POST /api/workouts

Create a workout manually from catalog exercises.

### Request

POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

Body:
| Field     | Type    | Required | Validation      |
|-----------|---------|----------|-----------------|
| title     | string  | Yes      | Min 1 char      |
| exercises | array   | Yes      | Min 1 exercise  |

Exercise object:
| Field             | Type           | Required | Validation                     |
|-------------------|----------------|----------|--------------------------------|
| catalogExerciseId | string         | Yes      | UUID, must exist in catalog    |
| sets              | number         | Yes      | Positive integer               |
| reps              | string         | Yes      | Min 1 char                     |
| targetWeight      | number | null  | No       |                                |
| restBetweenSets   | string | null  | No       | Format: "Ns" (e.g., "90s")    |
| notes             | string | null  | No       |                                |
| order             | number         | Yes      | Integer                        |
| isBodyweight      | boolean        | Yes      |                                |

### How It Works

Step 1 — Auth + Validate
Step 2 — Lookup catalog exercises → derive targetMuscles, equipment, duration, difficulty
Step 3 — Transaction: INSERT workout + exercises + user_workouts
Step 4 — Return formatWorkoutResponse()

### Response

201 — Created workout (same shape as GET /api/workouts/[id])
400 — Validation failed
404 — One or more catalogExerciseIds not found in catalog
```

---

## Summary of Changes

| What | Where | Impact |
|------|-------|--------|
| Derive `targetMuscles` from catalog exercises | `POST /api/workouts` handler | New manual workouts get muscle data |
| Derive `estimatedDurationMinutes` | `POST /api/workouts` handler | New manual workouts get duration |
| Derive `equipment` | `POST /api/workouts` handler | New manual workouts get equipment list |
| Derive `difficulty` | `POST /api/workouts` handler | New manual workouts get difficulty level |
| Populate exercise `muscleGroups` from catalog | `POST /api/workouts` handler | Exercise rows have muscle data |
| Recompute metadata on exercise edit | `PATCH /api/workouts/[id]` handler | Edited workouts stay accurate |
| ~~Backfill existing workouts~~ | ~~One-time migration script~~ | SKIPPED — DB will be wiped before launch |
| Document endpoint | `api-docs.md` | Complete API documentation |

## No Mobile Changes Needed

The frontend already handles all these fields correctly when they're populated. The `mapApiWorkout()` function in `types/api.ts` normalizes everything. Once the backend returns proper values, the schedule badges, muscle chips, and duration will appear automatically.

## Unresolved Questions

1. **Duration formula** — Is `ceil((totalSets × 2.5 + totalRestMinutes) × 1.1)` a good approximation? The 2.5 min/set includes setup + execution. Should we use a different per-set time for bodyweight exercises?
2. **Equipment display** — Should "body weight" be filtered out when other equipment exists, or always included?
3. **PATCH recomputation** — Should metadata recomputation also apply to video-imported workouts when their exercises are edited? Or only manual ones?
4. ~~**Backfill scope**~~ — N/A, database will be wiped before launch.
