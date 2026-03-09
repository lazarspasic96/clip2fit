# Backend Task: POST /api/jobs/[id]/cancel

## Goal

Add a cancel endpoint so the mobile app can stop in-flight Trigger.dev conversion jobs instead of just resetting client state while the job keeps running.

## Prerequisites

- DB migration: `ALTER TYPE conversion_job_status ADD VALUE 'cancelled'`

## Implementation

### File: `src/app/api/jobs/[id]/cancel/route.ts`

```
POST /api/jobs/:id/cancel
Auth: Bearer <supabase_jwt>
Body: {} (empty JSON)
```

### Logic

1. `getAuthUser()` -> extract `userId` from JWT
2. Validate `:id` is UUID format -> `400 { error: "Invalid job ID" }`
3. `SELECT * FROM conversion_jobs WHERE id = :id AND user_id = :userId` -> `404 { error: "Job not found" }` if missing
4. If `status` IN (`completed`, `failed`, `cancelled`) -> `200 { status: job.status }` (idempotent no-op)
5. If `job.triggerRunId` is not null -> `runs.cancel(job.triggerRunId)` via Trigger.dev SDK
   - If SDK throws: log warning, **do not abort** — continue to step 6
6. `UPDATE conversion_jobs SET status = 'cancelled', progress = 0 WHERE id = :id`
7. Return `200 { status: 'cancelled' }`

### Responses

| Status | Body | When |
|--------|------|------|
| 200 | `{ "status": "cancelled" }` | Job successfully cancelled |
| 200 | `{ "status": "completed" }` | Job already completed (no-op) |
| 200 | `{ "status": "failed" }` | Job already failed (no-op) |
| 400 | `{ "error": "Invalid job ID" }` | `:id` is not a valid UUID |
| 401 | `{ "error": "Unauthorized" }` | Missing/invalid Bearer token |
| 404 | `{ "error": "Job not found" }` | Job doesn't exist or belongs to another user |
| 500 | `{ "error": "Internal server error" }` | Unhandled exception |

### Logging

Tag: `[clip2fit:jobs]`

Log: cancel request (jobId, previous status), Trigger.dev cancel result or error, not-found events.

## Notes

- **Ownership filter is critical** — always include `user_id = :userId` in the SELECT to prevent users from cancelling other users' jobs.
- **Idempotent** — calling cancel on a terminal job returns 200 with current status. No error, no side effects.
- **Trigger.dev failure is non-blocking** — if `runs.cancel()` throws, log it and still update the DB. The mobile client has already reset its UI.
- **No cleanup needed** — orphaned audio files from partially-completed jobs can be garbage collected later. Out of scope for this task.

## Mobile Side (already done)

The mobile app (`contexts/conversion-context.tsx`) already:
- Captures `jobId` before resetting state
- Fires `POST /api/jobs/:id/cancel` as fire-and-forget via `useCancelJobMutation`
- Handles `'cancelled'` status in the polling loop (resets to idle)
- Skips the API call when cancelling a cloned/simulated flow (no real jobId)

## Verification

1. Start conversion -> wait for `downloading` -> cancel -> job row shows `status: 'cancelled'`
2. Cancel a completed job -> returns `200 { status: 'completed' }`, no DB change
3. Cancel with invalid UUID -> returns `400`
4. Cancel another user's job -> returns `404`
5. Trigger.dev SDK throws on cancel -> job still marked `cancelled` in DB, error logged
