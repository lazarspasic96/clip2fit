# Handoff: Form Coach — Full Implementation

## Goal

Real-time exercise form coaching in-app. User selects exercise → camera opens → AI pose detection draws skeleton → form feedback (traffic lights, voice coaching, rep counting, barbell path tracking) → workout summary.

Full spec: `plans/plan-form-coach-full.md`

## Current Progress

### Phase 1: Camera + Skeleton — DONE (prior conversation)

- Custom Expo native module (`modules/expo-pose-camera/`) — iOS Vision + Android ML Kit
- Skeleton overlay via Skia + Reanimated SharedValues at ~20 FPS
- Entry point from home screen, exercise picker sheet, permission handling
- iOS build verified. Android code written.

### Phase 2: Screen States + Setup + Camera Flip — DONE

- **State machine** (`hooks/use-form-coach-state.ts`): setup → active → rest → summary
- **Body detection** (`hooks/use-body-detection.ts`): 1s debounce before "lost" warning
- **Rest detection** (`hooks/use-rest-detection.ts`): 5s no-movement → rest state
- **Setup overlay** (`components/form-coach/setup-overlay.tsx`): Joint checklist (✓/✗ per joint), 2s hold countdown with progress bar, auto-transitions to active
- **Camera flip** (`components/form-coach/camera-flip-button.tsx`): Front/back toggle with native X mirroring in both iOS (`ExpoPoseCameraView.swift` line ~185) and Android (`ExpoPoseCameraView.kt` line ~157)
- **Body-not-detected overlay**: Dark overlay + icon, shows in active/rest when landmarks empty
- **Orientation unlocked**: Supports landscape for bench/floor exercises

### Phase 3: Joint Angles + Squat Feedback + TTS — DONE

- **Angle calculation** (`utils/pose-angles.ts`): `calculateAngle()`, `calculateTrunkLean()`, `calculateKneeTracking()`
- **Camera angle detection** (`utils/camera-angle-detector.ts`): Side/front/45° based on shoulder width ratio
- **Squat rules** (`constants/form-rules/squat.ts`): Knee depth, hip angle, knee valgus (front-only)
- **Form rules registry** (`constants/form-rules/index.ts`): `hasFormRules(name)`, `getFormRules(name)` with alias support
- **Form evaluator** (`utils/form-evaluator.ts`): Runs angle rules + custom checks, sorts by severity
- **Feedback overlay** (`components/form-coach/form-feedback-overlay.tsx`): Green/yellow/red pills (primary + secondary)
- **TTS** (`hooks/use-tts-feedback.ts`): expo-speech on error severity, 3s throttle, MMKV-persisted mute (`form-coach` MMKV store)
- **Unreliable check note**: Shows when checks are skipped due to camera angle
- **Debug overlay**: `__DEV__` only — live angle numbers per rule

### Phase 4: Rep Counting + Set Summary + More Exercises — DONE

- **Rep counter** (`utils/rep-counter.ts`): State machine (resting→descending→bottom→ascending), 15-frame debounce
- **Session store** (`stores/form-session-store.ts`): Observer pattern (subscribe/getSnapshot), tracks sets/reps/per-rep quality
- **Rep counter display**: Circular badge top-center, pulse animation on increment
- **Set summary card**: Slides up on rest with set #, rep count, colored quality dots
- **Orchestrator hook** (`hooks/use-form-coach-orchestrator.ts`): Extracted all eval/rep/session logic to keep `form-coach.tsx` under 350 lines
- **New exercise rules**: Deadlift, bench press, overhead press, lunge — all in `constants/form-rules/`

### Phase 5: Advanced Detection + Barbell Path — DONE

- **Back rounding detector** (`utils/back-rounding-detector.ts`): 10-frame rolling window, >15° increase in 5 frames = rounding
- **Symmetry checker** (`utils/symmetry-checker.ts`): L/R angle delta >10° = warning (front/45° only)
- **Common checks** (`constants/form-rules/common-checks.ts`): `backRoundingCheck` + `symmetryCheck` added to squat + deadlift rules
- **Barbell tracker** (`utils/barbell-tracker.ts`): Wrist midpoint, 60-frame ring buffer, drift >0.05 = warning
- **Barbell path overlay** (`components/form-coach/barbell-path-overlay.tsx`): Cyan Skia gradient trail, red on drift
- **Body highlight overlay** (`components/form-coach/body-highlight-overlay.tsx`): Red translucent glow circles on issue joints

