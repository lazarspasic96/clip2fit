# Clip2Fit API Reference

Base URL: `/api`

All routes require authentication via Supabase JWT in the `Authorization: Bearer <token>` header. The token is verified per-request using `getAuthUser()` which calls `supabase.auth.getUser()`.

## Common Error Responses

Every route returns these errors when applicable:

| Status | Body                                                   | When                                                              |
| ------ | ------------------------------------------------------ | ----------------------------------------------------------------- |
| 401    | `{ "error": "Unauthorized" }`                          | Missing or invalid Bearer token                                   |
| 400    | `{ "error": "Invalid JSON body" }`                     | Request body is not valid JSON                                    |
| 400    | `{ "error": "Validation failed", "details": { ... } }` | Zod schema validation fails — `details` contains per-field errors |
| 500    | `{ "error": "Internal server error" }`                 | Unhandled exception                                               |

---

## 1. POST /api/convert

Start a video-to-workout conversion. Uses a 4-tier deduplication strategy before dispatching a Trigger.dev background job.

### Request

```
POST /api/convert
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

| Field | Type     | Required | Validation                                                                                     |
| ----- | -------- | -------- | ---------------------------------------------------------------------------------------------- |
| `url` | `string` | Yes      | Must be a valid URL from a supported platform: TikTok, Instagram, YouTube, Facebook, Twitter/X |

```json
{ "url": "https://www.tiktok.com/@creator/video/123456" }
```

### How It Works

```
Client sends: { url: "https://www.tiktok.com/@creator/video/123456" }
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → extracts userId from JWT
         │  Zod validates url: must be valid URL + match supported platform regex
         │  detectPlatform(url) → "tiktok"
         │  computeSourceUrlHash(url, platform) → SHA-256 hash for dedup
         │
         ▼
Step 2 — Tier 1: Check user's library
         │  SELECT user_workouts JOIN workouts
         │  WHERE userId = :user AND workouts.sourceUrlHash = :hash
         │
         │  Found? → return { workoutId, jobId: null, status: "existing" } (200)
         │
         ▼
Step 3 — Tier 2: Check shared templates
         │  SELECT workouts WHERE sourceUrlHash = :hash AND userId IS NULL
         │
         │  Found? → cloneTemplateForUser(templateId, userId)
         │           Creates personal copy in workouts + exercises tables
         │           Creates user_workouts junction row
         │           INSERT conversion_jobs (status: "completed", progress: 100)
         │           → return { jobId, workoutId: cloneId, status: "cloned" } (200)
         │
         ▼
Step 4 — Tier 3: Check in-flight jobs
         │  SELECT conversion_jobs
         │  WHERE userId = :user AND sourceUrl = :url
         │    AND status IN ('pending','downloading','transcribing','extracting')
         │
         │  Found? → return { jobId, workoutId: null, status: "processing" } (200)
         │
         ▼
Step 5 — Tier 4: New conversion
         │  INSERT conversion_jobs (status: "pending", progress: 0)
         │  tasks.trigger("convert-workout-video", { url, userId, jobId, platform })
         │  UPDATE conversion_jobs SET triggerRunId = handle.id
         │
         │  Trigger fails? → UPDATE jobs SET status="failed"
         │                   → return { error: "Failed to start conversion" } (502)
         │
         │  Success → return { jobId, workoutId: null, status: "processing" } (201)
```

**Key detail: hash-based dedup.** The `sourceUrlHash` is a SHA-256 of the normalized URL + platform. This means the same video URL always resolves to the same hash, regardless of query params or minor URL variations. Tier 1 checks if the _user_ already has it; Tier 2 checks if _any user_ has already converted it (shared template).

**Key detail: exercise catalog matching.** When Tier 4 triggers a new conversion, the Trigger.dev worker loads the full exercise catalog (~259 entries) and passes it to GPT-4o-mini during extraction. The LLM matches each extracted exercise to the closest catalog entry by name/alias and populates `catalogExerciseId`. This enables global PR tracking across workouts — exercises mapped to the same catalog entry share PR history. Unmatched exercises get `catalogExerciseId = null` and fall back to per-workout PRs.

### Deduplication Tiers

The route checks in order and short-circuits on match:

1. **User already has workout** — user's library contains a workout with matching `sourceUrlHash`. Returns the existing `workoutId`.
2. **Shared template exists** — a template workout (userId=NULL) has matching hash. Clones it for the user, creates a `completed` job, returns both IDs.
3. **In-flight job exists** — the user already has a pending/downloading/transcribing/extracting job for the same URL. Returns the existing `jobId`.
4. **New conversion** — creates a `pending` job row, dispatches `convert-workout-video` task to Trigger.dev, stores the `triggerRunId`.

### Response

**200 — Existing workout (Tier 1)**

```json
{
  "workoutId": "uuid",
  "jobId": null,
  "status": "existing"
}
```

**200 — Cloned from template (Tier 2)**

```json
{
  "jobId": "uuid",
  "workoutId": "uuid",
  "status": "cloned"
}
```

**200 — In-flight job (Tier 3)**

```json
{
  "jobId": "uuid",
  "workoutId": null,
  "status": "processing"
}
```

**201 — New job created (Tier 4)**

```json
{
  "jobId": "uuid",
  "workoutId": null,
  "status": "processing"
}
```

**400 — Validation failed**

```json
{
  "error": "Validation failed",
  "details": {
    "url": [
      "Must be a valid URL",
      "URL must be from a supported platform (TikTok, Instagram, YouTube, Facebook, Twitter)"
    ]
  }
}
```

**502 — Trigger dispatch failed**

```json
{ "error": "Failed to start conversion" }
```

Job is marked `failed` with error message in DB.

### Logging

Tag: `[clip2fit:convert]`

Logs: incoming request (userId, url, platform), dedup tier hit, job creation, trigger dispatch success/failure, duration.

### Client Use Case

Mobile app submits a video URL. If `status === "existing"`, navigate directly to workout. If `status === "cloned"`, same. If `status === "processing"`, start polling `/api/jobs/[jobId]`.

---

## 2. GET /api/jobs/[id]

Poll a conversion job's status and progress.

### Request

```
GET /api/jobs/:id
Authorization: Bearer <token>
```

**Path params:**

| Param | Type     | Validation                    |
| ----- | -------- | ----------------------------- |
| `id`  | `string` | UUID format (regex validated) |

### How It Works

```
Client sends: GET /api/jobs/abc-123
         │
         ▼
Step 1 — Auth + Validate path param
         │  getAuthUser() → userId
         │  UUID regex test on :id → rejects malformed IDs immediately
         │
         ▼
