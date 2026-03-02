# Backend Fix: Custom workouts missing sets count

## Problem

Custom workouts created via `POST /api/workouts` return exercises with `sets: 0` (or missing) from `GET /api/workouts/:id`. The mobile client sends `sets: 3` correctly in `CreateWorkoutPayload`, but the value is lost somewhere between write and read.

Video-converted workouts work fine — their exercises have correct set counts.

## Impact

Users create a custom workout with e.g. 3 sets per exercise, assign it to a day, start the workout, and see **zero set rows** to log. A mobile-side fallback (defaulting to 1 set) is now in place, but the real fix must happen on the backend.

## Investigation Steps

1. **Check the DB schema** — does the exercises table have a `sets` (or `target_sets`) column? Is it nullable / defaulting to 0?

2. **Check `POST /api/workouts` handler** — when creating exercises from the payload, is the `sets` value from the request body being written to the DB column?

3. **Check `GET /api/workouts/:id` response mapper** — is the `sets` column being read from the DB and included in the `ApiExercise` response object?

4. **Compare with video-converted path** — the Trigger.dev `convert-workout-video` task likely writes `sets` correctly. Find what it does differently from the custom workout creation path.

## Expected Fix

- Ensure `POST /api/workouts` persists `exercises[].sets` from the request payload to the DB.
- Ensure `GET /api/workouts/:id` reads and returns `exercises[].sets` in the response.
- Add a `NOT NULL DEFAULT 1` constraint on the sets column if it doesn't already have one.

## Verification

1. `POST /api/workouts` with an exercise that has `sets: 3`
2. `GET /api/workouts/:id` — response exercise should have `sets: 3`
3. Existing video-converted workouts still return correct set counts (regression check)
