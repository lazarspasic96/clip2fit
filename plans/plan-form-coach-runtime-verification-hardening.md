# Form Coach Runtime Verification and Hardening Plan

## Objective

Stabilize the Form Coach camera flow after native-module registration issues, then harden iOS/Android runtime behavior and performance before adding coaching intelligence.

## Current Blocker Resolved

- Red screen:
  - `Unimplemented component: <ViewManagerAdapter_ExposePoseCamera>`
- Root cause:
  - Local module was discovered by search but not fully resolved for Apple autolinking metadata.
- Fix implemented:
  - Updated `modules/expo-pose-camera/expo-module.config.json` to use `apple` platform metadata with:
    - `modules`
    - `podspecPath`
    - `swiftModuleName`
  - Re-ran `pod install` to regenerate provider and package list.

## Phase 1: Runtime Re-Verification on iOS (Critical)

### Goal
Confirm the native view is registered and the camera screen no longer crashes when opening Form Coach from exercise selection.

### Steps
1. Build and launch iOS dev client after pod regeneration.
2. Open Home -> Form Coach -> select multiple exercises.
3. Confirm camera view mounts every time.
4. Confirm no red screen and no `Unimplemented component` message.
5. Confirm close button returns to Home and reopening still works.

### Hard Gate
- Must pass 10/10 repeated opens without red screen.

## Phase 2: Functional Runtime Checks (iOS)

### Goal
Validate behavior correctness now that view registration is fixed.

### Checks
1. Permission flow:
   - first open prompt
   - denied path shows settings CTA
2. Pose flow:
   - person enters frame -> skeleton appears
   - person leaves frame -> skeleton clears
3. Exercise sheet while camera active:
   - tapping exercise chip reopens sheet
   - selecting new exercise updates label without breaking camera
4. Focus lifecycle:
   - background app / navigate away / return
   - camera starts and stops cleanly via `isActive`

### Acceptance
- No crashes, no frozen preview, no stale skeleton after blur/focus transitions.

## Phase 3: Performance and Reliability Hardening

### Goal
Reduce runtime risk before broader rollout.

### Improvements
1. Validate frame-throttle behavior with measured event rate (target about 20 FPS).
2. Ensure camera processing does not run on main/UI thread.
3. Measure JS render behavior:
   - Form Coach React tree should not re-render per frame.
4. Add lightweight diagnostics:
   - optional dev-only pose event counter
   - optional dropped-frame counter in native layer

### Acceptance
- Stable tracking and smooth UI while interacting with overlays.

## Phase 4: Android Parity Validation

### Goal
Bring Android behavior in line with iOS and confirm module stability.

### Checks
1. Build and run Android dev client.
2. Validate camera open/close and permission flow.
3. Validate skeleton draws and updates smoothly.
4. Verify analyzer thread usage is background-safe.
5. Verify event payload parity with iOS schema.

### Acceptance
- End-to-end flow works on at least one physical Android device and one emulator profile.

## Phase 5: Technical Debt and Architecture Decisions

### Questions to Resolve Before LLM Coaching Layer
1. Keep OS-native pose stack (Vision + ML Kit) or migrate to unified cross-platform model?
2. Add deterministic joint mapping parity (including torso/center joints) across platforms?
3. Define confidence smoothing policy (instant vs temporal smoothing) for coaching accuracy.
4. Define backpressure policy under CPU stress (drop frames vs reduce detector cadence).

### Recommendation
- Keep current native stack for now.
- Add instrumentation and parity fixes first.
- Reevaluate model strategy after baseline runtime metrics are collected.

## Definition of Done (This Plan)

1. iOS runtime red-screen issue is eliminated and verified by repeated open cycles.
2. iOS functional checks pass.
3. Android runtime verified with parity checklist.
4. Performance baseline documented (event rate, render behavior, perceived smoothness).
