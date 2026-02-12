# Clip2Fit — API Changes Summary + Mobile Integration Guide

> This document covers (A) what changed in the API, (B) exact new response shapes, and (C) step-by-step mobile work needed to integrate.

---

## Part A: What Changed in the API (Completed)

### A1. New Data Model — Shared Templates + User Library

**Before:** Each user owned their workouts directly (`workouts.userId = user.id`).

**After:** Workouts are now shared templates (`workouts.userId = NULL`). Users access workouts through a junction table `user_workouts`.

```
workouts (userId=NULL)        ← shared template, one per unique video URL
    ↑
user_workouts (junction)      ← user's "library" — links user to workouts
    ↑
weekly_schedules              ← assigns workouts to days of week
```

**Why:** Two users converting the same YouTube video no longer runs the expensive pipeline (yt-dlp + Whisper + GPT-4o-mini) twice. The second user gets the result instantly.

### A2. New DB Tables & Columns

**`workouts` table changes:**
| Column | Change | Purpose |
|---|---|---|
| `user_id` | Now **nullable** | `NULL` = shared template; non-null = personal fork |
| `source_url_hash` | **New** (text) | SHA-256 of normalized video URL for dedup |
| `template_id` | **New** (uuid, FK → workouts.id) | Links a personal fork back to the original template |

**New partial unique index:**

```sql
CREATE UNIQUE INDEX idx_workouts_unique_template_hash
  ON workouts(source_url_hash) WHERE user_id IS NULL;
```

Only one shared template per video URL. Race conditions between two simultaneous pipelines handled by DB constraint.

**New `user_workouts` junction table:**
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Auto-generated |
| `user_id` | uuid FK → profiles.id | ON DELETE CASCADE |
| `workout_id` | uuid FK → workouts.id | ON DELETE CASCADE |
| `added_at` | timestamptz | When user added workout to library |
| | UNIQUE(user_id, workout_id) | Prevents duplicate links |

### A3. Behavior Changes Summary

| Feature             | Before                            | After                                                               |
| ------------------- | --------------------------------- | ------------------------------------------------------------------- |
| **Conversion**      | Always runs pipeline per user     | 3-tier dedup: (1) user's library, (2) shared template, (3) pipeline |
| **Workout listing** | `workouts WHERE userId = X`       | `user_workouts WHERE userId = X` → join workouts                    |
| **Workout access**  | `workouts.userId = currentUser`   | `user_workouts` link exists                                         |
| **Edit (PATCH)**    | Direct edit                       | Fork-on-edit: shared template → clones to personal copy first       |
| **Delete**          | Always deletes workout row        | Smart delete: shared → unlink only; personal → full delete          |
| **Schedule PUT**    | No ownership check on workout_ids | Validates all workout_ids exist in user's `user_workouts`           |

### A4. New Files Created

