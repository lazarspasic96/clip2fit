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

## Timezone Behavior (Shared)

Timezone-sensitive endpoints (`/api/stats/*` and `/api/sessions/last`) follow this contract:

1. **Event instants are always UTC ISO timestamps (`...Z`)** in API responses.
2. **Resolved timezone is used only for calendar semantics**:
   - week/day bucketing
   - streak calculations
   - `completed_today` checks
3. **Timezone resolution precedence**:
   1. query `tz` (canonical override)
   2. query `timezone` (legacy alias, deprecated)
   3. `profiles.timezone`
   4. `Etc/UTC`
4. **Response metadata**:
   - `meta.timezone_used`
   - `meta.timezone_source` (`query_tz | query_timezone | profile | default_utc`)
5. **Important**: Passing `tz` or `timezone` changes calendar semantics only. Event instant timestamps (`...Z`) remain the same absolute moments.

### Deprecation Timeline

`timezone` query alias is deprecated on **February 18, 2026** and will be removed after two stable mobile releases (target removal window starts **May 2026**). New clients should use `tz` only for explicit debug overrides and otherwise rely on profile fallback.

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

**Key detail: exercise catalog matching.** When Tier 4 triggers a new conversion, the Trigger.dev worker loads the full exercise catalog (873 entries) and passes it to GPT-4o-mini during extraction. The LLM matches each extracted exercise to the closest catalog entry by name/alias and populates `catalogExerciseId`. This enables global PR tracking across workouts — exercises mapped to the same catalog entry share PR history. Unmatched exercises get `catalogExerciseId = null` and fall back to per-workout PRs.

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
         │  { id, fullName, timezone, gender, age, height, heightUnit,
         │    weight, weightUnit, fitnessGoal, createdAt, updatedAt }
```

**Key detail: profile.id = auth.users.id.** The profiles table PK is the same UUID as Supabase auth. There's no separate lookup — the JWT `sub` claim _is_ the profile ID. If the user has authenticated but never called PATCH, the row doesn't exist yet → 404.

### Response

**200 — Profile found**

```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "timezone": "Europe/Belgrade",
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
| `timezone`    | `string` | Valid IANA timezone (e.g., `Europe/Belgrade`)                |
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
         │  INSERT INTO profiles (id, fullName, timezone, age, updatedAt)
         │  VALUES (:userId, 'John Doe', 'Europe/Belgrade', 28, now())
         │  ON CONFLICT (id) DO UPDATE SET
         │    fullName = 'John Doe', timezone = 'Europe/Belgrade', age = 28, updatedAt = now()
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
Step 4 — Prepare PR detection context
         │  detectPRs() loads exercise metadata (name + catalog mapping)
         │  and computes PR deltas for response payload
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

**Key detail: additional schema rules are enforced.** `exercises` must contain at least 1 item, duplicate `exercise_id` entries are rejected, `completed_at` is required when `status="completed"`, and `completed_at` must be greater than or equal to `started_at`.

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

Get the most recent session for a workout, plus whether any session was logged today for that workout.

**Date field contract for this route**

- UTC event instants: `session.started_at`, `session.completed_at`
- Calendar artifacts: `completed_today` (resolved timezone day comparison)

### Request

```
GET /api/sessions/last?workoutId=<uuid>
GET /api/sessions/last?workoutId=<uuid>&tz=America/New_York
Authorization: Bearer <token>
```

**Query params:**

| Param       | Type     | Required | Validation                                     |
| ----------- | -------- | -------- | ---------------------------------------------- |
| `workoutId` | `string` | Yes      | UUID format                                    |
| `tz`        | `string` | No       | Valid IANA timezone                            |
| `timezone`  | `string` | No       | Valid IANA timezone (legacy alias, deprecated) |

### How It Works