Step 2 — Query
         │  SELECT * FROM conversion_jobs
         │  WHERE id = :id AND userId = :userId
         │
         │  Not found? → 404 "Job not found"
         │  (same 404 whether job doesn't exist or belongs to another user)
         │
         ▼
Step 3 — Return job state
         │  Return: { id, status, progress, workoutId, error, createdAt }
         │
         │  status flow: pending → downloading → transcribing → extracting → completed
         │                                                                 → failed
         │
         │  workoutId: null while processing, populated on "completed"
         │  error: null unless "failed"
```

**Key detail: ownership filter.** The query always includes `userId = :user` so users can never see another user's jobs. A valid UUID that belongs to someone else returns the same 404 as a non-existent job — no information leakage.

**Key detail: status is updated externally.** This endpoint is read-only. The Trigger.dev background worker updates `status`, `progress`, `workoutId`, and `error` fields as the pipeline progresses. This route just reads the current state.

### Response

**200 — Job found**

```json
{
  "id": "uuid",
  "status": "pending | downloading | transcribing | extracting | completed | failed",
  "progress": 0,
  "workoutId": "uuid | null",
  "error": "string | null",
  "createdAt": "2025-01-15T12:00:00.000Z"
}
```

**400 — Invalid ID**

```json
{ "error": "Invalid job ID" }
```

**404 — Not found or not owned by user**

```json
{ "error": "Job not found" }
```

### Logging

Tag: `[clip2fit:jobs]`

Logs: poll event (jobId, status, progress, workoutId), not-found.

### Client Use Case

After `POST /api/convert` returns `status: "processing"`, the mobile app polls this endpoint every 2-3 seconds. When `status === "completed"`, fetch the workout via `/api/workouts/[workoutId]`.

---

## 3. GET /api/profiles

Fetch the authenticated user's profile.

### Request

```
GET /api/profiles
Authorization: Bearer <token>
```

No query params or body.

### How It Works

```
Client sends: GET /api/profiles
         │
         ▼
Step 1 — Auth
         │  getAuthUser() → userId (from JWT)
         │
         ▼
Step 2 — Query
         │  SELECT * FROM profiles WHERE id = :userId
         │
         │  Not found? → 404 "Profile not found"
         │  (profile doesn't exist until first PATCH call creates it)
         │
         ▼
Step 3 — Format + return
         │  formatProfile() strips internal fields, returns:
         │  { id, fullName, gender, age, height, heightUnit,
         │    weight, weightUnit, fitnessGoal, createdAt, updatedAt }
```

**Key detail: profile.id = auth.users.id.** The profiles table PK is the same UUID as Supabase auth. There's no separate lookup — the JWT `sub` claim _is_ the profile ID. If the user has authenticated but never called PATCH, the row doesn't exist yet → 404.

### Response

**200 — Profile found**

```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "gender": "male",
  "age": 28,
  "height": 180,
  "heightUnit": "cm",
  "weight": 80,
  "weightUnit": "kg",
  "fitnessGoal": "Build muscle",
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

All fields except `id`, `createdAt`, `updatedAt` may be `null` if not yet set.

**404 — Profile not found**

```json
{ "error": "Profile not found" }
```

### Logging

Tag: `[profiles]`

### Client Use Case

Called on app launch to load user settings, display name, and fitness preferences. If 404, the app shows an onboarding/profile-setup screen.

---

## 4. PATCH /api/profiles

Update or create the user's profile (upsert). If no profile row exists, one is created with the provided fields.

### Request

```
PATCH /api/profiles
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (all fields optional, at least one required):**

| Field         | Type     | Validation                                                   |
| ------------- | -------- | ------------------------------------------------------------ |
| `fullName`    | `string` | 1-100 chars                                                  |
| `gender`      | `string` | `"male"` \| `"female"` \| `"other"` \| `"prefer_not_to_say"` |
| `age`         | `number` | Integer, 13-120                                              |
| `height`      | `number` | Positive, max 300                                            |
| `heightUnit`  | `string` | `"cm"` \| `"in"`                                             |
| `weight`      | `number` | Positive, max 700                                            |
| `weightUnit`  | `string` | `"kg"` \| `"lb"`                                             |
| `fitnessGoal` | `string` | Max 200 chars                                                |

```json
{
  "fullName": "John Doe",
  "age": 28,
  "fitnessGoal": "Build muscle"
}
```

### How It Works

```
Client sends: { fullName: "John Doe", age: 28 }
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  Zod validates each field against profileUpdateSchema
         │  Check Object.keys(updates).length > 0 → reject empty body
         │
         ▼
Step 2 — Upsert (single query)
         │  INSERT INTO profiles (id, fullName, age, updatedAt)
         │  VALUES (:userId, 'John Doe', 28, now())
         │  ON CONFLICT (id) DO UPDATE SET
         │    fullName = 'John Doe', age = 28, updatedAt = now()
         │  RETURNING *
         │
         │  Row exists?  → updates only the provided fields, leaves others untouched
         │  Row missing?  → creates new profile with provided fields + defaults
         │
         ▼
Step 3 — Return full profile
         │  formatProfile(profile) → same shape as GET /api/profiles
```

**Key detail: true upsert.** Uses Drizzle's `insert().onConflictDoUpdate()` on the PK. This means the first PATCH ever sent creates the profile row — no need for a separate "create profile" endpoint. Only the fields you send are updated; omitted fields remain unchanged (or null on first create).

**Key detail: updatedAt always refreshes.** Every write sets `updatedAt = now()` regardless of which fields changed.

### Response

**200 — Profile upserted**

Same shape as `GET /api/profiles` response.

**400 — Empty body**

```json
{ "error": "No fields to update" }
```

### Logging

Tag: `[profiles]`

### Client Use Case

Called from the onboarding flow (first time) or profile settings screen (updates). Can send a single field like `{ weight: 82 }` without touching other fields.

---

## 5. GET /api/schedules

Fetch the user's weekly workout schedule (7 days) with embedded workout data.

### Request

```
GET /api/schedules
Authorization: Bearer <token>
```

### How It Works

```
Client sends: GET /api/schedules
         │
         ▼
Step 1 — Auth
         │  getAuthUser() → userId
         │
         ▼
Step 2 — Query with nested joins
         │  SELECT weekly_schedules.*,
         │         workouts.* (excluding rawTranscript),
         │         exercises.*
         │  FROM weekly_schedules
         │  LEFT JOIN workouts ON schedule.workoutId = workouts.id
         │  LEFT JOIN exercises ON exercises.workoutId = workouts.id
         │  WHERE weekly_schedules.userId = :userId
         │  ORDER BY dayOfWeek ASC, exercises.order ASC
         │
         │  Drizzle relational query handles the join + nesting automatically
         │
         ▼
Step 3 — Map to response format
         │  For each entry:
         │    entry.workout exists? → formatWorkoutResponse(workout) with exercises
         │    rest day?             → workout: null
         │
         │  Return array of 0-7 entries (empty [] if no schedule set)
```

**Key detail: rawTranscript excluded.** The query uses `columns: { rawTranscript: false }` to avoid sending potentially large transcript text to the client.

**Key detail: can return 0-7 items.** If the user hasn't set a schedule yet, returns `[]`. Once set via PUT, always returns exactly 7 entries (one per day).

### Response

**200 — Schedule entries (array, 0-7 items)**

```json
[
  {
    "id": "uuid",
    "day_of_week": 0,
    "workout_id": "uuid",
    "is_rest_day": false,
    "workout": {
      "id": "uuid",
      "title": "Upper Body Push",
      "description": "...",
      "platform": "tiktok",
      "creatorName": "FitCreator",
      "creatorHandle": "@fitcreator",
      "sourceUrl": "https://...",
      "thumbnailUrl": "https://...",
      "estimatedDurationMinutes": 45,
      "difficulty": "intermediate",
      "targetMuscles": ["chest", "shoulders"],
      "equipment": ["dumbbells", "bench"],
      "createdAt": "2025-01-15T12:00:00.000Z",
      "isPersonalCopy": true,
      "templateId": "uuid",
      "exercises": [
        {
          "id": "uuid",
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "targetWeight": 60,
          "restBetweenSets": "90s",
          "notes": null,
          "order": 0,
          "muscleGroups": ["chest", "triceps"],
          "isBodyweight": false,
          "catalogExerciseId": "uuid | null"
        }
      ]
    },
    "created_at": "2025-01-15T12:00:00.000Z",
    "updated_at": "2025-01-15T12:00:00.000Z"
  }
]
```

For rest days, `workout_id` is `null`, `is_rest_day` is `true`, and `workout` is `null`.

Returns empty array `[]` if no schedule has been set.

### Logging

Tag: `[clip2fit:schedules]`

Logs: userId, entry count.

### Client Use Case

Renders the weekly planner screen. Each day shows either the assigned workout card (with exercises) or a "Rest Day" label.

---

## 6. PUT /api/schedules

Replace the entire weekly schedule. Deletes all existing entries and inserts new ones in a transaction.

### Request

```
PUT /api/schedules
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

| Field     | Type    | Required | Validation                                                      |
| --------- | ------- | -------- | --------------------------------------------------------------- |
| `entries` | `array` | Yes      | Exactly 7 items, one per day (0-6), unique `day_of_week` values |

**Entry object:**

| Field         | Type             | Validation                              |
| ------------- | ---------------- | --------------------------------------- |
| `day_of_week` | `number`         | Integer, 0-6 (0=Mon, 6=Sun)             |
| `workout_id`  | `string \| null` | UUID or null                            |
| `is_rest_day` | `boolean`        | Cannot be `true` if `workout_id` is set |

```json
{
  "entries": [
    { "day_of_week": 0, "workout_id": "uuid-1", "is_rest_day": false },
    { "day_of_week": 1, "workout_id": "uuid-2", "is_rest_day": false },
    { "day_of_week": 2, "workout_id": null, "is_rest_day": true },
    { "day_of_week": 3, "workout_id": "uuid-1", "is_rest_day": false },
    { "day_of_week": 4, "workout_id": "uuid-2", "is_rest_day": false },
    { "day_of_week": 5, "workout_id": null, "is_rest_day": true },
    { "day_of_week": 6, "workout_id": null, "is_rest_day": true }
  ]
}
```

### How It Works

```
Client sends: { entries: [ 7 day entries ] }
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  Zod validates:
         │    - entries array has exactly 7 items
         │    - each day_of_week is unique (Set size check)
         │    - per-entry: can't have workout_id AND is_rest_day both true
         │
         ▼
Step 2 — Verify workout ownership
         │  Collect all non-null workout_ids → deduplicate
         │  SELECT workoutId FROM user_workouts
         │  WHERE userId = :user AND workoutId IN (:ids)
         │
         │  Compare returned IDs against requested IDs:
         │  Missing any? → 400 { error: "Workout(s) not in your library", workoutIds: [...] }
         │
         ▼
Step 3 — Transaction: delete-then-insert
         │  BEGIN
         │    DELETE FROM weekly_schedules WHERE userId = :user
         │    INSERT INTO weekly_schedules VALUES (7 rows)
         │  COMMIT
         │
         │  This is a full replacement — no partial updates
         │
         ▼
Step 4 — Re-fetch with workouts
         │  Same query as GET /api/schedules (with nested workouts + exercises)
         │  Return the fresh schedule
```

**Key detail: full replacement.** PUT semantics — the entire schedule is replaced atomically. The client must always send all 7 days. There's no way to update a single day.

**Key detail: workout ownership check prevents assigning workouts you don't have.** Even if you know another user's workout UUID, you can't put it in your schedule.

**Key detail: DB constraints double-check.** The `weekly_schedules` table has a `UNIQUE(userId, dayOfWeek)` constraint and a `CHECK` constraint that prevents `workoutId IS NOT NULL AND isRestDay = true` simultaneously.

### Response

**200 — Schedule replaced**

Same shape as `GET /api/schedules` response (full schedule with embedded workouts).

**400 — Workout not in library**

```json
{
  "error": "Workout(s) not in your library",
  "workoutIds": ["uuid-missing"]
}
```

### Logging

Tag: `[clip2fit:schedules]`

Logs: userId, entry count.

### Client Use Case

User rearranges workouts on the weekly planner and hits "Save". The app sends the entire 7-day grid as one PUT request.

---

## 7. POST /api/sessions

Log a workout session with exercise logs, set logs, and automatic PR detection.

### Request

```
POST /api/sessions
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

| Field          | Type             | Required | Validation                   |
| -------------- | ---------------- | -------- | ---------------------------- |
| `workout_id`   | `string`         | Yes      | UUID                         |
| `status`       | `string`         | Yes      | `"completed"` \| `"partial"` |
| `started_at`   | `string`         | Yes      | ISO 8601 datetime            |
| `completed_at` | `string \| null` | Yes      | ISO 8601 datetime or null    |
| `exercises`    | `array`          | Yes      | Exercise log objects         |

**Exercise log object:**

| Field         | Type     | Validation                                  |
| ------------- | -------- | ------------------------------------------- |
| `exercise_id` | `string` | UUID                                        |
| `status`      | `string` | `"completed"` \| `"skipped"` \| `"pending"` |
| `order`       | `number` | Integer                                     |
| `sets`        | `array`  | Set log objects                             |

**Set log object:**

| Field           | Type             | Validation                                  |
| --------------- | ---------------- | ------------------------------------------- |
| `set_number`    | `number`         | Positive integer                            |
| `target_reps`   | `string \| null` |                                             |
| `target_weight` | `number \| null` |                                             |
| `actual_reps`   | `number \| null` | Integer                                     |
| `actual_weight` | `number \| null` |                                             |
| `status`        | `string`         | `"completed"` \| `"skipped"` \| `"pending"` |

```json
{
  "workout_id": "uuid",
  "status": "completed",
  "started_at": "2025-01-15T10:00:00.000Z",
  "completed_at": "2025-01-15T11:00:00.000Z",
  "exercises": [
    {
      "exercise_id": "uuid",
      "status": "completed",
      "order": 0,
      "sets": [
        {
          "set_number": 1,
          "target_reps": "8-10",
          "target_weight": 60,
          "actual_reps": 10,
          "actual_weight": 65,
          "status": "completed"
        }
      ]
    }
  ]
}
```

### How It Works

```
Client sends: { workout_id, status, started_at, completed_at, exercises[] }
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  Zod validates full nested structure (session → exercises → sets)
         │
         ▼
Step 2 — Verify workout ownership
         │  SELECT FROM user_workouts
         │  WHERE userId = :user AND workoutId = :workout_id
         │
         │  Not found? → 400 "Workout not in your library"
         │
         ▼
Step 3 — Compute duration
         │  If completed_at is not null:
         │    durationSeconds = (completed_at - started_at) / 1000
         │  Else: durationSeconds = null
         │
         ▼
Step 4 — Fetch exercise names (for PR response)
         │  SELECT id, name FROM exercises WHERE id IN (:exerciseIds)
         │  Build map: { exerciseId → "Bench Press" }
         │
         ▼
Step 5 — Transaction: insert session → exercise logs → set logs
         │  BEGIN
         │    INSERT workout_sessions → get sessionId
         │    FOR each exercise:
         │      INSERT session_exercise_logs → get exerciseLogId
         │      INSERT session_set_logs (bulk, linked to exerciseLogId)
         │  COMMIT
         │
         ▼
Step 6 — PR Detection (dual-scope: global + local)
         │
         │  Step A — Fetch catalog mappings
         │    SELECT id, catalog_exercise_id FROM exercises
         │    WHERE id IN (:exerciseIds)
         │    Build map: { exerciseId → catalogExerciseId | null }
         │
         │  Step B — Build current session max weights
         │    Loop all exercises → all sets
         │    Filter: status="completed" AND actual_weight > 0
         │    Track highest weight per exercise_id
         │
         │    Example:
         │      Bench Press (ex-1, catalog=cat-1): sets [60kg, 65kg, 60kg] → max = 65
         │      Squat (ex-2, catalog=null): sets [80kg, 85kg] → max = 85
         │    currentMaxWeights = { "ex-1": 65, "ex-2": 85 }
         │
         │  Step C — Split into global vs local exercises
         │    Catalog-mapped exercises → global PR (compare across ALL workouts)
         │    Unmapped exercises → local PR (compare within same workout only)
         │
         │  Step D — Global PR query (catalog-mapped)
         │    SELECT exercises.catalog_exercise_id, MAX(actual_weight)
         │    FROM session_set_logs
         │      JOIN session_exercise_logs
         │      JOIN workout_sessions
         │      JOIN exercises ON exerciseId = exercises.id
         │    WHERE userId = :user                            ← NO workoutId filter!
         │      AND sessionId != :currentSessionId
         │      AND catalog_exercise_id IN (:catalogIds)
         │      AND set status = "completed" AND actual_weight > 0
         │    GROUP BY catalog_exercise_id
         │
         │    This compares across ALL workouts for the same catalog exercise.
         │    Bench Press in Workout A and Workout B share the same catalog entry,
         │    so 100kg in Workout A means 65kg in Workout B is NOT a PR.
         │
         │  Step E — Local PR query (unmapped)
         │    SELECT exerciseId, MAX(actual_weight)
         │    FROM session_set_logs
         │      JOIN session_exercise_logs
         │      JOIN workout_sessions
         │    WHERE workoutId = :workout AND userId = :user   ← scoped to this workout
         │      AND sessionId != :currentSessionId
         │      AND set status = "completed" AND actual_weight > 0
         │    GROUP BY exerciseId
         │
         │  Step F — Compare current vs previous
         │    For each exercise (global or local):
         │      newWeight > previousWeight → PR!
         │      previousWeight = null → first time, also counts as PR
         │      newWeight <= previousWeight → not a PR
         │
         ▼
Step 7 — Return session ID + PRs
         │  { id: sessionId, prs: [...] }
```

**Key detail: PRs use a dual-scope strategy.** Exercises mapped to the exercise catalog (via `catalogExerciseId`) get **global PRs** — compared across ALL workouts. Unmapped exercises fall back to **per-workout PRs** — compared only within the same workout. This means if you bench 100kg in Workout A and bench 65kg in Workout B, it won't be a PR in Workout B if both exercises are mapped to the same catalog entry. But if the exercises are unmapped, they're treated independently per workout.

**Key detail: the current session is excluded from the comparison.** The query uses `sessionId != :currentSessionId` so you're always comparing against _previous_ sessions, not the one being logged.

**Key detail: only completed sets with weight > 0 count.** Skipped sets, pending sets, and bodyweight exercises (weight=0 or null) are ignored for PR detection.

### Response

**201 — Session logged**

```json
{
  "id": "uuid",
  "prs": [
    {
      "exercise_name": "Bench Press",
      "exercise_id": "uuid",
      "catalog_exercise_id": "uuid | null",
      "new_weight": 65,
      "previous_weight": 60
    }
  ]
}
```

`prs` is an array of personal records detected. Empty `[]` if no PRs. `previous_weight` is `null` if this is the first time the exercise was logged with weight. `catalog_exercise_id` is the catalog entry UUID if the exercise is mapped (global PR), or `null` if unmapped (per-workout PR).

**400 — Workout not in library**

```json
{ "error": "Workout not in your library" }
```

### Logging

Tag: `[clip2fit:sessions]`

Logs: userId, sessionId, status, PR count.

### Client Use Case

User finishes a workout session. The app sends all logged sets/reps/weights. On success, if `prs` is non-empty, show a celebration screen. The app can display "New PR on Bench Press! 65kg (was 60kg)".

---

## 8. GET /api/sessions/last

Get the most recent session for a workout, plus whether the workout was completed today.

### Request

```
GET /api/sessions/last?workoutId=<uuid>&timezone=<IANA>
Authorization: Bearer <token>
```

**Query params:**

| Param       | Type     | Required | Validation                                                                          |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------------- |
| `workoutId` | `string` | Yes      | UUID format                                                                         |
| `timezone`  | `string` | Yes      | IANA timezone format (e.g., `America/New_York`) — regex: `^[A-Za-z_]+/[A-Za-z_/]+$` |

### How It Works

```
Client sends: GET /api/sessions/last?workoutId=abc&timezone=America/New_York
         │
         ▼
Step 1 — Auth + Validate params
         │  getAuthUser() → userId
         │  Validate workoutId: required + UUID regex
         │  Validate timezone: required + IANA regex (e.g., "America/New_York")
         │
         ▼
Step 2 — Verify workout ownership
         │  SELECT FROM user_workouts
         │  WHERE userId = :user AND workoutId = :workoutId
         │
         │  Not found? → 400 "Workout not in your library"
         │
         ▼
Step 3 — Fetch last session with nested data
         │  SELECT workout_sessions.*
         │    WITH exerciseLogs (ordered by order ASC)
         │      WITH setLogs (ordered by setNumber ASC)
         │  WHERE userId = :user AND workoutId = :workoutId
         │  ORDER BY completedAt DESC, createdAt DESC
         │  LIMIT 1
         │
         ▼
Step 4 — Check "completed today" (timezone-aware)
         │  SELECT COUNT(*) FROM workout_sessions
         │  WHERE userId = :user AND workoutId = :workoutId
         │    AND (created_at AT TIME ZONE 'America/New_York')::date
         │      = (now() AT TIME ZONE 'America/New_York')::date
         │
         │  count > 0 → completedToday = true
         │
         ▼
Step 5 — Filter and return
         │  Remove exercise logs with status = "pending"
         │  Remove set logs with status = "pending"
         │  (only return completed/skipped data to the client)
         │
         │  Session exists? → { session: { ... }, completed_today: true/false }
         │  No session?     → { session: null, completed_today: false }
```

**Key detail: timezone-aware "today" check.** The query converts both `created_at` and `now()` to the user's timezone before comparing dates. A session logged at 11pm EST on Monday won't show as "completed today" on Tuesday morning EST, even though it's still Tuesday in UTC.

**Key detail: pending items filtered out.** The response only includes exercises and sets the user actually interacted with (completed or skipped). Pending items are stripped so the app doesn't show unfinished data from a partial session.

**Key detail: last session = most recent by completedAt, then createdAt.** This handles both completed sessions (sorted by when they finished) and partial sessions that may not have a `completedAt`.

### Response

**200 — Session found**

```json
{
  "session": {
    "id": "uuid",
    "workout_id": "uuid",
    "status": "completed",
    "started_at": "2025-01-15T10:00:00.000Z",
    "completed_at": "2025-01-15T11:00:00.000Z",
    "duration_seconds": 3600,
    "completed_today": true,
    "exercises": [
      {
        "exercise_id": "uuid",
        "status": "completed",
        "order": 0,
        "sets": [
          {
            "set_number": 1,
            "actual_reps": 10,
            "actual_weight": 65,
            "status": "completed"
          }
        ]
      }
    ]
  },
  "completed_today": true
}
```

**200 — No previous session**

```json
{
  "session": null,
  "completed_today": false
}
```

**400 — Missing/invalid params**

```json
{ "error": "workoutId is required" }
{ "error": "Invalid workoutId" }
{ "error": "timezone is required" }
{ "error": "Invalid timezone" }
{ "error": "Workout not in your library" }
```

### Logging

Tag: `[clip2fit:sessions]`

Logs: userId, workoutId, sessionId, completedToday.

### Client Use Case

Called before showing a workout to:

1. Pre-fill target weights/reps from the last session's actual values.
2. Show a "Completed today" badge on the schedule screen.
3. Show "First time!" if `session` is null.

---

## 9. GET /api/workouts

List all workouts in the user's library.

### Request

```
GET /api/workouts
Authorization: Bearer <token>
```

No query params.

### How It Works

```
Client sends: GET /api/workouts
         │
         ▼
Step 1 — Auth
         │  getAuthUser() → userId
         │
         ▼
Step 2 — Query via junction table
         │  SELECT user_workouts.*
         │    WITH workout (excluding rawTranscript)
         │      WITH exercises (ordered by order ASC)
         │  WHERE user_workouts.userId = :userId
         │  ORDER BY user_workouts.addedAt DESC
         │
         │  This goes through the user_workouts junction table, not workouts directly.
         │  So a user only sees workouts they've added to their library.
         │
         ▼
Step 3 — Format each workout
         │  For each link in results:
         │    formatWorkoutResponse(link.workout) → adds:
         │      isPersonalCopy: true if workout.userId is not null
         │      templateId: UUID of the original template (if cloned)
         │      exercises: mapped with id, name, sets, reps, targetWeight, etc.
         │
         │  Return array (empty [] if user has no workouts)
```

**Key detail: goes through user_workouts, not workouts table.** Users never see shared templates or other users' clones. They only see workouts linked to them via the junction table.

**Key detail: rawTranscript is excluded.** The AI-generated transcript can be very large. It's stripped from list responses to keep payloads small.

**Key detail: addedAt ordering.** Most recently added workouts appear first. This is the order they were converted/cloned, not when the original video was posted.

### Response

**200 — Workout list**

```json
[
  {
    "id": "uuid",
    "title": "Upper Body Push",
    "description": "...",
    "platform": "tiktok",
    "creatorName": "FitCreator",
    "creatorHandle": "@fitcreator",
    "sourceUrl": "https://...",
    "thumbnailUrl": "https://...",
    "estimatedDurationMinutes": 45,
    "difficulty": "intermediate",
    "targetMuscles": ["chest", "shoulders"],
    "equipment": ["dumbbells", "bench"],
    "createdAt": "2025-01-15T12:00:00.000Z",
    "isPersonalCopy": true,
    "templateId": "uuid",
    "exercises": [
      {
        "id": "uuid",
        "name": "Bench Press",
        "sets": 4,
        "reps": "8-10",
        "targetWeight": 60,
        "restBetweenSets": "90s",
        "notes": null,
        "order": 0,
        "muscleGroups": ["chest", "triceps"],
        "isBodyweight": false,
        "catalogExerciseId": "uuid | null"
      }
    ]
  }
]
```

Returns empty array `[]` if the user has no workouts.

### Logging

Tag: `[clip2fit:workouts]`

Logs: userId, count.

### Client Use Case

Renders the "My Workouts" library screen. Each workout card shows title, creator, platform, difficulty, and exercise count.

---

## 10. GET /api/workouts/[id]

Fetch a single workout with its exercises.

### Request

```
GET /api/workouts/:id
Authorization: Bearer <token>
```

**Path params:**

| Param | Type     | Validation  |
| ----- | -------- | ----------- |
| `id`  | `string` | UUID format |

### How It Works

```
Client sends: GET /api/workouts/abc-123
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  UUID regex test on :id
         │
         ▼
Step 2 — Check access via junction table
         │  findAccessibleWorkout(userId, workoutId):
         │    SELECT FROM user_workouts
         │    WHERE userId = :user AND workoutId = :id
         │
         │    No link? → return null → 404 "Workout not found"
         │
         ▼
Step 3 — Fetch full workout
         │  SELECT workouts.* WITH exercises (ordered by order ASC)
         │  WHERE workouts.id = :id
         │
         │  (includes rawTranscript — not excluded like in the list endpoint)
         │
         ▼
Step 4 — Format + return
         │  formatWorkoutResponse(workout) → full workout object with exercises
```

**Key detail: 404, not 403.** If the workout exists but doesn't belong to the user, it returns the same 404 as a non-existent workout. This prevents enumeration attacks — you can't probe UUIDs to discover what exists.

**Key detail: two-query access check.** First checks the junction table (does user have access?), then fetches the workout data. This is `findAccessibleWorkout()` — a shared helper used by GET, PATCH, and DELETE.

### Response

**200 — Workout found**

Same shape as a single item from `GET /api/workouts` (see section 9).

**400 — Invalid ID**

```json
{ "error": "Invalid workout ID" }
```

**404 — Not found or not in user's library**

```json
{ "error": "Workout not found" }
```

### Logging

Tag: `[clip2fit:workouts]`

Logs: workoutId, userId, exerciseCount.

### Client Use Case

Called when the user taps a workout card to see the full exercise list, or after a conversion completes to load the newly created workout.

---

## 11. PATCH /api/workouts/[id]

Update a workout's metadata and/or replace its exercises.

### Request

```
PATCH /api/workouts/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Path params:**

| Param | Type     | Validation  |
| ----- | -------- | ----------- |
| `id`  | `string` | UUID format |

**Body (all fields optional):**

| Field         | Type             | Validation                      |
| ------------- | ---------------- | ------------------------------- |
| `title`       | `string`         | Min 1 char                      |
| `description` | `string \| null` |                                 |
| `exercises`   | `array`          | Exercise objects (replaces all) |

**Exercise object:**

| Field               | Type             | Validation                                 |
| ------------------- | ---------------- | ------------------------------------------ |
| `name`              | `string`         | Min 1 char                                 |
| `sets`              | `number`         | Positive integer                           |
| `reps`              | `string`         | Min 1 char                                 |
| `targetWeight`      | `number \| null` | Optional                                   |
| `restBetweenSets`   | `string \| null` | Optional                                   |
| `notes`             | `string \| null` | Optional                                   |
| `order`             | `number`         | Integer                                    |
| `muscleGroups`      | `string[]`       | Defaults to `[]`                           |
| `isBodyweight`      | `boolean`        | Defaults to `false`                        |
| `catalogExerciseId` | `string \| null` | UUID of matching catalog exercise, or null |

```json
{
  "title": "My Custom Upper Body",
  "exercises": [
    {
      "name": "Incline Bench Press",
      "sets": 4,
      "reps": "8-10",
      "targetWeight": 50,
      "restBetweenSets": "90s",
      "notes": null,
      "order": 0,
      "muscleGroups": ["chest", "shoulders"],
      "isBodyweight": false,
      "catalogExerciseId": "uuid | null"
    }
  ]
}
```

### How It Works

```
Client sends: { title: "My Custom Upper Body", exercises: [...] }
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  UUID regex on :id
         │  Zod validates body against workoutUpdateSchema
         │  Separates: { exercises: newExercises, ...workoutUpdates }
         │
         ▼
Step 2 — Verify ownership
         │  SELECT FROM user_workouts
         │  WHERE userId = :user AND workoutId = :id
         │
         │  Not found? → 404 "Workout not found"
         │
         ▼
Step 3 — Transaction: update metadata + replace exercises
         │  BEGIN
         │    IF workoutUpdates has keys (title, description):
         │      UPDATE workouts SET title = :title, ...
         │      WHERE id = :id AND userId IS NOT NULL   ← only clones!
         │      (shared templates with userId=NULL are never modified)
         │
         │    IF exercises array provided:
         │      DELETE FROM exercises WHERE workoutId = :id
         │      INSERT exercises (all new rows with workoutId = :id)
         │  COMMIT
         │
         ▼
Step 4 — Re-fetch and return
         │  SELECT workouts.* WITH exercises (ordered by order ASC)
         │  formatWorkoutResponse(workout) → full updated workout
```

**Key detail: exercises are fully replaced, not patched.** If you send an `exercises` array, ALL existing exercises are deleted and replaced with the new set. There's no way to update a single exercise — the client must send the complete list.

**Key detail: template protection.** The `UPDATE workouts` query includes `WHERE userId IS NOT NULL`. Shared templates (userId=NULL) are never modified, even if you somehow have a junction row pointing to one. Only personal clones can be edited.

**Key detail: metadata and exercises are independent.** You can send just `{ title: "New Name" }` without touching exercises, or just `{ exercises: [...] }` without changing the title. Or both at once.

### Response

**200 — Updated workout**

Same shape as `GET /api/workouts/[id]` response.

**404 — Not found**

```json
{ "error": "Workout not found" }
```

### Logging

Tag: `[clip2fit:workouts]`

Logs: workoutId, userId, exerciseCount (or "unchanged").

### Client Use Case

User edits a workout — renames it, reorders exercises, changes sets/reps, removes an exercise, or adds a new one. The app sends the full updated exercise list on save.

---

## 12. DELETE /api/workouts/[id]

Remove a workout from the user's library. Cleans up related schedule entries and conversion job references.

### Request

```
DELETE /api/workouts/:id
Authorization: Bearer <token>
```

**Path params:**

| Param | Type     | Validation  |
| ----- | -------- | ----------- |
| `id`  | `string` | UUID format |

### How It Works

```
Client sends: DELETE /api/workouts/abc-123
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  UUID regex on :id
         │
         ▼
Step 2 — Verify ownership
         │  SELECT FROM user_workouts
         │  WHERE userId = :user AND workoutId = :id
         │
         │  Not found? → 404 "Workout not found"
         │
         ▼
Step 3 — Transaction: cascading cleanup
         │  BEGIN
         │    1. UPDATE conversion_jobs SET workoutId = NULL
         │       WHERE workoutId = :id
         │       (don't delete the job history, just unlink)
         │
         │    2. UPDATE weekly_schedules
         │       SET workoutId = NULL, isRestDay = true
         │       WHERE userId = :user AND workoutId = :id
         │       (schedule slots become rest days)
         │
         │    3. DELETE FROM user_workouts
         │       WHERE userId = :user AND workoutId = :id
         │       (remove from user's library)
         │
         │    4. DELETE FROM workouts
         │       WHERE id = :id AND userId IS NOT NULL
         │       (only delete personal clones, NEVER shared templates)
         │  COMMIT
         │
         ▼
Step 4 — Return 204 No Content
```

**Key detail: cascading cleanup order matters.** Jobs are unlinked first (so they don't reference a deleted workout), then schedules are converted to rest days, then the junction row is removed, and finally the workout itself is deleted.

**Key detail: shared templates are never deleted.** Step 4 includes `WHERE userId IS NOT NULL`. If this workout is a shared template (userId=NULL), the workout row survives — only the user's link is removed. This means other users who cloned from it are unaffected, and future conversions of the same URL can still hit the Tier 2 dedup.

**Key detail: conversion history is preserved.** Jobs aren't deleted, just unlinked (`workoutId = NULL`). The user's conversion history remains intact even after removing the workout.

**Key detail: exercises cascade automatically.** The `exercises` table has `ON DELETE CASCADE` on `workoutId`, so when the workout row is deleted, its exercises are removed by the database.

### Response

**204 — Deleted (no body)**

**400 — Invalid ID**

```json
{ "error": "Invalid workout ID" }
```

**404 — Not found or not in user's library**

```json
{ "error": "Workout not found" }
```

### Logging

Tag: `[clip2fit:workouts]`

Logs: workoutId, userId.

### Client Use Case

User long-presses a workout and taps "Remove". The workout disappears from their library, and any schedule slots referencing it automatically become rest days. Conversion job history is preserved.

---

## 13. GET /api/exercises/catalog

Browse the curated exercise catalog (259 exercises across 8 categories). Supports optional text search. The catalog powers global PR tracking — exercises mapped to catalog entries share PR history across all workouts.

### Request

```
GET /api/exercises/catalog
GET /api/exercises/catalog?search=bench
Authorization: Bearer <token>
```

**Query params:**

| Param    | Type     | Required | Description                                               |
| -------- | -------- | -------- | --------------------------------------------------------- |
| `search` | `string` | No       | Case-insensitive search against exercise name and aliases |

### How It Works

```
Client sends: GET /api/exercises/catalog?search=bench
         │
         ▼
Step 1 — Auth
         │  getAuthUser() → userId
         │
         ▼
Step 2 — Query
         │  No search param? → SELECT * FROM exercise_catalog ORDER BY name ASC
         │  With search?     → WHERE name ILIKE '%bench%'
         │                       OR aliases::text ILIKE '%bench%'
         │                     ORDER BY name ASC
         │
         ▼
Step 3 — Return results
         │  Map each row to response shape
         │  Return array (full catalog or filtered results)
```

**Key detail: aliases are searched too.** The search queries both `name` and the `aliases` JSONB column (cast to text for ILIKE matching). So searching "flat bench" will match exercises with "Flat Bench Press" in their aliases. Searching "OHP" will match "Overhead Press" which has "OHP" as an alias.

**Key detail: no pagination.** The catalog is small enough (~259 rows) to return in full. No offset/limit needed.

### Catalog Structure

The catalog contains 259 exercises across 8 categories:

| Category    | Count | Examples                                                  |
| ----------- | ----- | --------------------------------------------------------- |
| `chest`     | 31    | Barbell Bench Press, Dumbbell Flyes, Cable Crossover      |
| `back`      | 32    | Barbell Row, Pull-Up, Lat Pulldown, Face Pull             |
| `legs`      | 53    | Barbell Squat, Romanian Deadlift, Leg Press, Hip Thrust   |
| `shoulders` | 30    | Overhead Press, Lateral Raise, Rear Delt Fly              |
| `arms`      | 37    | Barbell Curl, Hammer Curl, Tricep Pushdown, Skull Crusher |
| `core`      | 27    | Plank, Hanging Leg Raise, Cable Woodchop, Ab Rollout      |
| `cardio`    | 21    | Running, Jump Rope, Burpees, Battle Ropes                 |
| `full_body` | 28    | Clean and Press, Turkish Get-Up, Kettlebell Swing         |

Each exercise includes:

- **name** — Proper exercise name (unique across catalog)
- **aliases** — Common alternative names (e.g., "Bench Press" → "Flat Bench", "Barbell Press")
- **primaryMuscleGroups** — Specific muscles worked (e.g., "quadriceps", "anterior deltoids", "rectus abdominis")
- **equipment** — Required equipment (e.g., "barbell", "dumbbell", "cable machine", "bench")
- **isBodyweight** — `true` only for exercises using no external weight
- **category** — One of the 8 categories above

### How the Catalog Integrates

1. **During conversion**: The Trigger.dev worker loads the full catalog and passes it to GPT-4o-mini. The LLM matches each extracted exercise to the closest catalog entry and sets `catalogExerciseId`.
2. **During session logging**: Exercises with `catalogExerciseId` get **global PRs** (compared across all workouts). Unmapped exercises fall back to per-workout PRs.
3. **During PATCH**: Clients can manually set `catalogExerciseId` on exercises when editing a workout.

### Response

**200 — Catalog entries**

```json
[
  {
    "id": "uuid",
    "name": "Barbell Bench Press",
    "aliases": ["Bench Press", "Flat Bench Press", "Flat Barbell Press"],
    "primaryMuscleGroups": ["chest", "triceps", "anterior deltoids"],
    "equipment": ["barbell", "bench"],
    "isBodyweight": false,
    "category": "chest"
  }
]
```

Returns empty array `[]` if no matches found. Returns full catalog (259 items) when no `search` param is provided.

### Logging

Tag: `[clip2fit:catalog]`

Logs: userId, search term, result count.

### Client Use Case

Used for:

1. **Exercise picker** — browse/search catalog when building or editing a workout
2. **Catalog matching** — map user-entered exercise names to catalog entries for global PR tracking
3. **Exercise details** — show muscle groups, equipment, and category in the UI
4. **Autocomplete** — power a search-as-you-type exercise selector using the `?search=` param

---

## 14. GET /api/stats/summary

Training summary with session counts, volume, streaks, weekly frequency, top exercises, and muscle group distribution. All stats are computed on-the-fly from existing session data.

### Request

```
GET /api/stats/summary?timezone=<IANA>&weeks=<int>
Authorization: Bearer <token>
```

**Query params:**

| Param      | Type     | Required | Default | Validation                                      |
| ---------- | -------- | -------- | ------- | ----------------------------------------------- |
| `timezone` | `string` | Yes      | —       | IANA timezone format (e.g., `America/New_York`) |
| `weeks`    | `number` | No       | 12      | Integer, 1-104                                  |

### How It Works

```
Client sends: GET /api/stats/summary?timezone=America/New_York&weeks=12
         │
         ▼
Step 1 — Auth + Validate params
         │  getAuthUser() → userId
         │  Validate timezone: required + IANA regex
         │  Validate weeks: optional, parseInt, 1-104 range
         │
         ▼
Step 2 — Run 4 parallel queries (Promise.all)
         │
         │  Q1: Session aggregates
         │    SELECT count(*), count(completed), count(partial), avg(duration)
         │    FROM workout_sessions WHERE userId = :user
         │
         │  Q2: Weekly frequency + volume (timezone-aware)
         │    SELECT ISO week, count(distinct sessions), sum(weight * reps)
         │    FROM workout_sessions → session_exercise_logs → session_set_logs
         │    WHERE userId = :user AND started_at >= now() - :weeks weeks
         │    GROUP BY ISO week (using AT TIME ZONE for correct week boundaries)
         │
         │  Q3: Top 10 exercises by session count
         │    SELECT exercise name, count(distinct sessions)
         │    FROM session_exercise_logs → exercises → exercise_catalog
         │    WHERE userId = :user AND exercise status = 'completed'
         │    GROUP BY exercise, ORDER BY count DESC, LIMIT 10
         │
         │  Q4: Muscle group distribution (JSONB unnest)
         │    SELECT muscle_group, count(distinct sessions)
         │    Unnests primary_muscle_groups from catalog (or muscle_groups from exercises)
         │    WHERE userId = :user AND exercise status = 'completed'
         │
         ▼
Step 3 — Compute streaks (JS)
         │  From Q2 weekly data:
         │    current_streak: walk backwards from current ISO week
         │    best_streak: find longest consecutive run in all active weeks
         │
         ▼
Step 4 — Return response
```

**Key detail: volume excludes bodyweight exercises.** Only sets with `actual_weight > 0` and `status = 'completed'` count toward volume, consistent with PR detection.

**Key detail: timezone affects week boundaries.** `date_trunc('week', started_at AT TIME ZONE $tz)` ensures sessions are grouped into the correct ISO week for the user's timezone.

**Key detail: total_volume is scoped to the weeks window.** Computed from the weekly frequency data, not a separate all-time query.

### Response

**200 — Summary stats**

```json
{
  "total_sessions": 42,
  "completed_sessions": 38,
  "partial_sessions": 4,
  "avg_duration_seconds": 3450,
  "total_volume": 185000,
  "current_streak_weeks": 3,
  "best_streak_weeks": 8,
  "weekly_frequency": [{ "week": "2026-W05", "sessions": 3, "volume": 12500 }],
  "top_exercises": [{ "catalog_exercise_id": "uuid|null", "exercise_name": "Bench Press", "session_count": 15 }],
  "muscle_group_distribution": [{ "muscle_group": "chest", "session_count": 12 }]
}
```

**400 — Missing/invalid params**

```json
{ "error": "timezone is required" }
{ "error": "Invalid timezone" }
{ "error": "weeks must be an integer between 1 and 104" }
```

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, weeks.

### Client Use Case

Renders the "Stats/Progress" screen. Shows total sessions, completion rate, average duration, training streaks, a weekly frequency chart, top exercises list, and muscle group distribution breakdown.

---

## 15. GET /api/stats/prs

Full PR (personal record) history for all exercises, with a timeline of every PR-breaking session. Optionally filtered to a single catalog exercise.

### Request

```
GET /api/stats/prs
GET /api/stats/prs?catalog_exercise_id=<uuid>
Authorization: Bearer <token>
```

**Query params:**

| Param                 | Type     | Required | Validation             |
| --------------------- | -------- | -------- | ---------------------- |
| `catalog_exercise_id` | `string` | No       | UUID format if present |

### How It Works

```
Client sends: GET /api/stats/prs
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  Optional catalog_exercise_id → UUID regex if present
         │
         ▼
Step 2 — CTE query with window functions
         │
         │  CTE 1: set_data
         │    For each session × exercise, find the best set (highest weight, then reps)
         │    Uses ROW_NUMBER() OVER (PARTITION BY session, exercise_key ORDER BY weight DESC, reps DESC)
         │    exercise_key = catalog_exercise_id if mapped, else exercise_id (same as POST /api/sessions)
         │    Filters: userId, completed sets, actual_weight > 0
         │
         │  CTE 2: session_maxes
         │    Picks the top set per session per exercise (rn = 1)
         │
         │  CTE 3: with_running_max
         │    Computes running MAX(weight) for each exercise across all previous sessions
         │    Uses window function: MAX(max_weight) OVER (PARTITION BY exercise_key ORDER BY started_at ROWS UNBOUNDED PRECEDING TO 1 PRECEDING)
         │
         │  Final SELECT: rows where max_weight > previous best (= PR sessions)
         │
         ▼
Step 3 — Group by exercise in JS
         │  For each exercise_key:
         │    current_pr = last entry's weight
         │    pr_timeline = chronological list of all PR entries
         │    total_pr_count = sum of all timeline lengths
         │
         ▼
Step 4 — Return response
```

**Key detail: PR grouping is consistent with POST /api/sessions.** Catalog-mapped exercises use `catalog_exercise_id` as the key (global across all workouts). Unmapped exercises use `exercise_id` (local to that workout). This means the PR history here matches exactly what was detected during session logging.

**Key detail: the query finds all PR-breaking moments.** Not just the current PR, but every session where the user set a new all-time high for that exercise. This enables a "PR progression chart" on mobile.

**Key detail: previous_weight is null for first-ever PR.** The first time an exercise is logged with weight, it's always a PR with no previous weight to compare against.

### Response

**200 — PR history**

```json
{
  "exercises": [
    {
      "catalog_exercise_id": "uuid|null",
      "exercise_name": "Bench Press",
      "current_pr": 100,
      "pr_timeline": [
        { "date": "2026-01-15", "weight": 80, "reps": 5, "previous_weight": null, "session_id": "uuid" },
        { "date": "2026-02-01", "weight": 90, "reps": 3, "previous_weight": 80, "session_id": "uuid" },
        { "date": "2026-02-14", "weight": 100, "reps": 1, "previous_weight": 90, "session_id": "uuid" }
      ]
    }
  ],
  "total_pr_count": 15
}
```

**400 — Invalid filter**

```json
{ "error": "Invalid catalog_exercise_id" }
```

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, exerciseCount, prCount.

### Client Use Case

Renders the PR history screen. Shows a list of exercises with their current PR weight and a timeline/chart of PR progression over time. The `catalog_exercise_id` filter is used when the user taps a specific exercise to see its PR history in detail.