| File                           | Purpose                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/url-utils.ts`         | `normalizeVideoUrl()` + `computeSourceUrlHash()` — extracts platform-specific video IDs (YouTube, TikTok, Instagram) and hashes them |
| `src/lib/format.ts`            | `formatWorkoutResponse()` — shared JSON mapper used by all workout endpoints; adds `isPersonalCopy` + `templateId` to response       |
| `drizzle/0001_nice_ultron.sql` | Migration: `user_workouts` table, nullable `user_id`, `source_url_hash`, `template_id`, partial unique index, self-referential FK    |

### A5. Modified Files

| File                                 | What Changed                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `src/lib/db/schema.ts`               | workouts nullable userId + 2 new columns, user_workouts table, updated all relations                            |
| `src/trigger/convert-workout.ts`     | Saves as shared template (`userId=NULL`), creates `user_workouts` link, `onConflictDoNothing` for race handling |
| `src/app/api/convert/route.ts`       | 3-tier dedup flow via `sourceUrlHash`                                                                           |
| `src/app/api/workouts/route.ts`      | Queries through `user_workouts` junction                                                                        |
| `src/app/api/workouts/[id]/route.ts` | Access via `user_workouts`, fork-on-edit PATCH, smart DELETE                                                    |
| `src/app/api/schedules/route.ts`     | PUT validates workout_ids against user's library                                                                |

---

## Part B: Complete API Response Shapes (Current State)

All endpoints require `Authorization: Bearer <supabase_jwt>`.

### B1. POST /api/convert

**Request:**

```json
{ "url": "https://youtube.com/shorts/abc123" }
```

**Response branch 1 — User already has this workout (200):**

```json
{
  "workoutId": "uuid",
  "existing": true
}
```

Mobile action: Navigate directly to workout detail screen.

**Response branch 2 — Template exists from another user (200):**

```json
{
  "jobId": "uuid",
  "workoutId": "uuid",
  "existing": true
}
```

Mobile action: Navigate directly to workout detail screen. (Job is already completed.)

**Response branch 3 — New conversion needed (201):**

```json
{
  "jobId": "uuid"
}
```

Mobile action: Start polling `GET /api/jobs/{jobId}`.

**Key difference from before:** Response may include `workoutId` immediately (no polling needed) when a template already exists. Mobile must check for `workoutId` field before starting the polling flow.

### B2. GET /api/jobs/{id}

**Response (200):**

```json
{
  "id": "uuid",
  "status": "pending | downloading | transcribing | extracting | completed | failed",
  "progress": 0-100,
  "workoutId": "uuid | null",
  "error": "string | null",
  "createdAt": "2025-01-15T12:00:00.000Z"
}
```

No changes from before.

### B3. GET /api/workouts — List user's library

**Response (200):**

```json
[
  {
    "id": "uuid",
    "title": "Push Day",
    "description": "string | null",
    "platform": "youtube | tiktok | instagram | facebook | twitter",
    "creatorName": "string | null",
    "creatorHandle": "string | null",
    "sourceUrl": "https://...",
    "thumbnailUrl": "string | null",
    "estimatedDurationMinutes": 45,
    "difficulty": "beginner | intermediate | advanced | null",
    "targetMuscles": ["Chest", "Triceps"],
    "equipment": ["Barbell", "Bench"],
    "createdAt": "2025-01-15T12:00:00.000Z",
    "isPersonalCopy": false,
    "templateId": "uuid | null",
    "exercises": [
      {
        "id": "uuid",
        "name": "Bench Press",
        "sets": 4,
        "reps": "8-10",
        "targetWeight": 60.0,
        "restBetweenSets": "90 seconds",
        "notes": "string | null",
        "order": 0,
        "muscleGroups": ["Chest", "Triceps"],
        "isBodyweight": false
      }
    ]
  }
]
```

**New fields added:**

- `isPersonalCopy` (boolean) — `false` for shared templates, `true` for personal forks
- `templateId` (string | null) — UUID of original template if this is a fork, null otherwise

**Ordering:** Most recently added to library first.

### B4. GET /api/workouts/{id} — Single workout

Same shape as one item from the list above.

**Access model changed:** Returns 404 if workout is not in user's `user_workouts` library (even if workout exists in DB for another user).

### B5. PATCH /api/workouts/{id} — Edit (fork-on-edit)

**Request:**

```json
{
  "title": "My Custom Push Day",
  "description": "Modified version",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 5,
      "reps": "5",
      "targetWeight": 80,
      "restBetweenSets": "2 minutes",
      "notes": null,
      "order": 0,
      "muscleGroups": ["Chest"],
      "isBodyweight": false
    }
  ]
}
```

- `exercises` is **required** — full replacement, send ALL exercises
- `title` and `description` are optional

**Response (200):** Same workout shape as GET.

**CRITICAL — Fork-on-edit behavior:**

- If workout `isPersonalCopy: false` (shared template): API clones it into a personal copy, returns clone
- **The response `id` may differ from the request URL `id`**
- The `user_workouts` link and `weekly_schedules` entries are automatically updated to point to the clone
- Mobile MUST update its local workout ID reference after a PATCH

**How to detect fork happened:**

```typescript
const response = await patchWorkout(originalId, data)
if (response.id !== originalId) {
  // Fork happened — update all local references
  // response.isPersonalCopy will be true
  // response.templateId will be the originalId
}
```

### B6. DELETE /api/workouts/{id}

**Response: 204 No Content** (empty body)

**Smart delete behavior:**

- Shared template (`isPersonalCopy: false`): Removes from user's library only. Template preserved for other users. User's schedule entries referencing this workout become rest days.
- Personal fork (`isPersonalCopy: true`): Full deletion — workout, exercises (cascade), user_workouts link, nullifies conversionJobs references.

### B7. GET /api/schedules

**Response (200):**

```json
[
  {
    "id": "uuid",
    "day_of_week": 0,
    "workout_id": "uuid | null",
    "is_rest_day": false,
    "workout": {
      /* full workout shape from B3, or null */
    },
    "created_at": "2025-01-15T12:00:00.000Z",
    "updated_at": "2025-01-15T12:00:00.000Z"
  }
]
```

- Ordered by `day_of_week` (0=Monday, 6=Sunday)
- `workout` is `null` when `is_rest_day: true`
- `workout` includes `isPersonalCopy` and `templateId` fields now

### B8. PUT /api/schedules

**Request:**

```json
{
  "entries": [
    { "day_of_week": 0, "workout_id": "uuid", "is_rest_day": false },
    { "day_of_week": 1, "workout_id": null, "is_rest_day": true },
    { "day_of_week": 2, "workout_id": "uuid", "is_rest_day": false },
    { "day_of_week": 3, "workout_id": null, "is_rest_day": true },
    { "day_of_week": 4, "workout_id": "uuid", "is_rest_day": false },
    { "day_of_week": 5, "workout_id": null, "is_rest_day": true },
    { "day_of_week": 6, "workout_id": null, "is_rest_day": true }
  ]
}
```

- Must contain exactly 7 entries (one per day)
- Each `day_of_week` must be unique (0–6)
- Cannot set `workout_id` AND `is_rest_day: true` on same entry

**New validation:** All `workout_id` values must exist in user's library (`user_workouts`). If not:

```json
{
  "error": "Workout(s) not in your library",
  "workoutIds": ["uuid-that-doesnt-exist"]
}
```

Status: 400.

**Response (200):** Same shape as GET /api/schedules.

### B9. PATCH /api/profiles

No changes. Same as before:

```json
// Request (all optional)
{ "fullName": "...", "gender": "male", "age": 25, ... }