```
Client sends: GET /api/sessions/last?workoutId=<uuid>
         │
         ▼
Step 1 — Auth + Validate params
         │  getAuthUser() → userId
         │  Validate workoutId: required + UUID regex
         │  Resolve timezone precedence:
         │    1) query `tz`
         │    2) query `timezone` (legacy alias)
         │    3) profiles.timezone
         │    4) Etc/UTC
         │  If query timezone is invalid → 400 Validation failed
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
         │    AND (created_at AT TIME ZONE :resolved_timezone)::date
         │      = (now() AT TIME ZONE :resolved_timezone)::date
         │
         │  count > 0 → completedToday = true (at least one session logged today)
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

**Key detail: timezone-aware "today" check.** The query converts both `created_at` and `now()` to the resolved timezone before comparing dates. A session logged at 11pm EST on Monday won't show as "today" on Tuesday morning EST, even though it's still Tuesday in UTC.

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
  "completed_today": true,
  "meta": {
    "timezone_used": "America/New_York",
    "timezone_source": "query_tz"
  }
}
```

**200 — No previous session**

```json
{
  "session": null,
  "completed_today": false,
  "meta": {
    "timezone_used": "Etc/UTC",
    "timezone_source": "default_utc"
  }
}
```

**400 — Missing/invalid params**

```json
{ "error": "workoutId is required" }
{ "error": "Invalid workoutId" }
{ "error": "Validation failed", "details": { "tz": ["Invalid IANA timezone"] } }
{ "error": "Validation failed", "details": { "timezone": ["Invalid IANA timezone"] } }
{ "error": "Workout not in your library" }
```

### Logging

Tag: `[clip2fit:sessions]`

Logs: userId, workoutId, sessionId, completedToday, timezone_used, timezone_source.

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
         ▼
Step 4 — Format + return
         │  formatWorkoutResponse(workout) → full workout object with exercises
```

**Key detail: 404, not 403.** If the workout exists but doesn't belong to the user, it returns the same 404 as a non-existent workout. This prevents enumeration attacks — you can't probe UUIDs to discover what exists.

**Key detail: two-query access check.** First checks the junction table (does user have access?), then fetches the workout data. This logic is implemented in `findAccessibleWorkout()` for the GET handler.

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

Browse the free-exercise-db catalog with pagination and filters. The catalog powers exercise browsing in mobile and global PR tracking for mapped exercises.

### Request

```
GET /api/exercises/catalog
GET /api/exercises/catalog?search=bench&page=1&pageSize=30
GET /api/exercises/catalog?muscle=chest&level=beginner&category=strength&page=1&pageSize=20
Authorization: Bearer <token>
```

**Query params:**

| Param       | Type     | Required | Description                                                |
| ----------- | -------- | -------- | ---------------------------------------------------------- |
| `search`    | `string` | No       | Case-insensitive search against exercise name and aliases  |
| `muscle`    | `string` | No       | Filter by `primaryMuscleGroups` JSON array membership      |
| `equipment` | `string` | No       | Filter by `equipment` JSON array membership                |
| `level`     | `string` | No       | `beginner` \| `intermediate` \| `expert`                   |
| `category`  | `string` | No       | free-exercise-db category (`strength`, `stretching`, etc.) |
| `force`     | `string` | No       | `push` \| `pull` \| `static`                               |
| `mechanic`  | `string` | No       | `compound` \| `isolation`                                  |
| `page`      | `number` | No       | 1-based page index. Default `1`                            |
| `pageSize`  | `number` | No       | Items per page. Default `30`, max `100`                    |

### How It Works

```
Client sends: GET /api/exercises/catalog?search=bench&page=1&pageSize=30
         │
         ▼
Step 1 — Auth
         │  getAuthUser() → userId
         │
         ▼
Step 2 — Validate query params
         │  Zod schema validates filter values and pagination bounds
         │
         ▼
Step 3 — Query
         │  Build dynamic WHERE conditions for search/filters
         │  ORDER BY name ASC
         │  LIMIT/OFFSET from page + pageSize
         │  Run count(*) query for pagination metadata
         │
         ▼
Step 4 — Return paginated response
         │  Map each row to response shape (includes computed image URLs)
         │  Return { items, pagination }
