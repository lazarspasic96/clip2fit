# Spec: Workout Session Persistence

## Context

Workout progress lives in-memory via `ActiveWorkoutContext`. Tapping "Done" discards all data. This spec adds full persistence to Supabase PostgreSQL, enabling: "Previous" column for progressive overload, session history, volume tracking, and PR detection.

---

## Decisions Log

| Decision | Choice |
|---|---|
| Previous column source | Last session only (no walk-back if exercise was skipped) |
| Partial sessions as Previous | Yes — whatever was logged last shows as Previous |
| Save reliability | Fire-and-forget for MVP |
| Duration tracking | Wall clock (startedAt → completedAt) |
| Same-day duplicates | One per day max; check on workout start; warn user |
| Dup check data source | `completed_today` flag on GET /sessions/last; client sends timezone |
| Finish overlay enhancements | Duration + exercises + total volume (weighted only) + PR list |
| PR definition | Heavier weight on any set vs all previous sessions of same workout |
| PR scope | Per-workout only; TODO: canonical exercise IDs for cross-workout PRs |
| PR computation | Server computes; POST /api/sessions returns PRs in response |
| PR display | List below existing stats on finish overlay |
| PR timing | Show overlay immediately with stats; spinner in PR area until POST returns |
| Empty previous column | Show dash (—) |
| Auth scope for sessions | Require active library link (JOIN userWorkouts) |
| Stats computation | Client computes volume/duration from in-memory session data |
| Volume formula | Weighted exercises only; bodyweight exercises contribute 0 |
| Discard mid-workout | 2-button sheet: "Save & Exit" (partial save) / "Discard" (no save) |
| Partial session status | Stored as `status: "partial"` in DB |

---

## Phase 1: Database Schema + Migration

### 3 new tables in `clip2fit-api/src/lib/db/schema.ts`

**`workout_sessions`**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | defaultRandom |
| user_id | uuid FK→profiles | NOT NULL, cascade delete |
| workout_id | uuid FK→workouts | NOT NULL, cascade delete |
| status | text | "completed" \| "partial" |
| started_at | timestamptz | NOT NULL |
| completed_at | timestamptz | nullable (null for partial) |
| duration_seconds | integer | computed server-side |
| created_at | timestamptz | defaultNow |

Index: `(user_id, workout_id, completed_at DESC)` — for "last session" query

**`session_exercise_logs`**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | defaultRandom |
| session_id | uuid FK→workout_sessions | NOT NULL, cascade delete |
| exercise_id | uuid FK→exercises | NOT NULL, cascade delete |
| status | text | "completed" \| "skipped" \| "pending" |
| order | integer | preserves exercise order at session time |

**`session_set_logs`**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | defaultRandom |
| exercise_log_id | uuid FK→session_exercise_logs | NOT NULL, cascade delete |
| set_number | smallint | 1-indexed position |
| target_reps | text | snapshot from workout template |
| target_weight | real | snapshot from workout template |
| actual_reps | integer | user input, null if not completed |
| actual_weight | real | user input, null if not completed |
| status | text | "completed" \| "skipped" \| "pending" |

Drizzle relations for all 3 tables + update `profilesRelations`, `workoutsRelations`, `exercisesRelations`.

### Why 3 tables
- "Previous" column = simple indexed query on normalized tables
- Skipped exercises (zero completed sets) need explicit record
- Future volume/trend analytics trivial with normalized data

### Why exercise_id FK works
- Fork-on-edit creates new workout ID + new exercise IDs → `GET /sessions/last?workoutId=newId` returns nothing → "Previous" empty for edited workouts (correct)
- TODO: canonical exercise ID system for cross-workout PR detection

---

## Phase 2: API Endpoints

### 2A. `POST /api/sessions` — save session (completed or partial)

**File**: `clip2fit-api/src/app/api/sessions/route.ts` (new)

**Validation** (add to `src/lib/validations.ts`):
```
createSessionSchema:
  workout_id: uuid
  status: "completed" | "partial"
  started_at: ISO 8601 datetime
  completed_at: ISO 8601 datetime | null
  exercises: array of:
    exercise_id: uuid
    status: "completed" | "skipped" | "pending"
    order: integer
    sets: array of:
      set_number: positive integer
      target_reps: string | null
      target_weight: number | null
      actual_reps: integer | null
      actual_weight: number | null
      status: "completed" | "skipped" | "pending"
```