// Response (200) — full profile
{ "id": "uuid", "fullName": "...", "gender": "...", ... }
```

---

## Part C: Mobile Integration — Step-by-Step Guide

### Overview of Mobile Work Required

The mobile app currently references the old API shapes from `plans/phase-4-mobile-integration.md`. These changes affect:

1. **TypeScript types** — add 2 new fields to workout type
2. **API client** — update `POST /api/convert` response handling
3. **Processing flow** — handle instant-dedup responses
4. **Workout list** — already works (shape compatible), just add new fields to type
5. **Workout edit** — handle fork-on-edit (response ID ≠ request ID)
6. **Workout delete** — no API changes, works as before
7. **Schedule screen** — handle new 400 error for invalid workout_ids

---

### Step 1: Update TypeScript Types

**File:** `types/api.ts` (or wherever workout types live)

Add 2 new fields to the workout response type:

```typescript
interface WorkoutResponse {
  id: string
  title: string
  description: string | null
  platform: string
  creatorName: string | null
  creatorHandle: string | null
  sourceUrl: string
  thumbnailUrl: string | null
  estimatedDurationMinutes: number | null
  difficulty: string | null
  targetMuscles: string[] | null
  equipment: string[] | null
  createdAt: string // ISO-8601
  isPersonalCopy: boolean // ← NEW
  templateId: string | null // ← NEW
  exercises: ExerciseResponse[]
}