```

### Catalog Structure

The catalog now contains 873 exercises from free-exercise-db.

Image URLs are computed from `freeExerciseDbId`:

- Base URL: `EXERCISE_IMAGE_BASE_URL` env var
- Default: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises`
- Start image: `{base}/{freeExerciseDbId}/0.jpg`
- End image: `{base}/{freeExerciseDbId}/1.jpg`

Each exercise includes:

- **freeExerciseDbId** — Stable source ID from free-exercise-db
- **name** — Exercise display name
- **aliases** — Generated alias variants for search/matching
- **primaryMuscleGroups** / **secondaryMuscleGroups** — Muscle targeting data
- **equipment** — Required equipment as string array
- **isBodyweight** — Derived from free-exercise-db equipment
- **category** — free-exercise-db activity category
- **instructions** — Step list (not included in list response)
- **force**, **level**, **mechanic** — Additional metadata fields

### How the Catalog Integrates

1. **During conversion**: The Trigger.dev worker loads catalog names/aliases for `catalogExerciseId` matching.
2. **During session logging**: Exercises with `catalogExerciseId` get **global PRs** (compared across all workouts). Unmapped exercises fall back to per-workout PRs.
3. **During PATCH**: Clients can manually set `catalogExerciseId` on exercises when editing a workout.

### Response

**200 — Paginated catalog**

```json
{
  "items": [
    {
      "id": "uuid",
      "freeExerciseDbId": "Barbell_Curl",
      "name": "Barbell Curl",
      "aliases": ["BB Curl"],
      "primaryMuscleGroups": ["biceps"],
      "secondaryMuscleGroups": ["forearms"],
      "equipment": ["barbell"],
      "isBodyweight": false,
      "category": "strength",
      "force": "pull",
      "level": "beginner",
      "mechanic": "isolation",
      "images": {
        "start": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
        "end": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "total": 873,
    "totalPages": 30,
    "hasNextPage": true
  }
}
```

### Logging

Tag: `[clip2fit:catalog]`

Logs: userId, filters, page/pageSize, total, returned count.

### Client Use Case

Used for:

1. **Exercise browser** — list, filter, and paginate exercises
2. **Exercise picker** — map workout exercises to catalog entries
3. **Catalog search** — search by name or aliases

### GET /api/exercises/catalog/[id]

Fetch full details for one catalog exercise.

**Request**

```
GET /api/exercises/catalog/{catalogExerciseId}
Authorization: Bearer <token>
```

**Path params**

| Param | Type   | Required | Description           |
| ----- | ------ | -------- | --------------------- |
| `id`  | `uuid` | Yes      | Catalog exercise UUID |

**Response (200)**

```json
{
  "id": "uuid",
  "freeExerciseDbId": "Barbell_Curl",
  "name": "Barbell Curl",
  "aliases": ["BB Curl"],
  "primaryMuscleGroups": ["biceps"],
  "secondaryMuscleGroups": ["forearms"],
  "equipment": ["barbell"],
  "isBodyweight": false,
  "category": "strength",
  "instructions": ["Stand up straight while holding a barbell..."],
  "force": "pull",
  "level": "beginner",
  "mechanic": "isolation",
  "images": {
    "start": "https://.../0.jpg",
    "end": "https://.../1.jpg"
  }
}
```

**Errors**

```json
{ "error": "Invalid catalog exercise ID" }  // 400
{ "error": "Exercise not found" }           // 404
{ "error": "Unauthorized" }                 // 401
```

### Logging

Tag: `[clip2fit:catalog]`

Logs: userId, catalogExerciseId, errors.

---

## 14. GET /api/stats/summary

Dashboard overview of training activity: session counts, volume, streaks, top exercises, and muscle group distribution.

**Date field contract for this route**

- UTC event instants: `period.from`, `period.to`, `best_session.date`
- Calendar artifacts (timezone-derived): `weekly_frequency[].week`, `streaks.*`

### Request

```
GET /api/stats/summary?period=7d
GET /api/stats/summary?period=7d&tz=America/New_York
Authorization: Bearer <token>
```

**Query params:**

