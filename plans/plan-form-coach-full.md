# Real-Time Exercise Form Coach — Full Implementation Plan

## Context

Clip2Fit converts workout videos into structured plans. The next major feature: **real-time form coaching** using the device camera. The camera tracks body landmarks (joints), draws a skeleton overlay, calculates joint angles, detects form errors (back rounding, knee valgus, bar path drift), counts reps, and gives coaching feedback like a real trainer.

**Existing foundation**: A detailed Phase 1 plan already exists at `plans/plan-form-coach-pose-camera.md` covering camera + skeleton overlay via a custom Expo Module (Apple Vision iOS / ML Kit Android). That plan is the starting point — this document extends it through 6 phases, simple → complex.

---

## SDK Decision: Custom Expo Module (Apple Vision + ML Kit)

**Why NOT VisionCamera**: Project uses `react-native-reanimated` v4 + `react-native-worklets` 0.7.2. VisionCamera frame processors require `react-native-worklets-core` (Margelo) — mutually exclusive babel plugins, Android namespace collision. Issue #3563 unresolved.

**Chosen approach**: Local Expo Module (`modules/expo-pose-camera/`)
- **iOS**: `AVCaptureSession` + `VNDetectHumanBodyPoseRequest` — 19 joints, zero deps, iOS 14+
- **Android**: CameraX + ML Kit Pose Detection — 33 joints, one gradle dep
- **Unified**: 15 common joints sufficient for all form analysis (shoulders, elbows, wrists, hips, knees, ankles, nose, neck, root)

**Data flow**: Native (bg thread, ~20 FPS) → Expo event → JS `runOnUI()` → SharedValue update → Skia Canvas reads on UI thread. Zero React re-renders.

---

## Design Decisions (from interview)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Audio feedback | **TTS from Phase 2** via `expo-speech`, system default voice | User can't look at phone while lifting. Even canned rule-based strings are useful spoken aloud. |
| Camera | **Both** — back + front with flip toggle | Front camera needed for at-home workouts without stand. Mirror X in native. |
| Orientation | **Both** — portrait + landscape, auto-rotate | Bench press / floor exercises need landscape. |
| Exercise priority | **Compound lifts** — Squat → Deadlift → Bench Press → OHP → Lunge | Most benefit from form checking, clearest angle-based rules. |
| Feedback timing | **Real-time mid-rep** | Instant feedback as issues detected. No delay. |
| Phone placement | **Guided setup screen** with exercise-specific placement diagrams | Auto-confirm via pose detection when exercise-specific required joints visible at >0.5 confidence. |
| Lost body tracking | **Visual warning only** — "Body not detected" overlay, no audio | Skeleton disappears, warning shows, resumes when body reappears. |
| Rest detection | **Auto-detect rest — dim overlay** + pause pose processing | No movement for >5s → dim skeleton, pause processing, save battery. Resume on movement. |
| Feedback density | **Show up to 2 items** — primary (most severe, large) + secondary (smaller, below) | Clean UI without missing important secondary issues. |
| Set summary | **Summary card on rest** — rep count, form quality breakdown, top issue | Slides up when rest auto-detected. Dismissible. |
| Workout summary | **Full summary on close** — aggregate stats, form score, most common issue, best/worst exercise | Nice closure for the workout session. |
| Unsupported exercises | **Allow — skeleton only mode** | Label "Skeleton mode — form feedback coming soon". Skeleton overlay works for any exercise. |
| Camera angle reliability | **Disable unreliable checks + explain why** | E.g. side view → knee valgus check disabled, show "Switch to front view to check knee tracking". |
| Setup confirmation | **Automatic — exercise-specific required joints** | Each exercise config defines required joints. Camera runs during setup, auto-starts when checks pass. |
| Exercise switching | **Manual switch only** — user taps exercise label to change | Rep counter resets on switch. Explicit and predictable. |
| Multi-person handling | **Highest confidence wins** — no mirror/reflection mitigation | Trust the pose model. Simple. |
| Personalization | **Fixed universal thresholds** | Same thresholds for everyone. Ship, collect data, personalize later. |
| LLM context | **Current set only** — stateless, ~200 tokens per call | No historical context. Keep prompts tiny. |
| Video replay | **Deferred** — Phase 7+ | Focus on live feedback first. |
| Monetization | **Fully free** — cost limits deferred | Focus on building the feature. Monetization decisions later. |
| Workout integration | **Yes — add to active workout screen** | Each exercise row gets a form-check icon during active workout. |
| TTS voice | **System default** — no custom voice selection | Familiar to user, zero config, cross-platform. |

