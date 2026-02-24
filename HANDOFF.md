# Handoff: Form Coach — Pose Detection Camera

## Goal

Add a real-time exercise form feedback screen. User taps "Form Coach" on home screen → exercise selection bottom sheet → camera opens full-screen → skeleton overlay (dots + connecting lines) drawn on top of live camera via Skia, driven by Reanimated SharedValue updated on the UI thread via `runOnUI`. Foundation for later LLM-powered form coaching.

Full spec: `plans/plan-form-coach-pose-camera.md`

## Current Progress

### Phase 0: Dependencies & Smoke Tests — DONE

- Installed `@shopify/react-native-skia`, `expo-camera`, `expo-screen-orientation`
- Camera permissions added to `app.json` (iOS `NSCameraUsageDescription` + Android `CAMERA`)
- Skia + Reanimated v4 smoke test passed (SharedValues read by Skia Canvas on UI thread at 60 FPS, zero React re-renders)

### Phase 1: Entry Point & Navigation — DONE

- "Form Coach" 3rd tile added to `components/home/bottom-action-buttons.tsx` (ScanLine icon, lime #84cc16)
- `form-coach` screen registered in `app/(protected)/_layout.tsx` as `fullScreenModal`, `slide_from_bottom`, `gestureEnabled: false`
- Placeholder `app/(protected)/form-coach.tsx` created with close button, exercise label

### Phase 2: Exercise Selection Sheet — DONE

- `components/form-coach/exercise-sheet.tsx` — BottomSheetModal with deduplicated exercise names from user workouts. Supports two modes: navigation (from home) and in-place selection (from camera via `onSelect` prop)
- Wired into home screen via ref, skips sheet if no workouts
- Exercise label at bottom of camera screen is tappable → reopens sheet

### Phase 3: Local Expo Module Scaffold — DONE

- `modules/expo-pose-camera/` created manually (not via `create-expo-module` — interactive prompt doesn't work in CI)
- TypeScript types: `PoseLandmark`, `PoseDetectedEvent`, `ExposePoseCameraViewProps`
- `requireNativeView('ExposePoseCamera')` wrapper
- `expo-module.config.json` with iOS + Android module definitions
- `package.json` added (required for proper module resolution)
- `expo-pose-camera.podspec` with `source_files = 'ios/*.{h,m,mm,swift}', 'ios/**/*.{h,m,mm,swift}'`

### Phase 4: iOS Native (Swift) — DONE

- `ios/ExposePoseCameraModule.swift` — Module definition with View, Events("onPoseDetected"), Prop("isActive")
- `ios/PoseCameraView.swift` — ExpoView subclass:
  - AVCaptureSession + AVCaptureVideoPreviewLayer (back camera, portrait)
  - AVCaptureVideoDataOutputSampleBufferDelegate on dedicated serial queue
  - VNDetectHumanBodyPoseRequest per frame
  - Multi-person: picks highest confidence sum
  - Normalizes coordinates (flips Y for Vision's bottom-left origin)
  - Filters confidence ≤ 0.3, throttles to ~20 FPS
  - Fires `onPoseDetected` event with landmarks array
  - `isActive` prop controls session start/stop

### Phase 5: Skeleton Overlay — DONE

- `constants/pose-skeleton.ts` — 19 joint names, 15 bone connections, drawing constants
- `components/form-coach/skeleton-overlay.tsx` — Skia Canvas reading `SharedValue<PoseLandmark[]>` on UI thread via `useDerivedValue`. Extracted `Bone` and `JointDot` sub-components to avoid hooks-in-loops lint errors. Draws lime lines (strokeWidth 3) and circles (radius 6)

### Phase 6: Form Coach Screen Polish — DONE

- `components/form-coach/permission-denied-view.tsx` — Camera denied fallback with "Open Settings" button
- `app/(protected)/form-coach.tsx` — Full screen with:
  - `useCameraPermissions()` from expo-camera for permission gate
  - `ExposePoseCameraView` (absoluteFill) with `isActive={isFocused}`
  - `SkeletonOverlay` (absoluteFill, pointerEvents=none)
  - `runOnUI` event bridge from `onPoseDetected` → SharedValue
  - Close button (top-right), exercise label (bottom-center)
  - Portrait lock via `expo-screen-orientation`

### Phase 7: Android Native (Kotlin) — DONE (code written, not tested)

- `android/build.gradle` — CameraX 1.4.1 + ML Kit pose-detection-accurate 18.0.0-beta5
- `android/src/main/java/expo/modules/posecamera/ExposePoseCameraModule.kt`
- `android/src/main/java/expo/modules/posecamera/PoseCameraView.kt` — CameraX + ML Kit, same event format as iOS

### Build Status — iOS BUILD SUCCEEDS, NEEDS RUNTIME VERIFICATION

- `npx expo run:ios` completed successfully (0 errors, 1165 warnings — mostly Skia linker warnings)
- Swift files confirmed compiled (`.swiftdeps` present in DerivedData)
- App installed on iPhone 17 Pro Max simulator

### Runtime Blocker Found and Fixed (Native View Registration)

- Symptom at runtime:
  - `Unimplemented component: <ViewManagerAdapter_ExposePoseCamera>`
- Root cause:
  - Local module autolinking metadata for Apple platform was incomplete, so `ExpoModulesProvider.swift` did not register `ExposePoseCameraModule`.
- Fix:
  - Updated `modules/expo-pose-camera/expo-module.config.json` to:
    - use `platforms: ["apple", "android"]`
    - define `apple.modules`
    - define `apple.podspecPath`
    - define `apple.swiftModuleName`
  - Re-ran `pod install` so `expo-pose-camera` is included in generated module provider and package list.

## What Worked

- **Custom Expo Module over VisionCamera** — Avoids worklets-core conflict with Reanimated v4
- **`runOnUI` event bridge** — Public API only, no Reanimated internal C++ headers
- **Skia reads SharedValues directly** — Proven in smoke test, circle animated at 60 FPS
- **Sub-components for Skia elements** — Extracted `Bone` and `JointDot` to fix hooks-in-loops ESLint errors
- **`useCameraPermissions()` from expo-camera** — Cleaner than manual permission checking

## What Didn't Work / Watch Out For

- **`npx create-expo-module --local` interactive prompt** — Fails in non-TTY environments. Had to scaffold manually
- **Missing podspec** — Local Expo modules MUST have a `.podspec` file for CocoaPods to compile Swift files. Without it, autolinking detects the module but CocoaPods only compiles the dummy .m stub
- **Podspec `source_files` glob** — `'ios/**/*.{h,m,mm,swift}'` alone did NOT match files in `ios/` directory on this CocoaPods version. Fixed by using BOTH patterns: `'ios/*.{h,m,mm,swift}', 'ios/**/*.{h,m,mm,swift}'`
- **`videoRotationAngle`** — iOS 17+ only. Project targets iOS 15.1. Fixed with `if #available(iOS 17.0, *)` fallback to `videoOrientation = .portrait`
- **`prebuild` ≠ `run:ios`** — `prebuild` only generates native project files. `run:ios` actually compiles Swift and installs the binary. User must run `npx expo run:ios` after any native code change
- **Missing `package.json` in module** — Added for proper module resolution

## Key Files Reference

| File | Purpose |
|------|---------|
| `plans/plan-form-coach-pose-camera.md` | Full implementation spec |
| `app/(protected)/form-coach.tsx` | Main camera screen |
| `components/form-coach/exercise-sheet.tsx` | Exercise selection bottom sheet |
| `components/form-coach/skeleton-overlay.tsx` | Skia canvas skeleton (Bone/JointDot sub-components) |
| `components/form-coach/permission-denied-view.tsx` | Camera denied fallback |
| `components/home/bottom-action-buttons.tsx` | Home screen tiles (3rd = Form Coach) |
| `constants/pose-skeleton.ts` | Joint names, connections, drawing constants |
| `modules/expo-pose-camera/` | Local Expo module (entire directory) |
| `modules/expo-pose-camera/ios/PoseCameraView.swift` | iOS camera + Vision pose detection |
| `modules/expo-pose-camera/ios/ExposePoseCameraModule.swift` | iOS module definition |
| `modules/expo-pose-camera/android/.../PoseCameraView.kt` | Android CameraX + ML Kit |
| `modules/expo-pose-camera/android/.../ExposePoseCameraModule.kt` | Android module definition |
| `modules/expo-pose-camera/expo-pose-camera.podspec` | CocoaPods spec (critical for iOS) |

## Next Steps

1. **Runtime verification on iOS** — Open app on simulator/device, tap Form Coach → select exercise → verify camera opens and skeleton draws on a person. The build succeeds but runtime behavior hasn't been verified yet.
2. **Test on physical iOS device** — Simulator has no real camera. Need a device build via `npx expo run:ios --device` to verify actual pose detection with Apple Vision.
3. **Android testing** — Run `npx expo run:android`, verify CameraX + ML Kit pose detection works. The Kotlin code is written but completely untested.
4. **Verify skeleton tracking quality** — Check that skeleton tracks at ≥15 FPS, joints/bones appear at correct positions, multi-person picks correct body, empty frame clears skeleton instantly.
5. **Edge cases** — Test: deny camera permission → PermissionDeniedView with "Open Settings"; exercise label tap → sheet reopens over live camera; close button → returns to home; camera stops when screen unfocused.
6. **Performance profiling** — Verify via React DevTools Profiler that FormCoachScreen has zero re-renders during skeleton drawing (only SharedValue mutations on UI thread).