| Param      | Type     | Required | Default | Validation                                      |
| ---------- | -------- | -------- | ------- | ----------------------------------------------- |
| `period`   | `string` | No       | `90d`   | `7d` \| `30d` \| `90d` \| `6m` \| `1y` \| `all` |
| `tz`       | `string` | No       | —       | Valid IANA timezone                             |
| `timezone` | `string` | No       | —       | Valid IANA timezone (legacy alias, deprecated)  |

### How It Works

```
Client sends: GET /api/stats/summary?period=7d
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  Zod validates period enum
         │  Resolve timezone precedence:
         │    1) query `tz`
         │    2) query `timezone` (legacy alias)
         │    3) profiles.timezone
         │    4) Etc/UTC
         │  Invalid query timezone -> 400 Validation failed
         │
         ▼
Step 2 — Convert period to date range
         │  periodToDateRange("7d") → { from: 7 days ago, to: now }
         │
         ▼
Step 3 — Run 5 parallel queries
         │  Q1: Session aggregates (total, completed, partial, avg/total duration)
         │  Q2: Weekly frequency + volume (timezone-aware, grouped by ISO week)
         │  Q3: Best session (highest total volume in period)
         │  Q4: Top 10 exercises (by session count)
         │  Q5: Muscle group distribution (JSONB unnest of exercise muscle groups)
         │
         ▼
Step 4 — Post-processing (JS)
         │  Fill zero-weeks: insert {sessions: 0, volume: 0} for missing weeks
         │  Compute streaks: walk ISO weeks to find current + best consecutive
         │  Compute muscle group percentages: round(count / total * 100)
         │  Compute avg_per_week, avg_per_session_kg (guard div-by-zero)
         │  Convert duration_seconds → duration_minutes
         │
         ▼
Step 5 — Return formatted response
```

**Key detail: zero-week filling.** Weeks with no sessions appear as explicit `{sessions: 0, volume_kg: 0}` entries. Chart libraries need these to render gaps correctly.

**Key detail: partial sessions excluded from avg_duration.** Postgres `avg()` ignores nulls naturally.

**Key detail: muscle group distribution.** Counts distinct sessions per muscle group by unnesting JSONB from exercise catalog.

### Response

**200 — Summary data**

```json
{
  "meta": {
    "timezone_used": "America/New_York",
    "timezone_source": "query_tz"
  },
  "period": { "from": "2025-11-19T00:00:00Z", "to": "2026-02-17T00:00:00Z", "label": "90d" },
  "sessions": {
    "total": 45,
    "completed": 40,
    "partial": 5,
    "avg_duration_minutes": 52,
    "total_duration_minutes": 2340,
    "avg_per_week": 3.5
  },
  "volume": { "total_kg": 125000, "avg_per_session_kg": 2778 },
  "streaks": { "currentWeeks": 4, "bestWeeks": 8 },
  "best_session": {
    "id": "uuid",
    "date": "2026-01-20T18:30:00.000Z",
    "duration_minutes": 65,
    "volume_kg": 4500,
    "workout_title": "Upper Body Push"
  },
  "weekly_frequency": [
    { "week": "2025-W48", "sessions": 3, "volume_kg": 8500 },
    { "week": "2025-W49", "sessions": 0, "volume_kg": 0 }
  ],
  "top_exercises": [{ "catalog_exercise_id": "uuid", "name": "Barbell Bench Press", "session_count": 20 }],
  "muscle_group_distribution": [{ "muscle_group": "chest", "session_count": 12, "percentage": 25 }]
}
```

**Empty state:** Counts are 0, `best_session` is `null`, and non-weekly arrays are empty. `weekly_frequency` remains chart-friendly with zero-filled week entries for the selected range.

**400 — Invalid timezone query**

```json
{ "error": "Validation failed", "details": { "tz": ["Invalid IANA timezone"] } }
```

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, period, session count, timezone_used, timezone_source.

### Client Use Case

Renders the "Stats" dashboard. Weekly frequency powers a bar chart. Muscle group distribution powers a pie chart. Streaks and best_session are motivational highlights.

---

## 15. GET /api/stats/prs

List all personal records for catalog-mapped exercises, sorted by most recent PR date. Entry point to the PR history chart.