### Phase 6: LLM Coaching + Summary + Entry Points — DONE

- **Workout summary** (`components/form-coach/workout-summary-screen.tsx`): Full stats — sets/reps/form score%, most common issue, per-set colored dot breakdown
- **LLM coaching (mock)** (`utils/form-coaching-mock.ts`): Canned messages per issue type, 3s interval
- **Coaching hook** (`hooks/use-form-coaching.ts`): Aggregates 60-frame buffer → generates coaching message
- **Coaching bubble** (`components/form-coach/coaching-bubble.tsx`): Dark card with lime border, slide-in animation, also spoken via TTS
- **Entry point — exercise detail**: ScanLine icon in header (`app/(protected)/exercise-detail.tsx`) for exercises with form rules
- **Entry point — active workout**: "Form Check" link in exercise accordion (`components/workout/command-center/exercise-accordion.tsx`)

### Build Status

- `npx tsc --noEmit` — PASSES (0 errors)
- `npx expo lint` — PASSES (0 errors, 0 warnings)
- Not yet runtime-tested after Phases 2-6

## What Worked

- **Custom Expo Module** — Avoids worklets-core conflict with Reanimated v4
- **`runOnUI` event bridge** — Native → SharedValue → Skia, zero JS bridge per frame
- **Orchestrator pattern** — Extracting all eval logic into `use-form-coach-orchestrator.ts` kept the screen file clean (273 lines)
- **Observer store pattern** — `formSessionStore` follows existing `catalogFilterStore` pattern (subscribe/getSnapshot with `useSyncExternalStore`)
- **`createMMKV({ id: 'form-coach' })`** — This project uses `createMMKV` not `new MMKV()` (the import is `createMMKV` from `react-native-mmkv`)
- **Form rules registry with aliases** — Fuzzy matching via canonical name + common variations (e.g., "back squat", "barbell squat" all map to squat rules)
- **Mock-first LLM coaching** — Full UX works without backend, easy to swap `form-coaching-mock.ts` for real API later

## What Didn't Work / Watch Out For

- **`new MMKV()`** — Does not exist in this project's version. Use `createMMKV({ id: '...' })` instead.
- **Missing podspec** — Local Expo modules MUST have a `.podspec` for CocoaPods. Without it, autolinking detects module but Swift files don't compile.
- **`videoRotationAngle`** — iOS 17+ only. Project targets iOS 15.1. Uses `#available` fallback.
- **Shared back rounding detector state** — `common-checks.ts` uses module-level `createBackRoundingDetector()`. Must call `resetCommonChecks()` when switching exercises (not yet wired — minor TODO).
- **Form coach screen line limit** — Was approaching 350 lines after Phase 3. Extracted orchestrator hook to solve this.

## Key Files