**Logic**:
1. `getAuthUser(request)` → 401 if invalid
2. Verify user owns workout via `userWorkouts` JOIN
3. Zod validate body
4. Compute `durationSeconds` from timestamps (if `completed_at` not null)
5. Transaction: insert session → exercise logs → set logs
6. **PR detection** (per-workout scope):
   - For each exercise with at least one completed set, find the max `actual_weight` in this session
   - Query `session_set_logs` for all previous sessions of this workout where that exercise was completed
   - Find the all-time max weight per exercise
   - If this session's max > all-time max → it's a PR
7. Return `201 { id, prs }` where prs is:
```json
{
  "prs": [
    {
      "exercise_name": "Bench Press",
      "exercise_id": "uuid",
      "new_weight": 65,
      "previous_weight": 60
    }
  ]
}
```

**Pattern**: follow `PUT /api/schedules` (auth + Zod + transaction)

### 2B. `GET /api/sessions/last` — last session + today check

**File**: `clip2fit-api/src/app/api/sessions/last/route.ts` (new)

**Query params**: `workoutId` (required), `timezone` (required, e.g., "America/Los_Angeles")

**Logic**:
1. Auth check
2. Read params
3. Query `workout_sessions` WHERE:
   - `userId = user.id`
   - `workoutId = param`
   - workout exists in user's library (JOIN `userWorkouts`)
   - ORDER BY `completed_at DESC NULLS LAST, created_at DESC` LIMIT 1
4. Include nested `exerciseLogs` → `setLogs` (only completed/skipped, not pending)
5. Compute `completed_today`: check if any session for this workout+user has `created_at` within "today" in the provided timezone
6. Return response or `null` body if no previous session

**Response**:
```json
{
  "id": "uuid",
  "workout_id": "uuid",
  "status": "completed",
  "started_at": "ISO",
  "completed_at": "ISO",
  "duration_seconds": 1800,
  "completed_today": false,
  "exercises": [{
    "exercise_id": "uuid",
    "status": "completed",
    "order": 1,
    "sets": [{
      "set_number": 1,
      "actual_reps": 10,
      "actual_weight": 65,
      "status": "completed"
    }]
  }]
}
```

---

## Phase 3: Mobile Integration

### 3A. Types — `types/api.ts`

New interfaces:
- `ApiSessionSetLog` — set_number, actual_reps, actual_weight, status
- `ApiSessionExerciseLog` — exercise_id, status, order, sets[]
- `ApiLastSession` — full last session response including `completed_today`
- `CreateSessionPayload` — matches POST body schema
- `ApiSessionPr` — exercise_name, exercise_id, new_weight, previous_weight
- `ApiSaveSessionResponse` — { id, prs }

New mapper:
- `mapSessionToPayload(session: WorkoutSession): CreateSessionPayload` — transforms in-memory session to API payload; includes ALL exercises (completed, skipped, AND pending for partial saves)

Modify existing:
- `buildSets()` — accept optional `previousSets: Map<number, {reps, weight}>` param
- `mapExercise()` — accept and pass through previous data
- `mapApiWorkout()` — accept optional `ApiLastSession`, build exercise→sets previous lookup from it

### 3B. Query keys — `constants/query-keys.ts`

Add: `sessions: { last: (workoutId: string) => ['sessions', 'last', workoutId] }`

### 3C. Hooks — `hooks/use-api.ts`

**`useSaveSessionMutation()`**
- POST /api/sessions
- Returns `ApiSaveSessionResponse` (with PRs)
- onSuccess: invalidate `queryKeys.sessions.last(workoutId)`

