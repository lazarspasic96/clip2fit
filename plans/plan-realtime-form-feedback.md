# Real-Time Exercise Form Feedback — Deep Research & Implementation Plan

## Context
Clip2Fit wants a feature where users point their phone camera at themselves while exercising (e.g., deadlift, squat) and receive real-time feedback on their form. This requires: (1) on-device pose estimation via camera, (2) joint angle analysis, (3) LLM-powered coaching feedback. This document synthesizes research across 50+ sources.

---

## Part 1: How It Works (Architecture Overview)

```
Phone Camera (30 FPS)
  → VisionCamera Frame Processor (on-device, <1ms overhead)
    → Pose Estimation Model (BlazePose/MoveNet, ~15-30ms)
      → 33 body landmarks (x, y, z + visibility)
        → Joint Angle Calculator (<1ms)
          ├── Layer 1: INSTANT feedback (every frame, rule-based)
          │   → "Keep your back straight!" overlay + skeleton
          │   → Rep counting via angle state machine
          │
          └── Layer 2: PERIODIC LLM coaching (every 3-5 sec)
              → Aggregated landmarks + angles → Claude Haiku 4.5
              → Nuanced feedback: "Your left knee is tracking inward.
                 Focus on pushing knees out over toes."
```

**Key insight from research**: Every successful app (Tempo, Kemtai, Kaia Health, Sency) uses a **hybrid local+cloud approach**. Pose estimation MUST run on-device for latency/privacy. LLM calls are periodic, not per-frame.

---

## Part 2: Pose Estimation — Technology Options

### Tier 1: Recommended for Clip2Fit

#### Option A: VisionCamera + ML Kit Pose Detection (SIMPLEST)
- **Stack**: `react-native-vision-camera` + `react-native-vision-camera-mlkit`
- **Landmarks**: 33 (BlazePose via Google ML Kit)
- **FPS**: 30+ on modern phones
- **Platforms**: iOS + Android
- **Expo**: Requires dev client (config plugin available)
- **Integration effort**: ~2-3 days
- **Pros**: Single package, well-maintained (pedrol2b), includes pose + face + OCR
- **Cons**: Smaller community (~30 stars)

#### Option B: VisionCamera + TFLite MoveNet (MOST PROVEN)
- **Stack**: `react-native-vision-camera` + `react-native-fast-tflite` + `vision-camera-resize-plugin`
- **Landmarks**: 17 (COCO keypoints — sufficient for exercise form)
- **FPS**: 50+ (MoveNet Lightning, <7ms inference)
- **Platforms**: iOS + Android
- **Author**: Marc Rousavy (same as VisionCamera, 9.2k stars)
- **Integration effort**: ~3-5 days
- **Full tutorial**: https://mrousavy.com/blog/VisionCamera-Pose-Detection-TFLite
- **Demo repo**: https://github.com/mrousavy/VisionCameraSkiaDemo
- **Pros**: Battle-tested, GPU acceleration, zero-copy ArrayBuffers, author maintains both libs
- **Cons**: 17 keypoints (no fingers/toes — but fine for gym exercises)

#### Option C: react-native-mediapipe (cdiddy77) (MOST COMPLETE API)
- **Stack**: `react-native-mediapipe` + `react-native-vision-camera`
- **GitHub**: https://github.com/cdiddy77/react-native-mediapipe (~66 stars)
- **Landmarks**: 33 (MediaPipe BlazePose)
- **Platforms**: iOS + Android
- **Integration effort**: ~1-3 days
- **Pros**: React hooks API, multi-task (pose + face + hands), MIT license
- **Cons**: Smaller community, v0.6.0 (Dec 2024)

### Tier 2: Alternatives

| Library | Landmarks | Notes |
|---------|-----------|-------|
| `react-native-mediapipe-posedetection` (EndLess728) | 33 | New Arch only (matches your setup), pose-focused |
| `@thinksys/react-native-mediapipe` | 33 | Customizable body regions, Android SDK 24+ |
| PoseTracker API (WebView) | 17 | Only option for Expo Go, ~20 FPS, good for prototyping |

### Tier 3: Commercial SDKs