**Date field contract for this route**

- UTC event instants: `prs[].current_pr.date`, `prs[].first_recorded.date`
- Calendar artifacts: none in payload (aside from `meta.timezone_*`)

### Request

```
GET /api/stats/prs
GET /api/stats/prs?catalog_exercise_id=uuid
GET /api/stats/prs?tz=America/New_York
Authorization: Bearer <token>
```

**Query params:**

| Param                 | Type     | Required | Validation                                     |
| --------------------- | -------- | -------- | ---------------------------------------------- |
| `catalog_exercise_id` | `string` | No       | UUID format (filters to one exercise)          |
| `tz`                  | `string` | No       | Valid IANA timezone                            |
| `timezone`            | `string` | No       | Valid IANA timezone (legacy alias, deprecated) |

### How It Works

```
Client sends: GET /api/stats/prs
         │
         ▼
Step 1 — Auth + Validate
         │  Resolve timezone with shared precedence
         │
         ▼
Step 2 — CTE query: find all PR milestones
         │  set_data → session_maxes → with_running_max → filter new PRs
         │  Only catalog-mapped exercises, completed sets, weight > 0
         │
         ▼
Step 3 — Group by catalog_exercise_id in JS
         │  Sort by most recent PR date (descending)
         │
         ▼
Step 4 — Return formatted response
```

**Key detail: catalog-mapped only.** Unmapped exercises excluded.

**Key detail: e1RM.** Epley formula: `weight * (1 + reps / 30)`.

### Response

**200 — PR list**

```json
{
  "meta": {
    "timezone_used": "America/New_York",
    "timezone_source": "query_tz"
  },
  "prs": [
    {
      "catalog_exercise_id": "uuid",
      "exercise_name": "Barbell Bench Press",
      "current_pr": {
        "weight": 150,
        "reps": 1,
        "e1rm": 155.0,
        "date": "2026-02-10T17:30:00.000Z",
        "session_id": "uuid"
      },
      "first_recorded": { "weight": 80, "date": "2025-04-01T16:00:00.000Z" },
      "improvement_kg": 70,
      "pr_count": 8
    }
  ],
  "total_pr_count": 42
}
```

**Empty state:** `{ prs: [], total_pr_count: 0 }`.

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, exercise count, PR count, optional filter, timezone_used, timezone_source.

### Client Use Case

Renders "My PRs" list. Tapping a row navigates to `GET /api/stats/prs/[catalogExerciseId]/history`.

---

## 16. GET /api/stats/prs/[catalogExerciseId]/history

PR timeline for a single exercise — chart-ready data with running PR detection.

**Date field contract for this route**

- UTC event instants: `history[].date`, `all_time_pr.date`
- Calendar artifacts: none in payload (aside from `meta.timezone_*`)

### Request

```
GET /api/stats/prs/:catalogExerciseId/history?period=7d
GET /api/stats/prs/:catalogExerciseId/history?period=7d&tz=America/New_York
Authorization: Bearer <token>
```

**Path params:**

| Param               | Type     | Validation  |
| ------------------- | -------- | ----------- |
| `catalogExerciseId` | `string` | UUID format |

**Query params:**

| Param      | Type     | Required | Default | Validation                                      |
| ---------- | -------- | -------- | ------- | ----------------------------------------------- |
| `period`   | `string` | No       | `1y`    | `7d` \| `30d` \| `90d` \| `6m` \| `1y` \| `all` |
| `tz`       | `string` | No       | —       | Valid IANA timezone                             |
| `timezone` | `string` | No       | —       | Valid IANA timezone (legacy alias, deprecated)  |

### How It Works

```
Step 1 — Auth + Validate (UUID + period)
         Resolve timezone with shared precedence
Step 2 — Convert period to date range
Step 3 — 4 parallel queries:
         Q1: Exercise info (404 if not found)
         Q2: Session data points (period-filtered)
         Q3: All-time PR (ignores period)
         Q4: Prior all-time max before selected period
Step 4 — Running max computation in JS (seeded with prior all-time max)
Step 5 — Return chart-ready response
```