---

## Phase 1: Camera + Skeleton Overlay + Setup Screen

> **Core camera + skeleton already planned in detail** at `plans/plan-form-coach-pose-camera.md`. Additions below.

**Goal**: User taps "Form Coach" → exercise picker → guided setup → auto-confirm → full-screen camera with lime skeleton.

### New Files

| File | Purpose |
|------|---------|
| `modules/expo-pose-camera/` | Local Expo module (Swift + Kotlin) — camera + pose detection |
| `app/(protected)/form-coach.tsx` | Camera screen with setup → active → rest states |
| `components/form-coach/skeleton-overlay.tsx` | Skia canvas reading SharedValue, draws joints + bones |
| `components/form-coach/exercise-sheet.tsx` | Exercise picker bottom sheet |
| `components/form-coach/permission-denied-view.tsx` | Camera denied fallback with "Open Settings" |
| `components/form-coach/camera-flip-button.tsx` | Toggle front/back camera |
| `components/form-coach/setup-overlay.tsx` | **NEW** — Guided setup screen with exercise-specific placement diagram + live joint checklist. Auto-confirms when required joints visible. |
| `components/form-coach/body-not-detected-overlay.tsx` | **NEW** — "Body not detected" visual warning, shown when tracking lost |
| `constants/pose-skeleton.ts` | Joint names, skeleton connections, per-exercise required joints |

### Modified Files

| File | Change |
|------|--------|
| `components/home/bottom-action-buttons.tsx` | Add "Form Coach" tile |
| `app/(protected)/_layout.tsx` | Register form-coach as fullScreenModal |

**Install**: `@shopify/react-native-skia`, `expo-screen-orientation`, `expo-speech`

### Setup Screen Behavior

1. Camera preview runs immediately (no separate permission screen — permission requested on mount)
2. Exercise-specific placement diagram shown as overlay (e.g., "Place phone 6-8ft away, facing your left side")
3. Live joint checklist updates in real-time: "Shoulders ✓ Hips ✓ Knees ✓ Ankles ✗"
4. When all required joints detected at >0.5 confidence → green checkmark → auto-transition to active mode after 2s countdown
5. Each `FormRuleConfig` defines `requiredJoints: string[]` — squat needs all lower body + spine, bench press needs shoulders + elbows + wrists + hips
6. Each `FormRuleConfig` defines `recommendedView: 'side' | 'front' | '45-degree'` — shown in placement diagram

### Camera Flip

Native module accepts `cameraPosition: 'front' | 'back'` prop. When front camera: mirror landmark X coordinates (`x = 1.0 - x`) in native before sending to JS. Toggle button in top-left corner.

### Orientation

Use `expo-screen-orientation` to detect current orientation. Pass orientation to Skia overlay for coordinate transform. Native module handles camera rotation via `AVCaptureConnection.videoOrientation` (iOS) / CameraX rotation (Android).

### Screen States

```
Setup → Active (set) → Rest (auto-detected) → Active (next set) → ... → Close (workout summary)
```

- **Setup**: Placement guide + live joint checklist. Auto-transitions when ready.
- **Active**: Skeleton + feedback overlays. Pose processing at 20 FPS.
- **Rest**: Auto-detected after >5s no movement. Dim skeleton, pause processing, show set summary card.
- **Close**: Show workout summary screen, then navigate back.

### Verify

Camera shows, lime skeleton tracks body at 15+ FPS, zero React re-renders. Camera flip works. Landscape mode draws skeleton correctly. Setup auto-confirms when body positioned correctly. Body lost → "Body not detected" overlay. Rest detected → overlay dims.

---

## Phase 2: Joint Angles + Squat Form Feedback + TTS

**Goal**: Calculate joint angles per frame. For squat, show real-time traffic-light feedback (green/yellow/red). Speak error-level cues via TTS.

### New Files