| SDK | Features | Pricing |
|-----|----------|---------|
| **Sency AI** | Full exercise detection, rep counting, form feedback, edge processing. 1-day integration. 1.5M+ users. | Contact for pricing |
| **KinesteX AI** | React Native SDK, ready-made workouts, >90% accuracy, on-device | https://github.com/KinesteX/KinesteX-SDK-ReactNative |
| **QuickPose** | MediaPipe wrapper, pre-built exercises, iOS only | Free <100 MADs, paid tiers above |

### Model Comparison

| Model | Keypoints | Speed (mobile) | Accuracy | Best For |
|-------|-----------|---------------|----------|----------|
| BlazePose (ML Kit) | 33 3D | ~30 FPS | High (r=0.80-0.91) | Exercise form (more detail) |
| MoveNet Lightning | 17 | <7ms (~140 FPS) | Good | Battery-sensitive, fast |
| MoveNet Thunder | 17 | ~20ms (~50 FPS) | Very Good | Accuracy-focused |
| Apple Vision (iOS) | 19 | ~30 FPS | Good | iOS-only, zero deps |

---

## Part 3: Exercise Form Analysis — How to Detect Good/Bad Form

### Joint Angle Calculation
```typescript
// Calculate angle at vertex point B between segments BA and BC
const calculateAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number }, // vertex
  c: { x: number; y: number }
): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) -
                  Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
};
```

### Exercise-Specific Rules (Research-Backed)

**Squat**:
- Knee angle (hip-knee-ankle): 80-100 deg at bottom = good, >100 = not deep enough
- Hip angle (shoulder-hip-knee): 60-90 deg = good, <60 = excessive forward lean
- Trunk lean (shoulder-hip vs vertical): <45 deg = good
- Knee tracking: knees should track over toes, not cave inward

**Deadlift**:
- Back angle: shoulder-hip line should stay neutral (not rounding)
- Hip hinge: 45-90 deg torso angle during lift
- Bar path (wrist position): should stay vertical over midfoot

**Bicep Curl**:
- Elbow drift: minimal x-axis movement at elbow = good
- Trunk stability: <5 deg trunk sway = good (no momentum)

### Rep Counting
State machine approach: track angle trajectory, detect peaks (extended) and troughs (contracted). One rep = trough → peak → trough.

---

## Part 4: LLM Integration — Claude for Coaching Feedback

### Recommended: Landmark JSON → Claude Haiku 4.5 (Streaming)

**Why NOT send images to Claude Vision?**
- Cost: ~1,334 tokens/image vs ~200 tokens for landmark JSON (6.7x cheaper)
- Latency: Image adds 1-2s to TTFT
- Accuracy: Dedicated pose model + angles is more precise than Claude Vision's spatial reasoning
- Privacy: On-device pose = no video leaves phone

**When to use Vision**: Per-set summary screenshot, unknown exercises, user-requested form check.

### API Call Pattern
```
POST /api/form-feedback (your Next.js backend)
  → Claude Haiku 4.5 streaming

System prompt: Exercise-specific form rules, user's fitness level, injury history
User message: {
  exercise: "squat",
  rep_phase: "bottom",
  landmarks: { left_hip: {x,y,z}, ... },  // ~200 tokens
  angles: { left_knee: 85, hip: 72, trunk_lean: 35 },
  rep_count: 5,
  set_averages: { avg_depth: 87, symmetry_score: 0.94 }
}

Response: Structured JSON {
  score: 8,
  issues: [{ body_part: "left_knee", issue: "slight inward tracking", severity: "minor" }],
  cue: "Push your knees out over your toes"
}
```

### Latency Budget
| Step | Time |
|------|------|
| Pose estimation (on-device) | ~30ms |
| Angle calculation (local) | ~1ms |
| Network round-trip | ~50-100ms |
| Claude Haiku 4.5 TTFT | ~520ms |
| Response generation (~100 tok) | ~500ms |
| **Total** | **~1.1-1.2s** |

Fits within a 2-3 second feedback cycle with margin.

### Cost Per Session (30 min workout)
- LLM calls: ~360 calls (every 5s) × ~300 tokens = ~108K tokens
- Cost: ~$0.25/session on Haiku 4.5 ($1/$5 per MTok)
- At 1,000 users × 12 sessions/month = ~$3,000/month

---

## Part 5: Visual Overlay — Drawing Skeleton on Camera

VisionCamera V4 supports **Skia Frame Processors** for real-time drawing:

```tsx
import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia } from '@shopify/react-native-skia';

const frameProcessor = useSkiaFrameProcessor((frame) => {
  'worklet';
  frame.render(); // render camera frame first

  // Draw skeleton lines between joints
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('lime'));
  paint.setStrokeWidth(3);

  // Draw circle at each landmark
  for (const landmark of landmarks.value) {
    frame.drawCircle(landmark.x * frame.width, landmark.y * frame.height, 5, paint);
  }
}, []);
```

Requires: `@shopify/react-native-skia` >= 1.2.1 + `react-native-reanimated` >= 3.0.0

---

## Part 6: Existing Apps & Open Source Reference

### Commercial Apps (How They Work)
| App | Tech | Status |
|-----|------|--------|
| **Tempo** | ToF depth sensor + proprietary ML | Active, subscription |
| **Kemtai** | CV tracking 44 data points, browser-based | Active, B2B+B2C |
| **Kaia Health** | Proprietary CV, clinically validated (r=0.828) | Market leader in MSK therapy |
| **GymScore AI** | 33 landmarks, scores form 0-100 across 5 categories | Active |
| **Sency AI** | Edge CV SDK, 1.5M+ users, integrate in 1 day | Active, SDK available |

### Open Source Projects
| Project | Tech | URL |
|---------|------|-----|
| Fitness-AI-Trainer (99% accuracy) | MediaPipe + OpenCV + Streamlit | https://github.com/RiccardoRiccio/Fitness-AI-Trainer-With-Automatic-Exercise-Recognition-and-Counting |
| RepDetect (Android/Kotlin) | MediaPipe, real-time form + reps | https://github.com/giaongo/RepDetect |
| Exercise-Correction | MediaPipe, 4 exercise models | https://github.com/NgoQuocBao1010/Exercise-Correction |
| VisionCameraSkiaDemo | VisionCamera + TFLite + Skia | https://github.com/mrousavy/VisionCameraSkiaDemo |
| TF.js React Native Pose | MoveNet in React Native | https://github.com/tensorflow/tfjs-examples/blob/master/react-native/pose-detection/App.tsx |
| AI Fitness Trainer tutorial | MediaPipe squat analysis | https://learnopencv.com/ai-fitness-trainer-using-mediapipe/ |

---

## Part 7: Recommended Implementation Approach

### Phase 1: MVP (2-3 weeks)
1. Install `react-native-vision-camera` + config plugin
2. Install `react-native-vision-camera-mlkit` (pose detection via ML Kit) OR `react-native-fast-tflite` (MoveNet)
3. Build camera screen with frame processor extracting landmarks
4. Implement angle calculator utility (TypeScript)
5. Add rule-based form checks for 3 exercises: squat, deadlift, bicep curl
6. Draw skeleton overlay via Skia frame processor
7. Rep counter via angle state machine
8. Display instant feedback UI (green/yellow/red indicators)

### Phase 2: LLM Coaching (1-2 weeks)
1. Add API route `POST /api/form-feedback` to Next.js backend
2. Integrate Claude Haiku 4.5 with streaming
3. Build prompt templates per exercise
4. Throttled calls every 3-5 seconds from app
5. Display LLM coaching text + optional TTS audio cue

### Phase 3: Polish (1-2 weeks)
1. Exercise selection UI
2. Workout session tracking (sets, reps, form scores)
3. Post-workout summary (with optional Vision screenshot analysis)
4. Cache common feedback patterns
5. Performance optimization (frame skipping, model selection)

### Required Dependencies
```
react-native-vision-camera    (camera + frame processors)
react-native-worklets-core    (worklet runtime for frame processors)
@shopify/react-native-skia    (skeleton overlay drawing)
react-native-reanimated        (already installed — needed for Skia FP)
react-native-vision-camera-mlkit  OR  react-native-fast-tflite
```

All require Expo **development build** (`npx expo prebuild`). Not compatible with Expo Go.

---

## Unresolved Questions

1. **Which pose library?** ML Kit plugin (33 landmarks, easier) vs fast-tflite + MoveNet (17 landmarks, faster, more proven ecosystem)?
2. **Start with how many exercises?** MVP with just squat, or include deadlift + curl from day one?
3. **LLM from day one or later?** Layer 1 (local rules) is valuable alone. LLM coaching could be Phase 2.
4. **Audio feedback?** TTS for coaching cues, or text-only to start?
5. **Commercial SDK vs DIY?** Sency/KinesteX can accelerate but add vendor dependency and cost. DIY is free but more development time.