**Key detail: all_time_pr ignores period filter.** Motivational reference point.

**Key detail: is_new_pr is all-time aware.** A point is marked `is_new_pr: true` only if it exceeds the user's best weight across all history up to that session, not just within the selected period.

**Key detail: same-day sessions both returned** with full ISO timestamps.

### Response

**200 — PR history**

```json
{
  "meta": {
    "timezone_used": "America/New_York",
    "timezone_source": "query_tz"
  },
  "exercise": { "catalog_exercise_id": "uuid", "name": "Barbell Bench Press", "category": "chest" },
  "history": [
    {
      "date": "2025-03-15T17:00:00.000Z",
      "max_weight": 80,
      "reps_at_max": 8,
      "best_e1rm": 101.3,
      "is_new_pr": true,
      "session_id": "uuid"
    }
  ],
  "all_time_pr": { "weight": 150, "e1rm": 155.0, "date": "2026-01-29T06:45:00.000Z" }
}
```

**400** — Invalid catalogExerciseId. **404** — Exercise not in catalog. **Empty state:** empty history, `all_time_pr: null`.

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, catalogExerciseId, period, data point count, timezone_used, timezone_source.

### Client Use Case

Line chart: X=date, Y=max_weight (toggle to e1rm). Highlight `is_new_pr` points. all_time_pr as reference line.

---

## 17. GET /api/stats/sessions

Paginated session history with per-session metrics and best session across the entire period.

**Date field contract for this route**

- UTC event instants: `sessions[].date`, `best_session.date`
- Calendar artifacts: none in payload (aside from `meta.timezone_*`)

### Request

```
GET /api/stats/sessions?period=7d&limit=50&offset=0
GET /api/stats/sessions?period=7d&tz=America/New_York&limit=50&offset=0
Authorization: Bearer <token>
```

**Query params:**

| Param      | Type     | Required | Default | Validation                                      |
| ---------- | -------- | -------- | ------- | ----------------------------------------------- |
| `period`   | `string` | No       | `90d`   | `7d` \| `30d` \| `90d` \| `6m` \| `1y` \| `all` |
| `tz`       | `string` | No       | —       | Valid IANA timezone                             |
| `timezone` | `string` | No       | —       | Valid IANA timezone (legacy alias, deprecated)  |
| `limit`    | `number` | No       | `50`    | Integer, 1-100                                  |
| `offset`   | `number` | No       | `0`     | Integer, >= 0                                   |

### How It Works

```
Step 1 — Auth + Validate
         Resolve timezone with shared precedence
Step 2 — Convert period to date range
Step 3 — 3 parallel queries:
         Q1: Session list (paginated) with exercise_count + total_volume
         Q2: Total count for pagination
         Q3: Best session across entire period (no pagination)
Step 4 — Return with pagination metadata
```

**Key detail: best_session spans entire period** regardless of current page.

**Key detail: duration_minutes = null for partial sessions.**

### Response

**200 — Session history**

```json
{
  "meta": {
    "timezone_used": "Etc/UTC",
    "timezone_source": "default_utc"
  },
  "sessions": [
    {
      "id": "uuid",
      "workout_title": "Upper Body Push",
      "date": "2026-02-15T10:30:00.000Z",
      "duration_minutes": 55,
      "status": "completed",
      "exercise_count": 6,
      "total_volume_kg": 3200
    }
  ],
  "pagination": { "total": 45, "limit": 50, "offset": 0, "has_more": false },
  "best_session": { "id": "uuid", "date": "2026-01-20T18:30:00.000Z", "total_volume_kg": 4500 }
}
```

**Empty state:** `{ sessions: [], pagination: { total: 0, limit: 50, offset: 0, has_more: false }, best_session: null }`.

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, period, session count, limit, offset, timezone_used, timezone_source.

### Client Use Case

Scrollable "Session History" list. Each card shows date, workout name, duration, volume. best_session highlighted with badge. Infinite scroll via offset.

---

## 18. GET /api/stats/heatmap

GitHub-style daily activity heatmap with workout category coloring based on muscle group classification.

**Date field contract for this route**