| File | Purpose |
|------|---------|
| `utils/pose-angles.ts` | `calculateAngle(a, b, c)` — 3-point joint angle via `atan2`. `calculateTrunkLean(shoulder, hip)` — spine vs vertical. `calculateKneeTracking(knee, ankle)` — valgus drift. |
| `types/form-rules.ts` | `FormSeverity`, `FormIssue`, `AngleRule`, `FormRuleConfig` types (includes `requiredJoints`, `recommendedView`, `reliableFromAngles`) |
| `constants/form-rules/squat.ts` | Squat thresholds + required joints + recommended side view |
| `constants/form-rules/index.ts` | Registry: `FORM_RULES_REGISTRY` maps exercise names → configs. `hasFormRules()` checker. |
| `utils/form-evaluator.ts` | Takes landmarks + rules + detected camera angle → returns `FormIssue[]`. Disables unreliable checks for current view angle. |
| `utils/camera-angle-detector.ts` | **NEW** — Detects side/front/rear view from shoulder-hip width ratio. Returns detected angle. |
| `components/form-coach/form-feedback-overlay.tsx` | Up to 2 pills: primary (large) + secondary (smaller). Green/yellow/red. |
| `components/form-coach/angle-debug-overlay.tsx` | `__DEV__` only — live angle numbers on screen for tuning |
| `components/form-coach/unreliable-check-note.tsx` | **NEW** — Subtle note: "Switch to front view to check knee tracking" |
| `hooks/use-tts-feedback.ts` | **NEW** — Wraps `expo-speech`. Speaks error-severity cues immediately. Mute toggle via MMKV. System default voice, rate 1.1x. |
| `components/form-coach/tts-mute-button.tsx` | **NEW** — Speaker icon toggle in top controls |

### Modified Files

| File | Change |
|------|--------|
| `app/(protected)/form-coach.tsx` | Run angle calc in JS event handler, pass issues to feedback overlay, wire TTS |
| `components/form-coach/skeleton-overlay.tsx` | Color-code joints red when form issue detected on that body part |

### Core Algorithm

```ts
const calculateAngle = (a: Point, b: Point, c: Point): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let degrees = Math.abs(radians * 180 / Math.PI)
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}
```

### Camera Angle Detection

```ts
// Detect view angle from shoulder width relative to torso height
// Side view: shoulder width / torso height < 0.3 (shoulders nearly overlapping)
// Front view: ratio > 0.6 (shoulders spread wide)
// 45-degree: ratio between 0.3 and 0.6
```

### Angle-Aware Rule Evaluation

Each `AngleRule` includes `reliableFrom: ('side' | 'front' | '45-degree')[]`. Form evaluator checks the detected camera angle and skips rules not reliable from that angle. When a rule is skipped, show the note: "Switch to [recommended view] to check [body part]".

### Squat Rules

- **Knee angle** (hip→knee→ankle): good [80-100], warning [70-110], error outside. Reliable from: side, 45-degree.
- **Hip angle** (shoulder→hip→knee): good [60-90], error < 45 (excessive forward lean). Reliable from: side.
- **Knee valgus**: knee.x drifts > 0.05 past ankle.x. Reliable from: front, 45-degree.

### Form Rule Config Type

```ts
type FormRuleConfig = {
  exerciseName: string
  aliases: string[]
  requiredJoints: string[]
  recommendedView: 'side' | 'front' | '45-degree'
  angles: AngleRule[]
  customChecks?: ((landmarks, cameraAngle) => FormIssue | null)[]
}
```

### TTS Behavior

- Speak immediately when severity is `error` (e.g., "Back rounding, brace core")
- Do NOT speak `warning` cues — visual only, avoid spam
- New cue interrupts in-progress speech (`Speech.stop()` before `Speech.speak()`)
- Mute toggle persisted to MMKV
- System default voice, rate 1.1x

### Feedback Overlay

- **Primary pill** (large): Most severe issue. Red/yellow/green background + white text.
- **Secondary pill** (smaller, below primary): Second most severe. Dimmer. Hidden if only 1 issue.
- **Green state**: No issues → "Good Form ✓" pill shown.
- Animate pills in/out with Reanimated (opacity + translateY).

### Verify

Squat with good depth → green. Shallow squat → yellow "Try to break parallel". Excessive lean → red + TTS speaks. Knee cave from front view → yellow "Push knees out". Knee cave from side view → check disabled, note shown. Mute button silences TTS.

---

## Phase 3: More Exercises + Rep Counting + Set Summary

**Goal**: Add form rules for deadlift, bench press, overhead press, lunge. Count reps via angle peak detection. Show set summary on rest.

### New Files