interface ExerciseResponse {
  id: string
  name: string
  sets: number
  reps: string
  targetWeight: number | null
  restBetweenSets: string | null
  notes: string | null
  order: number
  muscleGroups: string[] | null
  isBodyweight: boolean | null
}
```

Add a union type for the convert response:

```typescript
// POST /api/convert response — 3 possible shapes
type ConvertResponse =
  | { workoutId: string; existing: true } // Tier 1: already in library
  | { jobId: string; workoutId: string; existing: true } // Tier 2: template reused
  | { jobId: string } // Tier 3: pipeline started

// Schedule PUT error
interface ScheduleLibraryError {
  error: 'Workout(s) not in your library'
  workoutIds: string[]
}
```

---

### Step 2: Update POST /api/convert Handler

**File:** Wherever `POST /api/convert` is called (e.g., `process-url-content.tsx` or `hooks/use-api.ts`)

**Before:** Response was always `{ jobId }` → start polling.

**After:** Response may include `workoutId` immediately. Must handle 3 branches:

```typescript
async function convertUrl(url: string): Promise<{
  workoutId?: string
  jobId?: string
  needsPolling: boolean
}> {
  const res = await api.post('/api/convert', { url })
  const data = await res.json()

  // Branch 1 & 2: Workout already available (instant result)
  if (data.workoutId) {
    return { workoutId: data.workoutId, jobId: data.jobId, needsPolling: false }
  }

  // Branch 3: Pipeline started, need to poll
  return { jobId: data.jobId, needsPolling: true }
}
```

---

### Step 3: Update Processing Flow / UI

**File:** `components/processing/process-url-content.tsx` (or equivalent)

Current flow:

```
Submit URL → POST /api/convert → get jobId → poll until complete → navigate to workout
```

New flow:

```
Submit URL → POST /api/convert
  ├── workoutId present? → skip polling → navigate directly to workout
  └── jobId only? → poll GET /api/jobs/{jobId} → navigate when complete
```

Update the processing stage mapping:

```typescript
const { workoutId, jobId, needsPolling } = await convertUrl(url)

if (!needsPolling && workoutId) {
  // Instant dedup — show brief "Already in library" toast/animation
  setStage('complete')
  navigateToWorkout(workoutId)
  return
}