**`useLastSessionQuery(workoutId)`**
- GET /api/sessions/last?workoutId=X&timezone=Y
- Client gets timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone`
- enabled when workoutId non-null
- Returns `{ lastSession, completedToday, isLoading }`

### 3D. Wire "Previous" data — `components/workout/active-workout-content.tsx`

On workout start:
1. `useWorkoutQuery(id)` returns `rawWorkout`
2. `useLastSessionQuery(id)` returns `lastSession`, `completedToday`
3. If `completedToday === true` → show alert: "You already completed this workout today. Start again?"
   - User confirms → proceed
   - User cancels → navigate back
4. When both loaded: `mapApiWorkout(rawWorkout, lastSession)` → enriched `WorkoutPlan` with `previousReps`/`previousWeight` populated
5. `startWorkout(enrichedPlan)`

### 3E. Wire save (completed) — `components/workout/active-workout-content.tsx`

When `isWorkoutComplete` becomes true + user sees finish overlay:
1. `finishWorkout()` sets session status to "completed"
2. Immediately call `saveSession.mutateAsync(mapSessionToPayload(session))`
3. Overlay shows instantly with duration + volume + exercises (client-computed)
4. PR area shows spinner
5. When POST returns → display PRs list (or "No new PRs" if empty)
6. User taps "Done" → navigate back

### 3F. Wire save (partial/discard) — `components/workout/active-workout-content.tsx`

Discard confirmation sheet changes:
- **Current**: Title "End workout?" / "Progress won't be saved." / Cancel + End buttons
- **New**: Title "End workout?" / Description "You've completed X/Y exercises." / 2 buttons:
  - "Save & Exit" → call `saveSession.mutate()` with `status: "partial"`, then navigate back
  - "Discard" → navigate back without saving

### 3G. Finish overlay enhancements — `components/workout/finish-workout-overlay.tsx`

Current stats: duration (minutes) + exercises completed (X/Y)

Add:
- **Total volume**: sum of (actualReps × actualWeight) for all completed sets where actualWeight > 0
  - Display: "5,400 kg" (or "—" if all bodyweight)
  - Client-computed from session data
- **PR list**: below stats section
  - Loading state: small spinner + "Checking for PRs..."
  - Results: list of PRs: "Bench Press: 65 kg (was 60 kg)" per line
  - No PRs: "No new PRs" in secondary text
  - Data comes from `useSaveSessionMutation` response

Layout:
```
Workout Complete

[duration]  [exercises]  [volume]
 minutes     exercises      kg

─── New PRs ───
Bench Press: 65 kg (was 60 kg)
Squat: 100 kg (was 95 kg)

[Done]
```

---

## Edge Cases

| Case | Behavior |
|---|---|
| User skips ALL exercises | Still save (completed). All exercise logs = skipped. Volume = 0. No PRs. |
| Workout edited (fork-on-edit) | New workout ID → no previous session → Previous column empty. Correct. |
| Set count changes between sessions | `buildSets` maps by setNumber. Extra sets show no previous. |
| Save fails (network) | Fire-and-forget. Session lost. Overlay still shows client-computed stats. PR section shows error text. |
| Delete workout | CASCADE deletes all sessions. Correct for personal copies. |
| Same-day duplicate | Warn on start. If user proceeds, both sessions saved. Most recent = Previous. |
| Partial save → next session Previous | Partial session counts as Previous. Completed exercises show data; pending exercises show nothing. |
| First-ever workout | No last session → Previous column shows dashes. No "completed today" warning. |
| Bodyweight exercise PR | No weight tracked → no PR detection for bodyweight exercises. |

---

## Files to Modify

**clip2fit-api (backend):**
1. `src/lib/db/schema.ts` — 3 new tables + relations + index
2. `src/lib/validations.ts` — `createSessionSchema` Zod schema
3. `src/app/api/sessions/route.ts` — new: POST handler with PR detection
4. `src/app/api/sessions/last/route.ts` — new: GET handler with `completed_today` flag

**clip2fit (mobile):**
5. `types/api.ts` — session types, `mapSessionToPayload`, modify `buildSets`/`mapApiWorkout`
6. `constants/query-keys.ts` — add `sessions.last`
7. `hooks/use-api.ts` — `useSaveSessionMutation` + `useLastSessionQuery`
8. `components/workout/active-workout-content.tsx` — wire save (completed + partial), Previous data, same-day check
9. `components/workout/finish-workout-overlay.tsx` — add volume stat, PR list with loading/results states
10. `components/ui/confirmation-sheet.tsx` — may need to support 2-action variant (Save & Exit / Discard)

---

## Verification

1. Complete a workout with reps/weight → tap Done → verify session in Supabase tables
2. Start same workout again → verify "Previous" column shows last session's reps/weight
3. Beat a previous weight → verify PR appears on finish overlay
4. Skip an exercise → verify recorded as "skipped" in DB
5. Mid-workout exit → "Save & Exit" → verify partial session saved with status "partial"
6. Start workout that was already done today → verify warning appears
7. Edit workout (fork-on-edit) → start → verify Previous is empty (new exercise IDs)
8. Complete workout with only bodyweight exercises → verify volume shows "—" and no PRs

---

## Future TODOs

- **Canonical exercise IDs**: shared exercise table for cross-workout PR detection
- **Retry queue**: MMKV-based retry for failed saves (gym WiFi)
- **Session history screen**: list all past sessions per workout
- **Volume trends**: charts showing volume progression over time
- **Cross-workout PRs**: once canonical exercise IDs exist