| File | Purpose |
|------|---------|
| `constants/form-rules/deadlift.ts` | Hip hinge angle, lockout, back angle. Required: side view. |
| `constants/form-rules/bench-press.ts` | Bar path, elbow flare, lockout. Required: side or 45-degree. Joints: upper body only. |
| `constants/form-rules/overhead-press.ts` | Lockout angle, back arch. Required: side view. |
| `constants/form-rules/lunge.ts` | Front knee tracking, torso upright. Required: side or front. |
| `utils/rep-counter.ts` | State machine: `resting → descending → bottom → ascending → resting` (1 rep) |
| `components/form-coach/rep-counter-display.tsx` | Rep count badge on overlay |
| `components/form-coach/set-summary-card.tsx` | **NEW** — Compact card shown on rest: rep count, form quality breakdown (good/warning/error per rep), top issue |
| `stores/form-session-store.ts` | External store (follows `catalogFilterStore` pattern) tracking reps, per-rep scores, exercise history for current session |

### Rep Counter State Machine

Track primary angle per exercise (knee for squat, hip for deadlift, elbow for press). Transitions:
- `resting → descending`: angle drops below `topThreshold`
- `descending → bottom`: angle drops below `bottomThreshold`
- `bottom → ascending`: angle rises above `bottomThreshold`
- `ascending → resting`: angle rises above `topThreshold` → **rep++**

Debounce: minimum 15 frames between reps to prevent double-counting.

### Set Summary Card

When rest auto-detected (>5s no movement):
1. Pose processing pauses (battery savings)
2. Set summary card slides up from bottom:
   - "Set 3 • 8 reps"
   - Per-rep form quality: colored dots (green/yellow/red) in a row
   - "Main issue: Back rounding (reps 6-8)"
3. Card is dismissible (swipe down or tap outside)
4. Processing resumes when movement detected again

### Form Session Store

```ts
interface FormSession {
  exerciseName: string
  sets: SetResult[]      // completed sets
  currentSet: {
    reps: number
    repScores: FormSeverity[]
    repIssues: FormIssue[][]  // issues per rep
  }
}
```

### Exercise Switching

User taps exercise label at bottom → exercise sheet reopens. On selection:
1. Current set auto-saved to session store
2. Rep counter resets to 0
3. Setup screen shown briefly for new exercise (different required joints / recommended angle)

### Modified Files

- `constants/form-rules/index.ts` — Register new exercise configs
- `app/(protected)/form-coach.tsx` — Wire rep counter, set summary, rest detection

### Verify

Deadlift reps count correctly. Bench press shows only upper-body rules. Fast reps don't double-count. Rest detected → set summary slides up. Switch exercise → rep counter resets, new setup shown.

---

## Phase 4: Back Rounding Detection + Advanced Cues

**Goal**: Detect spinal rounding via shoulder-hip vector analysis. Bilateral symmetry checks. Richer coaching messages.

### New Files

| File | Purpose |
|------|---------|
| `utils/back-rounding-detector.ts` | Track shoulder→hip spine angle vs vertical over time. Sudden increase > 15 deg in 5 frames → rounding detected. |
| `utils/symmetry-checker.ts` | Compare left vs right side angles. Delta > 10 deg → asymmetry warning. |
| `constants/form-rules/common-checks.ts` | Shared checks: back rounding, weight shift, applied across all barbell exercises |
| `components/form-coach/body-highlight-overlay.tsx` | Skia overlay: red glow on specific body region when issue detected |

### Algorithm: Back Rounding

```
spineAngle = angle between (shoulder→hip vector) and (vertical)
Maintain 10-frame rolling window.
If spineAngle increases > 15 deg over 5 consecutive frames → "Back rounding — brace core"
If absolute spineAngle > 45 deg during squat bottom → "Excessive forward lean"
```

### Algorithm: Symmetry

Compare left/right knee angles during squat. Delta > 10 deg → "Uneven depth — left side deeper". Compare shoulder heights during press. Delta > 0.03 normalized → "Uneven pressing". Only reliable from front/45-degree view.

### Expanded Coaching Messages

Per exercise, message library:
- Squat: "Heels lifting — shift weight back", "Knees past toes — sit back more", "Good depth, nice work"
- Deadlift: "Hips rising too fast — push through legs", "Bar drifting forward — keep close to shins"
- Bench: "Elbows flaring — tuck to 45 degrees", "Uneven press — check left arm"
- OHP: "Excessive back arch — tighten core", "Not locking out — press to full extension"

