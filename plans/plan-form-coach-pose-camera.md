# Form Coach Screen — Implementation Plan

## Context
Add a real-time exercise form feedback screen to Clip2Fit. User taps "Form Coach" on the home screen → exercise selection bottom sheet → camera opens full-screen → skeleton overlay (dots + connecting lines) is drawn on top of the live camera view via Skia, driven by a Reanimated SharedValue updated on the UI thread via `runOnUI` (no React re-renders, no Reanimated internal C++ headers). This is the foundation for later LLM-powered form coaching.

---

## Critical: Why NOT VisionCamera + TFLite (Option A)

The project uses `react-native-reanimated` v4 + `react-native-worklets` 0.7.2. VisionCamera's frame processors require `react-native-worklets-core` (Margelo). These two worklet packages are **fundamentally incompatible in the same project**:
- Their babel plugins both transform the `'worklet'` directive — mutually exclusive
- Android: `com.swmansion.worklets.WorkletsPackage` vs `com.worklets.WorkletsPackage` — compile-time namespace collision
- Issue [#3563](https://github.com/mrousavy/react-native-vision-camera/issues/3563) — opened July 2025, still unresolved as of December 2025

**Solution: Custom local Expo Module** wrapping platform-native pose detection:
- iOS: `AVCaptureSession` + `VNDetectHumanBodyPoseRequest` (Apple Vision, built into iOS 14+, zero deps)
- Android: CameraX + Google ML Kit Pose Detection

No VisionCamera → no worklets conflict → fully compatible with Reanimated 4 + Expo SDK 55 + RN 0.83.

---

## Architecture

### Data Flow (`runOnUI` Event Bridge — No React Re-renders)

```
Native (background thread, every frame ~20 FPS)
  → VNDetectHumanBodyPoseRequest / ML Kit
  → normalize x,y to [0..1] (flip Y on iOS)
  → pick highest-confidence body if multiple detected
  → filter out landmarks with confidence ≤ 0.3
  → Expo event: onPoseDetected({ landmarks: PoseLandmark[] })
                    ↓
             JS event handler (~microseconds on JS thread)
             runOnUI(() => { sharedValue.value = landmarks })()
                    ↓
             Reanimated worklet runtime (UI thread)
             SharedValue<PoseLandmark[]> updated
                    ↓
             Skia Canvas reads SharedValue on UI thread
             redraws skeleton
```

**No `setState`. No React re-renders. No Reanimated internal C++ headers.**

The JS thread is touched only for the one-time `runOnUI()` dispatch per frame — negligible (~microseconds). The SharedValue mutation and all Skia drawing happen entirely on the UI thread.

### Why `runOnUI` over true JSI (writing SharedValue from native C++)

True JSI would require `NativeReanimatedModule.h` (private, undocumented, breaks on Reanimated upgrades). The `runOnUI` bridge delivers identical perceptible performance — Skia still draws on the UI thread at full frame rate — while using only stable, public APIs. `react-native-nitro-modules` is available in the project for future LLM coaching features that need a richer JSI API surface.

### Screen Structure

```
FormCoachScreen (app/(protected)/form-coach.tsx)
├── PoseCameraView (native ExpoView, StyleSheet.absoluteFill)
│   ├── iOS: AVCaptureVideoPreviewLayer (live camera, full screen)
│   └── Android: CameraX PreviewView (live camera, full screen)
│
├── SkeletonOverlay (Canvas from @shopify/react-native-skia, absoluteFill)
│   ├── Reads SharedValue<PoseLandmark[]> on UI thread
│   ├── Lines between connected joint pairs (lime green #84cc16, strokeWidth 3)
│   └── Circles at each landmark position (lime fill, radius 6)
│
└── UI Controls (absoluteFill, transparent overlay)
    ├── Close button (top-right, safe area, X icon → router.back())
    └── Exercise label (bottom-center, tappable → reopens ExerciseSheet over live camera)
        └── Hidden if no exercise selected (new user / no workouts)
```

### Exercise Selection Flow (Before Camera Opens)

```
Home screen → tap "Form Coach" tile
  → ExerciseSheet bottom sheet opens (over home screen)
  → Fetches flat deduplicated list of exercise names from user's saved workouts
  → If no workouts saved: sheet is skipped, camera opens with no label
  → User taps exercise → sheet closes → camera modal navigates with ?exercise=<name>
  → Exercise label at bottom of camera is tappable → reopens ExerciseSheet over live camera
  → After camera closes (router.back()): state resets naturally on next open
```

---

## Multi-Person Handling

When multiple bodies are detected in frame, **pick the one with the highest sum of landmark confidence scores**. Draw only one skeleton. If confidence scores are equal, pick the largest bounding box.

---

## No-Person State

When native emits an empty landmarks array (no body detected), Skia immediately renders nothing (no fade, instant clear).

---

## Camera Permissions

- **Portrait locked** — no landscape support (consistent coordinate math, consistent UI)
- **Back camera only** — no flip toggle
- **Permission not yet requested**: system prompt shown on first open
- **Permission permanently denied**: show a dedicated full-screen error view (replaces camera view) with:
  - Message explaining camera is required
  - "Open Settings" button → `Linking.openSettings()`

---

## Exercise Selection Sheet — Detail

- **Trigger**: "Form Coach" tile tap on home screen
- **Content**: Flat deduplicated list of exercise names from user's saved workouts (fetched from Supabase)
- **Empty state** (no workouts): sheet is skipped entirely, camera opens with no label
- **After selection**: navigates to `/(protected)/form-coach?exercise=Squat` (URL param)
- **In-camera change**: tapping the exercise label at bottom reopens the sheet as a modal over the live camera; camera continues running behind it
- **Post-close**: `router.back()` → home screen; no state persistence (next open = fresh)

---

## Skeleton Visuals

- **Color**: Fixed lime `#84cc16` — no adaptive coloring
- **Bones** (lines between joints): `strokeWidth: 3`
- **Joints** (circles): `radius: 6`, same lime fill, no white stroke
- **Confidence threshold**: only draw joints/bones where confidence > 0.3

---

## Feedback

Zero on-screen coaching feedback text in this phase. All form assessment deferred to the LLM phase.

---

## Dependencies to Add

| Package | Purpose |
|---------|---------|
| `@shopify/react-native-skia` | Skeleton overlay drawing (Canvas, Line, Circle) |

Local module `modules/expo-pose-camera/` scaffolded via `npx create-expo-module --local` — no new npm packages for native code (Apple Vision + ML Kit use native build systems).

**Android only:** add to `modules/expo-pose-camera/android/build.gradle`:
```
implementation 'com.google.mlkit:pose-detection:18.0.0-beta5'
```

---

## Critical Files

| File | Action |
|------|--------|
| [components/home/bottom-action-buttons.tsx](components/home/bottom-action-buttons.tsx) | Add 3rd tile "Form Coach" button |
| [app/(protected)/_layout.tsx](app/(protected)/_layout.tsx) | Register `form-coach` as `fullScreenModal` |
| `app/(protected)/form-coach.tsx` | **New** — main camera screen |
| `modules/expo-pose-camera/` | **New** — local Expo module (entire directory) |
| `components/form-coach/skeleton-overlay.tsx` | **New** — Skia canvas skeleton (reads SharedValue) |
| `components/form-coach/exercise-sheet.tsx` | **New** — exercise selection bottom sheet |
| `components/form-coach/permission-denied-view.tsx` | **New** — settings deep-link fallback |
| [app.json](app.json) | Add camera permission text |

---

## Tasks (Implement strictly one at a time)

### Phase 0 — Dependencies & Smoke Tests
- **Task 0.1** — Install `@shopify/react-native-skia` via `npx expo install`
- **Task 0.2** — Add camera permission config to `app.json` (`NSCameraUsageDescription` + Android `CAMERA` permission)
- **Task 0.3** — Run `npx expo prebuild --clean` to regenerate native projects
- **Task 0.4** — **Skia + Reanimated v4 smoke test**: create a throwaway screen with a `useSharedValue<number>(0)` incremented by a `setInterval`, pass it to a Skia `<Canvas>` that reads it via `useDerivedValue` and draws a moving circle. Verify the circle animates at 60 FPS with zero React re-renders (confirm via React DevTools Profiler). **Gate — do not proceed to Phase 5 until this passes.** Delete the throwaway screen after verification.

### Phase 1 — Entry Point & Navigation
- **Task 1.1** — Add "Form Coach" 3rd tile to [bottom-action-buttons.tsx](components/home/bottom-action-buttons.tsx): `ScanLine` icon (lucide), lime color, tapping opens `ExerciseSheet` (not direct navigation)
- **Task 1.2** — Register `form-coach` screen in [app/(protected)/_layout.tsx](app/(protected)/_layout.tsx): `presentation: 'fullScreenModal'`, `animation: 'slide_from_bottom'`, `gestureEnabled: false`
- **Task 1.3** — Create `app/(protected)/form-coach.tsx`: placeholder `View` + back button, accept `?exercise` search param, verify navigation works

### Phase 2 — Exercise Selection Sheet
- **Task 2.1** — Create `components/form-coach/exercise-sheet.tsx`: bottom sheet component. Fetches unique exercise names from user's workouts via existing API hook. Shows flat deduplicated list. On tap: closes sheet and navigates to `/(protected)/form-coach?exercise=<name>`. If no workouts: skips sheet and navigates directly (no exercise param).
- **Task 2.2** — Wire `ExerciseSheet` into the "Form Coach" tile tap handler on home screen
- **Task 2.3** — In `form-coach.tsx`: read `?exercise` param, display tappable label at bottom. Tap → reopens `ExerciseSheet` as a sheet over the live camera (camera stays running)

### Phase 3 — Local Expo Module Scaffold
- **Task 3.1** — Run `npx create-expo-module --local expo-pose-camera` in project root
- **Task 3.2** — Define TypeScript types in `modules/expo-pose-camera/src/ExposePoseCamera.types.ts`:
  ```ts
  type PoseLandmark = { joint: string; x: number; y: number; confidence: number }
  type PoseDetectedEvent = { landmarks: PoseLandmark[] }
  ```
- **Task 3.3** — Write TypeScript wrapper `modules/expo-pose-camera/src/ExposePoseCameraView.tsx` using `requireNativeViewManager`. Declare `onPoseDetected` event prop.
- **Task 3.4** — Export public API from `modules/expo-pose-camera/src/index.ts`

### Phase 4 — iOS Native (Swift)
- **Task 4.1** — `PoseCameraView.swift`: `ExpoView` subclass, set up `AVCaptureSession` + `AVCaptureVideoPreviewLayer` filling view bounds. Back camera. Portrait only.
- **Task 4.2** — `PoseCameraView.swift`: implement `AVCaptureVideoDataOutputSampleBufferDelegate`, receive `CMSampleBuffer` per frame on a dedicated serial queue
- **Task 4.3** — `PoseCameraView.swift`: create `VNDetectHumanBodyPoseRequest`, run on each `CMSampleBuffer` via `VNImageRequestHandler`
- **Task 4.4** — `PoseCameraView.swift`: extract recognized points from `VNHumanBodyPoseObservation`. If multiple observations, pick highest sum of confidence. Normalize coordinates (flip Y: Vision uses bottom-left origin). Filter confidence ≤ 0.3. Throttle to ~20 FPS via frame counter.
- **Task 4.5** — `PoseCameraView.swift`: call `self.onPoseDetected(["landmarks": landmarkArray])` — fires the Expo event to JS. Empty array when no body detected.
- **Task 4.6** — `ExposePoseCameraModule.swift`: `Module` definition — register `View(PoseCameraView.self)` with `Events("onPoseDetected")` and `Prop("isActive")`
- **Task 4.7** — Camera permission gate in `form-coach.tsx`: check permission on mount. Not granted → show `PermissionDeniedView`. Granted → render `PoseCameraView`.
- **Task 4.8** — `isActive` lifecycle: pass `isActive={isFocused}` prop, implement `OnPropChange` for `isActive` in `PoseCameraView.swift` to `startRunning()` / `stopRunning()` the `AVCaptureSession`

### Phase 5 — Skeleton Overlay (Skia + SharedValue)
- **Task 5.1** — Create `constants/pose-skeleton.ts`: define `JOINT_NAMES` unified map (iOS 19 joints / Android 33 joints) + `SKELETON_CONNECTIONS` array of `[jointA, jointB]` pairs: shoulders, elbows, wrists, hips, knees, ankles, neck-to-shoulders, hips-to-root
- **Task 5.2** — Create `components/form-coach/skeleton-overlay.tsx`: receives `SharedValue<PoseLandmark[]>` as prop. `Canvas` with `StyleSheet.absoluteFill` + `pointerEvents="none"`. Uses `useDerivedValue` to derive canvas coordinates from SharedValue. Draws `Line` (lime, strokeWidth 3) for each connection and `Circle` (lime, radius 6) for each landmark — all inside Skia draw function reading SharedValue on UI thread. Only draws joints with confidence > 0.3. Empty array = renders nothing instantly.
- **Task 5.3** — In `form-coach.tsx`: wire the `runOnUI` event bridge:
  ```ts
  const landmarksSharedValue = useSharedValue<PoseLandmark[]>([])

  // In useEffect:
  const subscription = poseCameraRef.current?.addListener(
    'onPoseDetected',
    (event: PoseDetectedEvent) => {
      runOnUI(() => {
        'worklet'
        landmarksSharedValue.value = event.landmarks
      })()
    }
  )
  return () => subscription?.remove()
  ```
  Pass `landmarksSharedValue` to `<SkeletonOverlay />`.

### Phase 6 — Form Coach Screen Polish
- **Task 6.1** — `permission-denied-view.tsx`: full-screen component (dark bg) with camera icon, explanation text, "Open Settings" `Pressable` → `Linking.openSettings()`
- **Task 6.2** — Final layout: `View flex-1 bg-black` → `PoseCameraView absoluteFill` → `SkeletonOverlay absoluteFill pointerEvents=none` → UI controls overlay (safe-area-aware). Close button top-right. Exercise label bottom-center (tappable, hidden if no exercise).
- **Task 6.3** — Portrait orientation lock: add `expo-screen-orientation` lock on screen focus, unlock on blur

### Phase 7 — Android Native (Kotlin) ← after iOS verified
- **Task 7.1** — `PoseCameraView.kt`: `ExpoView` subclass, set up CameraX `ProcessCameraProvider` + `Preview`, bind to `PreviewView`
- **Task 7.2** — `PoseCameraView.kt`: add `ImageAnalysis` use case with `STRATEGY_KEEP_ONLY_LATEST` backpressure
- **Task 7.3** — `PoseCameraView.kt`: create ML Kit `PoseDetector` (AccuratePoseDetectorOptions, STREAM_MODE). If multiple poses detected, pick highest confidence sum.
- **Task 7.4** — `PoseCameraView.kt`: normalize `position.x / imageWidth`, `position.y / imageHeight`. Filter confidence ≤ 0.3. Throttle to ~20 FPS.
- **Task 7.5** — `PoseCameraView.kt`: call `this.sendEvent("onPoseDetected", landmarkMap)` — same Expo event as iOS, same JS-side `runOnUI` handler handles it
- **Task 7.6** — `ExposePoseCameraModule.kt`: `Module` definition — register view, declare `isActive` prop and `onPoseDetected` event

---

## Verification

1. `npx expo run:ios` — tap "Form Coach" on home screen → `ExerciseSheet` opens
2. Select an exercise → sheet closes → full-screen camera opens with exercise label
3. Point camera at a person → lime skeleton dots + lines appear at ≥15 FPS
4. Body moves → skeleton tracks smoothly (verify Skia redraws on UI thread, no JS re-renders via React DevTools Profiler)
5. Move out of frame → skeleton instantly disappears
6. Tap exercise label → sheet reopens over live camera, camera keeps running
7. Press X → returns to home screen, camera stops
8. Deny camera permission → `PermissionDeniedView` appears with working "Open Settings" link
9. `npx expo run:android` — same verification (Phase 7 complete)

---

## Landmark Coordinate Normalization (iOS vs Android)

**iOS (Apple Vision):** Origin is bottom-left. Must flip Y: `normalizedY = 1.0 - point.location.y`

**Android (ML Kit):** `position.x` and `position.y` are pixel coordinates in the original image. Divide by `imageWidth`/`imageHeight` to normalize.

**Canvas drawing:** `canvasX = landmark.x * canvasWidth`, `canvasY = landmark.y * canvasHeight`

---

## iOS Joint Name Mapping (VNHumanBodyPoseObservation.JointName)
19 joints: `.nose`, `.leftEye`, `.rightEye`, `.leftEar`, `.rightEar`, `.neck`, `.leftShoulder`, `.rightShoulder`, `.leftElbow`, `.rightElbow`, `.leftWrist`, `.rightWrist`, `.root`, `.leftHip`, `.rightHip`, `.leftKnee`, `.rightKnee`, `.leftAnkle`, `.rightAnkle`

## Android Joint Name Mapping (PoseLandmark)
Key constants: `NOSE(0)`, `LEFT_SHOULDER(11)`, `RIGHT_SHOULDER(12)`, `LEFT_ELBOW(13)`, `RIGHT_ELBOW(14)`, `LEFT_WRIST(15)`, `RIGHT_WRIST(16)`, `LEFT_HIP(23)`, `RIGHT_HIP(24)`, `LEFT_KNEE(25)`, `RIGHT_KNEE(26)`, `LEFT_ANKLE(27)`, `RIGHT_ANKLE(28)`

---

## Resolved Risks

| Risk | Resolution |
|------|-----------|
| Reanimated internal C++ headers (`NativeReanimatedModule.h`) | **Eliminated** — `runOnUI` event bridge uses only public Reanimated API. No native C++ bridging code. |
| Expo Modules SDK JSI value passing (SharedValue ref serialized to JSON) | **Eliminated** — `runOnUI` bridge passes no JSI values through Expo's prop/function system. Native fires a plain JSON event; JS does one `runOnUI()` call. |
| Skia + Reanimated v4 SharedValue reads in Canvas | **Mitigated** — Task 0.4 smoke test validates this integration before any native code is written. Fail-fast gate. |