| Category | File | Purpose |
|----------|------|---------|
| **Screen** | `app/(protected)/form-coach.tsx` | Main camera screen (273 lines) |
| **Orchestrator** | `hooks/use-form-coach-orchestrator.ts` | All eval/rep/barbell/coaching logic |
| **State machine** | `hooks/use-form-coach-state.ts` | setup → active → rest → summary |
| **Detection** | `hooks/use-body-detection.ts` | Body presence debounce |
| **Detection** | `hooks/use-rest-detection.ts` | Movement-based rest detection |
| **TTS** | `hooks/use-tts-feedback.ts` | expo-speech + MMKV mute |
| **Coaching** | `hooks/use-form-coaching.ts` | Mock LLM coaching (3s interval) |
| **Types** | `types/form-rules.ts` | All form coach types |
| **Types** | `types/form-coaching.ts` | LLM coaching request/response types |
| **Rules** | `constants/form-rules/index.ts` | Registry + `hasFormRules`/`getFormRules` |
| **Rules** | `constants/form-rules/squat.ts` | Squat angle rules + custom checks |
| **Rules** | `constants/form-rules/deadlift.ts` | Deadlift rules + back rounding |
| **Rules** | `constants/form-rules/bench-press.ts` | Bench press (upper body only) |
| **Rules** | `constants/form-rules/overhead-press.ts` | OHP lockout + back arch |
| **Rules** | `constants/form-rules/lunge.ts` | Lunge knee/torso rules |
| **Rules** | `constants/form-rules/common-checks.ts` | Shared back rounding + symmetry |
| **Rules** | `constants/form-rules/barbell-path.ts` | Per-exercise ideal path config |
| **Utils** | `utils/pose-angles.ts` | Pure math: angle, trunk lean, knee tracking |
| **Utils** | `utils/camera-angle-detector.ts` | Side/front/45° detection |
| **Utils** | `utils/form-evaluator.ts` | Runs rules → FormIssue[] |
| **Utils** | `utils/rep-counter.ts` | Angle peak state machine |
| **Utils** | `utils/back-rounding-detector.ts` | Rolling window spine angle |
| **Utils** | `utils/symmetry-checker.ts` | L/R comparison |
| **Utils** | `utils/barbell-tracker.ts` | Wrist midpoint + drift |
| **Utils** | `utils/form-data-aggregator.ts` | 60-frame buffer for coaching |
| **Utils** | `utils/form-coaching-mock.ts` | Canned coaching messages |
| **Store** | `stores/form-session-store.ts` | Sets/reps/quality tracking |
| **Components** | `components/form-coach/skeleton-overlay.tsx` | Skia skeleton (dimmed + red joints) |
| **Components** | `components/form-coach/setup-overlay.tsx` | Joint checklist + countdown |
| **Components** | `components/form-coach/form-feedback-overlay.tsx` | Green/yellow/red pills |
| **Components** | `components/form-coach/rep-counter-display.tsx` | Circular badge + pulse |
| **Components** | `components/form-coach/set-summary-card.tsx` | Slide-up card on rest |
| **Components** | `components/form-coach/barbell-path-overlay.tsx` | Cyan/red Skia trail |
| **Components** | `components/form-coach/body-highlight-overlay.tsx` | Red glow on issue joints |
| **Components** | `components/form-coach/coaching-bubble.tsx` | LLM message card |
| **Components** | `components/form-coach/workout-summary-screen.tsx` | Full session stats |
| **Native** | `modules/expo-pose-camera/ios/ExpoPoseCameraView.swift` | iOS Vision + front camera mirroring |
| **Native** | `modules/expo-pose-camera/android/.../ExpoPoseCameraView.kt` | Android ML Kit + front camera mirroring |

## Next Steps

### Immediate: Runtime Testing
1. `npx expo run:ios` — test all phases on iOS simulator (face detection / body pose)
2. Test on physical device (simulator has no real camera for Vision body pose)
3. `npx expo run:android` — verify CameraX + ML Kit
4. Tune angle thresholds with real users (current values are theoretical estimates)

### Minor TODOs
5. Wire `resetCommonChecks()` on exercise switch (back rounding detector state persists between exercises)
6. Test landscape orientation for bench press exercises
7. Verify front camera mirroring on both platforms

### Future: Real LLM Coaching (Phase 6C Step 2)
8. Build `POST /api/form-feedback` endpoint in `clip2fit-api` repo — accepts aggregated angles/issues, returns streaming Claude Haiku response
9. Swap `form-coaching-mock.ts` for real API call in `hooks/use-form-coaching.ts`
10. Add auth (Supabase JWT) and rate limiting (20/min) to the endpoint

### Future: Unit Tests
11. Pure logic is easily testable without React: `pose-angles.ts`, `rep-counter.ts`, `form-evaluator.ts`, `barbell-tracker.ts`, `back-rounding-detector.ts`, `symmetry-checker.ts`
12. No test infrastructure exists — would need to add Jest or Vitest