### Modified Files

- `utils/form-evaluator.ts` — Integrate back rounding + symmetry
- `constants/form-rules/squat.ts`, `deadlift.ts` — Add back rounding as common check
- `components/form-coach/skeleton-overlay.tsx` — Red spine segment when rounding
- `components/form-coach/form-feedback-overlay.tsx` — Priority queue (most severe first)

### Verify

Intentional back rounding during squat → "Back rounding" within 0.5s + TTS speaks. Uneven squat from front view → asymmetry warning. Normal deadlift forward lean ≠ false positive. Symmetry check disabled from side view.

---

## Phase 5: Barbell Path Tracking

**Goal**: Infer barbell position from wrist midpoint. Draw bar path trace. Detect drift.

### New Files

| File | Purpose |
|------|---------|
| `utils/barbell-tracker.ts` | Bar position = midpoint of left+right wrist. 60-frame path history. Horizontal drift detection. |
| `components/form-coach/barbell-path-overlay.tsx` | Skia: gradient line trail (cyan `#22d3ee`), 60 frames, older=faded, drift=red |
| `constants/form-rules/barbell-path.ts` | Per-exercise ideal path shape (vertical for squat/press, slight S-curve for deadlift) |

### Conditional Activation

Only when `CatalogExercise.equipment` is `barbell`, `ez barbell`, or `smith machine`. For `dumbbell` → track each wrist independently. For `body weight` → hidden.

### Bar Drift Detection

```
startX = first wrist midpoint X when set begins
currentX = current wrist midpoint X
drift = |currentX - startX|
If drift > 0.05 → "Bar drifting forward/backward"
```

### Modified Files

- `app/(protected)/form-coach.tsx` — Add barbell overlay when equipment=barbell
- `types/form-rules.ts` — Add `equipment` field to `FormRuleConfig`

### Verify

Barbell squat → cyan bar path visible. Straight path = clean line. Bar drift → warning + line turns red. Bodyweight exercise → no barbell overlay.

---

## Phase 6: AI-Powered Coaching (LLM)

**Goal**: Periodic LLM calls (every 3-5s) for nuanced coaching. Two layers: instant rule-based (Phases 2-5) + periodic LLM coaching. LLM cues also spoken via TTS.

### Backend (clip2fit-api)

| File | Purpose |
|------|---------|
| `src/app/api/form-feedback/route.ts` | POST endpoint: accepts aggregated landmark + angle data. Returns streaming Claude Haiku response (1-2 sentence coaching cue). |

### Frontend New Files

| File | Purpose |
|------|---------|
| `hooks/use-form-coaching.ts` | Throttled LLM call every 3s. Aggregates 60-frame ring buffer → summary. Fire-and-forget streaming. Current set context only (stateless). |
| `components/form-coach/coaching-bubble.tsx` | Floating text bubble above feedback overlay. Auto-dismiss 3s. Dark semi-transparent bg, white text, lime border. |
| `utils/form-data-aggregator.ts` | Ring buffer → aggregated summary for LLM input (~200 tokens) |
| `types/form-coaching.ts` | API request/response types |

### LLM Integration

- **Context**: Current set only — no historical data. Stateless per call.
- **Input**: Aggregated angles, symmetry scores, rep phase, active form issues, exercise name. ~200 tokens.
- **Output**: 1-2 sentence coaching cue. Streamed.
- **TTS**: Every LLM response spoken aloud (unless muted). Upgrades the TTS experience from canned strings to natural language.

### Cost Control

- Max 1 call per 3s (20 calls/min)
- Pause when user in rest phase (auto-detected)
- ~200 input tokens per call
- Est. ~$0.25 per 30-min session on Haiku
- Cost limits deferred — focus on building first

### Verify

Good form → encouraging TTS message. Bad form → specific correction spoken aloud. Mute button silences TTS. Resting → no LLM calls. Poor network → rule-based TTS continues uninterrupted.

---

## Entry Points (3 total)

### 1. Home Screen Tile
- "Form Coach" tile on home screen bottom action buttons
- Opens exercise sheet → setup → camera

### 2. Exercise Detail Screen
- `ScanLine` icon (lucide) in exercise detail header
- Only visible when `hasFormRules(exercise.name)` returns true — OR show for all exercises (skeleton-only mode)
- Navigates to form-coach pre-loaded with that exercise

