# Plan: New Workout Entrance Animation + Remove Start Button

## Context
After converting a video URL to a workout and saving it, the user navigates to the Library tab. Currently this transition works but lacks polish — no visual indication of which workout is new. We need a smooth entrance animation + brief highlight so the user sees their new workout appear. Also remove the "Start Workout" button from the workout detail screen entirely.

API implementation is compatible — `useUpdateWorkoutMutation` already invalidates `queryKeys.workouts.all`, and `GET /api/workouts` returns workouts sorted by `addedAt DESC` (new workout at index 0).

---

## Phase 1: Pass new workout ID to library

**File**: `components/processing/process-url-content.tsx`

- Change `handleSaved` (line 197) to pass `workoutId` as URL param:
  ```
  router.replace(`/(protected)/(tabs)/my-workouts?newWorkoutId=${workoutId}`)
  ```
- No other changes needed — mutation cache invalidation already handles refetch

---

## Phase 2: Animate new workout in library

**File**: `app/(protected)/(tabs)/my-workouts.tsx`

### 2a. Read param + auto-cleanup
- `useLocalSearchParams<{ newWorkoutId?: string }>()` to read the new workout ID
- Store in a ref so it survives re-renders but doesn't cause them
- `useEffect` clears param via `router.replace('/(protected)/(tabs)/my-workouts')` after ~4s

### 2b. Conditional entering animation
- New workout (matching ID): `FadeInUp.duration(600).springify()` — longer, more dramatic
- Other items: `undefined` — they're already mounted, won't re-animate
- `LinearTransition.springify()` already handles smooth layout shift as existing cards move down

### 2c. NewWorkoutHighlight wrapper component
- Inline component using `useSharedValue` + `useAnimatedStyle`
- Animated border that pulses brand accent color 3 times then fades out
- `withSequence(withTiming...)` — runs entirely on UI thread (60fps)
- Wraps only the new workout card (no perf impact on other items)

**Animation timeline:**
```
0ms    -> border opacity 1.0
500ms  -> fade to 0.3
1000ms -> back to 1.0
1500ms -> fade to 0.3
2000ms -> back to 1.0
2500ms -> fade to 0.3
3500ms -> fade to 0 (done)
```

---

## Phase 3: WorkoutCard border-radius fix

**File**: `components/my-workouts/workout-card.tsx`

- Wrap card content in a View with `borderRadius: 16` + `overflow: 'hidden'`
- Ensures highlight border matches card shape cleanly
- Replace `bg-background-secondary` className with explicit style (so highlight overlay aligns)

---

## Phase 4: Remove "Start Workout" button from workout detail

**File**: `components/workout-detail/workout-detail-content.tsx`

- Remove the sticky footer entirely (lines 187-190):
  ```tsx
  {/* Remove this block */}
  <View className="px-6 pt-4 border-t border-border-primary" style={{ paddingBottom: ... }}>
    <Button onPress={handleStartWorkout}>Start Workout</Button>
  </View>
  ```
- Remove the `handleStartWorkout` function (lines 83-85) — now dead code
- Remove `Button` import if no longer used elsewhere in the file
- Adjust ScrollView bottom padding since sticky footer is gone — add `paddingBottom: Math.max(insets.bottom, 16)` to `contentContainerStyle`

---

## Files to modify

| File | Change |
|------|--------|
| `components/processing/process-url-content.tsx` | Pass `newWorkoutId` param in `handleSaved` |
| `app/(protected)/(tabs)/my-workouts.tsx` | Read param, conditional animation, `NewWorkoutHighlight` component, auto-cleanup |
| `components/my-workouts/workout-card.tsx` | Add borderRadius wrapper for clean highlight |
| `components/workout-detail/workout-detail-content.tsx` | Remove sticky "Start Workout" footer + dead code |

## Verification
1. Convert a video URL -> save from proposal -> lands on library
2. New workout fades in at top with spring animation
3. Accent border pulses 3x then fades
4. Existing workouts shift down smoothly (LinearTransition)
5. After ~4s, revisiting tab shows no highlight
6. Swipe-to-delete still works on highlighted card
7. Pull-to-refresh works normally
8. Workout detail screen no longer shows "Start Workout" footer
9. ScrollView in workout detail has proper bottom padding