- UTC event instants: `period.from`, `period.to`
- Calendar artifacts (timezone-derived): `days[].date`

### Request

```
GET /api/stats/heatmap?period=1y
GET /api/stats/heatmap?period=1y&tz=America/New_York
Authorization: Bearer <token>
```

**Query params:**

| Param      | Type     | Required | Default | Validation                                      |
| ---------- | -------- | -------- | ------- | ----------------------------------------------- |
| `period`   | `string` | No       | `1y`    | `7d` \| `30d` \| `90d` \| `6m` \| `1y` \| `all` |
| `tz`       | `string` | No       | —       | Valid IANA timezone                             |
| `timezone` | `string` | No       | —       | Valid IANA timezone (legacy alias, deprecated)  |

### Workout Category Classification

Muscles from the exercise catalog are mapped to high-level workout categories:

| Muscle                                                       | Category    |
| ------------------------------------------------------------ | ----------- |
| chest                                                        | `chest`     |
| lats, middle back, lower back, traps                         | `back`      |
| shoulders, neck                                              | `shoulders` |
| biceps, triceps, forearms                                    | `arms`      |
| quadriceps, hamstrings, glutes, calves, abductors, adductors | `legs`      |
| abdominals                                                   | `core`      |

**Classification logic:** If one category has >50% of a session's muscle groups, that's the category. Otherwise → `full_body`.

Each day's `categories` array contains the deduplicated set of categories across all sessions that day.

### How It Works

```
Client sends: GET /api/stats/heatmap?period=1y
         │
         ▼
Step 1 — Auth + Validate
         │  getAuthUser() → userId
         │  Zod validates period enum
         │  Resolve timezone precedence
         │
         ▼
Step 2 — Convert period to date range
         │  periodToDateRange("1y") → { from: 1 year ago, to: now }
         │
         ▼
Step 3 — Run 2 parallel queries
         │  Q1: Day counts (sessions per calendar day, timezone-aware)
         │  Q2: Per-session muscle groups (for classification)
         │
         ▼
Step 4 — Post-processing (JS)
         │  Classify each session → WorkoutCategory
         │  Group categories by day
         │  Merge Q1 counts with Q2 classifications
         │  Days in Q1 but not Q2 → categories = []
         │
         ▼
Step 5 — Return formatted response
```

**Key detail: only active days returned.** Days with zero sessions are omitted. The client fills blanks as grey/empty cells.

**Key detail: both completed and partial sessions count** toward `count`.

**Key detail: sessions with no logged exercises** appear in Q1 (have a count) but not Q2 (no muscles to classify), so their categories are `[]`.

### Response

**200 — Heatmap data**

```json
{
  "meta": {
    "timezone_used": "America/New_York",
    "timezone_source": "query_tz"
  },
  "period": {
    "from": "2025-02-21T00:00:00.000Z",
    "to": "2026-02-21T00:00:00.000Z",
    "label": "1y"
  },
  "days": [
    { "date": "2025-03-15", "count": 1, "categories": ["chest"] },
    { "date": "2025-03-17", "count": 2, "categories": ["back", "legs"] },
    { "date": "2025-03-20", "count": 1, "categories": [] }
  ],
  "total_sessions": 45,
  "active_days": 38
}
```

**Empty state:**

```json
{
  "meta": { "timezone_used": "Etc/UTC", "timezone_source": "default_utc" },
  "period": { "from": "...", "to": "...", "label": "1y" },
  "days": [],
  "total_sessions": 0,
  "active_days": 0
}
```

**400 — Invalid timezone query**

```json
{ "error": "Validation failed", "details": { "tz": ["Invalid IANA timezone"] } }
```

### Logging

Tag: `[clip2fit:stats]`

Logs: userId, period, totalSessions, activeDays, timezone_used, timezone_source.

### Client Use Case

Renders a GitHub-style contribution heatmap on the stats screen. Each cell represents a calendar day. Cell intensity is based on `count`. Cell color is derived from `categories` — single-category days use the category color; multi-category or `full_body` days use a neutral/mixed color. Empty days (not in the response) are rendered as grey.