### 3. Active Workout Screen
- Each exercise row gets a form-check icon during active workout
- Tapping opens form coach pre-loaded with that exercise
- Most natural entry point — user is already logging sets

### Modified Files

- `app/(protected)/exercise-detail.tsx` — Add conditional camera icon
- `components/catalog/exercise-animated-header.tsx` — Optional icon slot
- Active workout screen component — Add form-check icon per exercise row

---

## Workout Summary Screen

When user closes form coach (X button):

1. Show full-screen workout summary:
   - Total reps across all exercises
   - Overall form score (weighted average of rep severities)
   - Most common issue (e.g., "Back rounding appeared in 40% of reps")
   - Best exercise (highest % green reps)
   - Worst exercise (highest % red reps)
   - Per-exercise breakdown: exercise name, total reps, form quality bar
2. "Done" button → navigate back to previous screen
3. Data sourced from `formSessionStore` — no persistence to backend (deferred)

### New Files

| File | Purpose |
|------|---------|
| `components/form-coach/workout-summary-screen.tsx` | Full-screen summary with aggregate stats |

---

## Unsupported Exercise Handling

When user selects an exercise without form rules:
- Camera + skeleton overlay works normally (all 15 joints drawn)
- No form feedback pills shown
- No rep counting
- Label at bottom: exercise name + "Skeleton mode — form feedback coming soon"
- In Phase 6: LLM coaching still fires for unsupported exercises (Claude can give general feedback from landmarks alone)

---

## Build Verification Gate (After Every Phase)

After completing each phase, run the following checks before proceeding to the next:

```bash
npx expo lint          # ESLint — zero errors
npx tsc --noEmit       # TypeScript — zero errors
npx expo prebuild      # Native project generation — no failures
npx expo run:ios       # iOS build + launch — no crashes
npx expo run:android   # Android build + launch — no crashes
```

**Do NOT start the next phase until the current phase builds and runs cleanly on both platforms.** If a build fails, fix it before moving on — compounding native build issues across phases is extremely painful to debug.

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Pose detection | 20 FPS during active set, 0 FPS during rest |
| Skeleton draw | 60 FPS (Skia, UI thread) |
| Angle calculation | < 1ms/frame (pure math, JS thread) |
| Rule evaluation | < 1ms/frame (threshold comparisons) |
| LLM round-trip | < 2s (every 3-5s, non-blocking) |
| Memory overhead | < 50MB (pose model + ring buffer + Skia) |
| Battery | Per-set activation only — processing pauses during rest |

---

## Key Open Source References

| Resource | Use |
|----------|-----|
| [react-native-mediapipe](https://github.com/cdiddy77/react-native-mediapipe) | Reference for Expo Module pattern wrapping native pose SDK |
| [VisionCameraSkiaDemo](https://github.com/mrousavy/VisionCameraSkiaDemo) | Skia skeleton drawing pattern |
| [LearnOpenCV AI Fitness Trainer](https://learnopencv.com/ai-fitness-trainer-using-mediapipe/) | Complete angle calculation + rep counting code |
| [Squats angle detection](https://github.com/Pradnya1208/Squats-angle-detection-using-OpenCV-and-mediapipe_v1) | Squat-specific angle thresholds |
| [barbell-path-tracker](https://github.com/Marticles/barbell-path-tracker) | 9 bar tracking algorithms |
| [Sports2D](https://github.com/davidpagnon/Sports2D) | Joint/segment angle computation reference |
| [fitness-trainer-pose-estimation](https://github.com/yakupzengin/fitness-trainer-pose-estimation) | 18-exercise form checking rules |
| [Expo pose detection demo](https://github.com/mantu-bit/Expo-React-native-pose-detection-demo) | Expo Module API bridging MediaPipe |

---

## Deferred (Post Phase 6)

1. **Form score persistence** — Save to Supabase for progress tracking. New DB table + API endpoint.
2. **Video replay** — Record camera + skeleton for post-set review. Storage/privacy implications.
3. **Exercise name fuzzy matching** — Currently exact + aliases. Catalog has 1300+ exercises.
4. **Personalized thresholds** — Auto-calibrate to user's body proportions and mobility.
5. **LLM historical context** — Include past session data for progress-aware coaching.
6. **Cost limits** — Usage caps or premium gating for LLM coaching if costs grow.