// Otherwise: start polling as before
startPolling(jobId)
```

**UX decision:** When a video was already converted (Tier 1 or 2), you can either:

- (a) Show the full processing animation briefly then skip to result (feels consistent)
- (b) Show a toast "Already in your library!" and navigate directly (faster)

---

### Step 4: Handle Fork-on-Edit in Workout Edit Screen

**File:** Workout edit/detail screen

When user edits a workout, the response ID may differ from the original:

```typescript
async function saveWorkoutEdits(workoutId: string, data: WorkoutUpdatePayload) {
  const res = await api.patch(`/api/workouts/${workoutId}`, data)
  const updated: WorkoutResponse = await res.json()

  if (updated.id !== workoutId) {
    // Fork happened: shared template was cloned into personal copy
    // Update local state, cache, navigation params
    updateLocalWorkoutId(workoutId, updated.id)

    // If using React Navigation, replace current route so back button doesn't
    // navigate to a workout the user no longer has access to
    navigation.replace('WorkoutDetail', { id: updated.id })
  }

  return updated
}
```

**What the mobile app should communicate to the user:**

- Before editing a shared template: Show a subtle indicator (e.g., small label "Shared workout — editing creates your personal copy")
- After fork: Show toast "Personal copy created" or similar
- The `isPersonalCopy` field determines which UI to show

---

### Step 5: Show Shared vs Personal Indicator

Use `isPersonalCopy` field to show workout ownership state:

```typescript
// In workout card or detail header
function WorkoutBadge({ workout }: { workout: WorkoutResponse }) {
  if (workout.isPersonalCopy) {
    return <Badge label="Personal copy" variant="blue" />;
  }
  return <Badge label="Original" variant="gray" />;
}
```

Optional: show "Forked from..." link using `templateId` field.

---

### Step 6: Handle Schedule PUT Validation Error

**File:** Schedule screen

The PUT endpoint now returns 400 if a workout_id isn't in the user's library:

```typescript
async function saveSchedule(entries: ScheduleEntry[]) {
  const res = await api.put('/api/schedules', { entries })

  if (!res.ok) {
    const error = await res.json()

    if (error.workoutIds) {
      // Some workouts were removed from library but still referenced in schedule
      // Remove stale references and retry, or show error
      showAlert(`Some workouts are no longer in your library. Please reassign those days.`)
      return
    }

    // Other validation errors
    showAlert(error.error)
    return
  }

  return await res.json()
}
```

**When this can happen:**

- User deletes a workout from library, then tries to save a schedule that still references it
- Edge case: workout was a shared template that got cleaned up

---

### Step 7: Update Workout Delete Behavior (Optional UI Polish)

The DELETE behavior is transparent to the mobile app (always returns 204), but the user experience differs:

- Shared template: Workout disappears from user's library, but the original template survives for other users
- Personal fork: Workout is permanently deleted

**Optional:** Show different confirmation messages:

```typescript
function getDeleteMessage(workout: WorkoutResponse): string {
  if (workout.isPersonalCopy) {
    return 'Delete this workout permanently? This cannot be undone.'
  }
  return 'Remove this workout from your library? You can add it back by converting the same video.'
}
```

---

### Step 8: Handle Schedule Entries After Workout Delete

When a shared workout is deleted, the API automatically converts schedule entries referencing it into rest days. The mobile app should refetch the schedule after deleting a workout:

```typescript
async function deleteWorkout(workoutId: string) {
  await api.delete(`/api/workouts/${workoutId}`)

  // Refetch schedule to reflect any entries that became rest days
  await refetchSchedule()

  // Refetch workout list
  await refetchWorkouts()
}
```

---

## Part D: Migration Checklist (Before First Deploy)

### API Side (this repo)

1. Run `npm run db:migrate` — creates `user_workouts` table, adds columns to `workouts`
2. Backfill `user_workouts` from existing data:
   ```sql
   INSERT INTO user_workouts (id, user_id, workout_id, added_at)
   SELECT gen_random_uuid(), user_id, id, created_at
   FROM workouts WHERE user_id IS NOT NULL
   ON CONFLICT DO NOTHING;
   ```
3. Backfill `source_url_hash` for existing workouts (Node script):
   ```typescript
   // For each existing workout: compute hash from sourceUrl + platform, update row
   import { computeSourceUrlHash } from './src/lib/url-utils'
   // ... iterate workouts, update source_url_hash
   ```
4. Existing workouts keep their `user_id` (personal). Only NEW conversions create shared templates.

### Mobile Side

1. Update types (Step 1)
2. Update convert flow (Steps 2-3) — **must ship before or simultaneously with API deploy**
3. All other steps (4-8) can ship incrementally

---

## Part E: Backward Compatibility Notes

| Scenario                                             | Mobile without update                                        | Impact                                   |
| ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `POST /api/convert` returns `workoutId` directly     | Old mobile ignores it, starts polling a non-existent `jobId` | **BROKEN** — must update convert handler |
| Workout response has `isPersonalCopy` / `templateId` | Extra fields ignored by old mobile                           | Safe — backward compatible               |
| `PATCH` returns different `id` (fork)                | Old mobile doesn't notice, may reference stale ID            | **Will 404 on next fetch**               |
| Schedule PUT rejects unlibrary'd workout_ids         | Old mobile never sends bad IDs                               | Safe — unless desync                     |

**Minimum mobile update required before API deploy:** Steps 1-3 (types + convert handler).

---

## Unresolved Questions

1. **Backfill script** — should this be a standalone Node script, a Drizzle seed file, or a one-off SQL migration?
2. **Dedup UX on mobile** — when Tier 1/2 dedup returns instantly, show full animation or skip directly?
3. **Fork indicator design** — what should the "shared vs personal" badge look like? Where should it appear (card, detail header, both)?
4. **Schedule refetch strategy** — after workout delete, should mobile auto-refetch schedule, or rely on next screen visit?
