# Form Coach: Split Layout — Camera (3/4) + Dashboard (1/4)

## Context

The form coach screen is currently fullscreen camera with ~13 floating overlays. All data (angles, issues, barbell path, rep count) is shown as semi-transparent pills/bubbles on top of the camera feed. This clutters the camera view and makes data hard to read.

**Goal**: Split the screen into a 3/4 camera section + 1/4 analytics dashboard. Camera keeps only coordinate-accurate overlays (skeleton, highlights, barbell path). All metrics, coaching, and controls move to a dedicated dashboard panel below (portrait) or beside (landscape).

**User decisions**: Dashboard header holds exercise selector + coaching. Two swipeable pages. Both orientations. Dashboard always visible (adapts content per state).

---

## Phase 1: Layout Hook + Screen Split

### `hooks/use-camera-layout.ts` (new)

Hook takes root container `{ width, height }` from `onLayout`. Returns:
- `isLandscape: boolean` — width > height
- `direction: 'column' | 'row'` — column portrait, row landscape
- `cameraFlex: 3` (portrait) / `3` (landscape)
- `dashboardFlex: 1` (both)

### `app/(protected)/form-coach.tsx` (refactor)

Replace single fullscreen layout:

```
<View flex-1 flexDirection={direction}>
  <View flex={cameraFlex} onLayout={setCameraSize}>   ← camera section
    <ExpoPoseCameraView style={absoluteFill} />
    <SkeletonOverlay width={cameraSize.width} height={cameraSize.height} />
    <BodyHighlightOverlay ... />
    <BarbellPathOverlay ... />
    <SetupOverlay />                                   ← stays in camera (centered)
    <BodyNotDetectedOverlay />                         ← stays in camera
    <CameraAngleToast />                               ← stays in camera top
    <UnreliableCheckNote />                            ← stays in camera top
    camera controls (flip, mute, X)                    ← stay in camera corners
  </View>

  <FormDashboard flex={dashboardFlex} ... />           ← new dashboard
</View>
```

Key change: `cameraSize` (not full-screen `layoutSize`) passed to Skia overlays.

**Removed from camera section**: RepCounterDisplay, FormFeedbackOverlay, CoachingBubble, AngleDebugOverlay, SetSummaryCard, exercise selector pill. All move to dashboard.

---

## Phase 2: Dashboard Component Tree

### File structure: `components/form-coach/dashboard/`

| File | Purpose | Props |
|------|---------|-------|
| `form-dashboard.tsx` | Container — handles state-based content + pages | All orch data |
| `dashboard-header.tsx` | Exercise selector + coaching message row | exerciseName, coaching, onExercisePress |
| `metric-card.tsx` | Reusable card: label + value + color | label, value, color, monospace? |
| `active-metrics-page.tsx` | Page 1: reps, form grade, key angles, bar speed | issues, angles, repCount, etc. |
| `advanced-metrics-page.tsx` | Page 2: barbell chart, all angles, skipped checks, rep dots | barbellPath, allAngles, skippedChecks |
| `barbell-mini-chart.tsx` | Mini Skia canvas — Y position over time | path, isDrifting |
| `setup-dashboard.tsx` | Dashboard during setup: exercise info + joint checklist | formRules, jointChecklist |
| `rest-dashboard.tsx` | Dashboard during rest: set summary + avg metrics | lastSet, setNumber |
| `page-indicator.tsx` | Dot indicator for swipeable pages | pageCount, activeIndex |

### `form-dashboard.tsx` — main container (~120 lines)

```
Props: screenState, formIssues, skippedChecks, debugAngles, cameraAngle,
       repCount, barbellPath, barbellDrifting, isBarbell, coachingMessage,
       formRules, jointChecklist, setupProgress, selectedExercise,
       showSetSummary, lastConcentricMs, setNumber,
       onExercisePress, isMuted, onMuteToggle
```

Renders based on `screenState`:
- `setup` → `<DashboardHeader />` + `<SetupDashboard />`
- `active` → `<DashboardHeader />` + horizontal `ScrollView pagingEnabled` with Page 1 + Page 2 + `<PageIndicator />`
- `rest` → `<DashboardHeader />` + `<RestDashboard />`
- `summary` → N/A (full screen WorkoutSummaryScreen takes over)

Background: `bg-zinc-950`. Separator: thin `border-t border-lime-400/10` (portrait) or `border-l` (landscape).

### `dashboard-header.tsx` (~60 lines)

Row layout:
```
┌────────────────────────────────────────┐
│ [Squat ▼]         "Keep your chest up" │
└────────────────────────────────────────┘
```

- Left: exercise name pill (Pressable → opens exercise sheet)
- Right: coaching message (truncated, fades in/out with Reanimated)
- During rest: coaching area shows "Resting — start moving to resume"

### `metric-card.tsx` (~40 lines)

Compact reusable card:
```
┌──────────┐
│ Depth    │
│ 85°      │  ← monospace, colored by severity
└──────────┘
```

Props: `label: string`, `value: string | number`, `unit?: string`, `color?: string`, `monospace?: boolean`
Style: `bg-zinc-900 rounded-lg px-3 py-2`, flex-based width (2 per row with gap)

### `active-metrics-page.tsx` — Page 1 (~100 lines)

Layout:
```
┌─────────────────────────────────┐
│  Rep    Form    Depth    Bar    │  ← top row: 4 metric cards
│   5     92%     85°     0.8s   │
├─────────────────────────────────┤
│  Hip: 78°   Knee: 142°         │  ← angle cards (from debugAngles)
│  Stance: 1.1x   Torso: 0.6    │     colored by rule ranges
├─────────────────────────────────┤
│  📷 Front   ⚠ 2 checks skipped│  ← bottom info row
└─────────────────────────────────┘
```

- Top row: 4 `MetricCard` components — Rep count, Form grade (severity color), primary depth angle, bar speed
- Middle row: 2-4 angle cards from `debugAngles` — display current values colored green/yellow/red based on rule thresholds
- Bottom row: camera angle badge + skipped checks count
- Bar speed: shows `lastConcentricMs` formatted as seconds (e.g., "0.8s") or "—" if no data

### `advanced-metrics-page.tsx` — Page 2 (~100 lines)

Layout:
```
┌─────────────────────────────────┐
│  Barbell Path                   │
│  [mini Skia chart ~~~~~~~~~~]  │
├─────────────────────────────────┤
│  All Angles:                    │
│  Knee Angle (Depth): 85°       │
│  Hip Angle: 78°                 │
│  Knee Tracking: 0.02           │
├─────────────────────────────────┤
│  Skipped: Knee Angle, Hip Angle │
│  Rep quality: ●●●●○●●●         │
└─────────────────────────────────┘
```

- Barbell mini chart (Skia Canvas) — Y-position timeline, 60 frames
- Full angle list — all values from `debugAngles`
- Skipped checks list
- Current set rep quality dots (from formSessionStore)

### `barbell-mini-chart.tsx` (~60 lines)

Skia Canvas (NOT gifted-charts — too heavy for real-time).
- Draws polyline of Y values from `barbellPath` (last 60 points)
- X axis = time (evenly spaced), Y axis = bar position (inverted — lower Y = higher bar)
- Cyan line normal, red when drifting
- Fixed height: 60px
- Reference line at starting Y position

### `setup-dashboard.tsx` (~70 lines)

Shows during setup state:
```
┌─────────────────────────────────┐
│  Squat — Barbell                │
│  Position yourself 6-8ft away   │
│  ✓ Shoulders  ✓ Hips           │
│  ✓ Knees     ○ Ankles          │
│  ████████░░░░ 75%               │
└─────────────────────────────────┘
```

- Exercise name + equipment
- Setup instructions from `formRules.setupInstructions`
- Joint checklist with check/circle icons (reuses data from `jointChecklist`)
- Progress bar

### `rest-dashboard.tsx` (~70 lines)

Shows during rest state:
```
┌─────────────────────────────────┐
│  Set 2 Complete — 8 reps        │
│  ●●●●○●●● rep quality dots      │
│  Avg depth: 87°                 │
│  Start moving to resume          │
└─────────────────────────────────┘
```

- Set number + rep count
- Rep quality dots (severity colors)
- Average angle from set's formSamples
- "Start moving to resume" prompt

---

## Phase 3: Bar Speed — Rep Counter Extension

### `utils/rep-counter.ts` (modify)

Add timestamp tracking to phase transitions:
- Record `bottomTimestamp` when phase → `bottom`
- Record `topTimestamp` when phase → `resting` (rep counted)
- `lastConcentricMs = topTimestamp - bottomTimestamp`
- New method: `getLastConcentricMs(): number | null`
- Return `lastConcentricMs` alongside `counted` in `addFrame` result

### `hooks/use-form-coach-orchestrator.ts` (modify)

- Add `lastConcentricMs` state: updated when `repCounterRef.current.getLastConcentricMs()` changes after a counted rep
- Expose `setNumber` from `formSessionStore.getSession()?.sets.length ?? 0`
- Remove `__DEV__` guard on `debugAngles` — dashboard needs angles in production
- Expose all new data in return object

---

## Phase 4: Landscape Support

### Portrait (height > width)
```
┌──────────────────┐
│                  │
│  CAMERA (flex:3) │
│                  │
│                  │
├──────────────────┤  ← border-t lime-400/10
│ DASHBOARD (flex:1)│
└──────────────────┘
```
- `flexDirection: 'column'`
- Dashboard pages scroll horizontally

### Landscape (width > height)
```
┌──────────────┬────────┐
│              │        │
│ CAMERA       │ DASH   │  ← border-l lime-400/10
│ (flex:3)     │(flex:1)│
│              │        │
└──────────────┴────────┘
```
- `flexDirection: 'row'`
- Dashboard becomes a narrow sidebar — pages scroll vertically
- Metric cards stack vertically (1 per row instead of 2)

`form-dashboard.tsx` accepts `isLandscape` and adjusts internal layout.

---

## Phase 5: Camera Overlay Cleanup

Overlays that **stay in camera section** (coordinate-accurate):
- `SkeletonOverlay` — pass `cameraSize` instead of `layoutSize`
- `BodyHighlightOverlay` — same
- `BarbellPathOverlay` — same
- `SetupOverlay` — stays centered in camera (but joint checklist data ALSO shows in dashboard)
- `BodyNotDetectedOverlay` — stays centered in camera
- `CameraAngleToast` — top of camera section
- `UnreliableCheckNote` — top of camera section

Camera section controls (absolute positioned):
- `CameraFlipButton` — top-left, relative to camera section insets
- `TtsMuteButton` — next to flip button
- Close (X) button — top-right of camera section

**Removed from camera section entirely**:
- `FormFeedbackOverlay` (pills) → severity shown in dashboard MetricCard
- `RepCounterDisplay` → rep count in dashboard MetricCard
- `AngleDebugOverlay` → angles in dashboard page 1 + page 2
- `CoachingBubble` → coaching in dashboard header
- `SetSummaryCard` → rest dashboard
- Exercise selector pill → dashboard header

---

## Phase 6: Voice Coaching Fix

The current TTS has multiple failure points that result in silence during workouts.

### Root Causes

1. **`speakIssue` only fires when issues exist** — if form is good (no issues), nothing is spoken. No positive reinforcement, no periodic check-ins.
2. **`speakMessage` (coaching) and `speakIssue` both call `Speech.stop()` first** — when they fire within ms of each other, one cancels the other mid-utterance.
3. **Coaching interval (3s) < speakMessage throttle (5s)** — every other coaching message gets swallowed by the throttle. Effective coaching speech rate: ~1 per 6s.
4. **No rep-boundary voice** — after a rep is counted, no "Good rep" or "Depth was shallow" announcement.

### Fixes

#### `hooks/use-tts-feedback.ts` (modify)

- Add **global** `lastSpokeAt` ref alongside per-severity refs. All speak functions check global throttle (2s minimum between ANY utterances) to prevent `Speech.stop()` cancellation.
- Add `speakRepFeedback(severity: FormSeverity)` — short rep-boundary messages:
  - `good` → "Good" (spoken only every 3rd good rep to avoid spam)
  - `warning` → "Watch form"
  - `error` → "Fix that"
- Reduce coaching message throttle: use **global** lastSpokeAt instead of per-severity. If nothing has spoken in 4s, coaching gets to speak.

#### `hooks/use-form-coach-orchestrator.ts` (modify)

- After `formSessionStore.recordRep(issues)`, call `speakRepFeedback(worstSeverity)` to give rep-boundary voice feedback.
- Guard: only call `speakIssue` if the issue severity is **worse** than what was spoken in the last 3s (avoids repeating the same warning every 66ms frame).

#### `hooks/use-form-coaching.ts` (modify)

- Increase `COACHING_INTERVAL_MS` from `3000` to `8000` — coaching messages should be less frequent but always audible (not fighting with issue speech).
- On the coaching effect that calls `speakMessage`: check if `Speech.isSpeakingAsync()` before calling `Speech.stop()` + speak. If already speaking an issue, skip this coaching cycle.

### Voice Coaching Flow (after fix)

```
Frame loop (15fps):
  → issues found? speakIssue(worst) — throttled per-severity + global 2s
  → no issues? silence (coaching will fill the gap)

Rep counted:
  → speakRepFeedback(severity) — "Good" / "Watch form" / "Fix that"

Every 8s:
  → coaching message generated
  → if nothing spoken in last 4s → speakMessage("Keep your chest up")
  → if something spoken recently → skip, wait for next cycle
```

### Files Modified

| File | Changes |
|------|---------|
| `hooks/use-tts-feedback.ts` | Global throttle, speakRepFeedback, Speech.isSpeakingAsync guard |
| `hooks/use-form-coach-orchestrator.ts` | Wire speakRepFeedback after recordRep |
| `hooks/use-form-coaching.ts` | Increase interval to 8s |

---

## Files to Create

| File | Lines (est.) | Phase |
|------|-------------|-------|
| `hooks/use-camera-layout.ts` | ~30 | 1 |
| `components/form-coach/dashboard/form-dashboard.tsx` | ~120 | 2 |
| `components/form-coach/dashboard/dashboard-header.tsx` | ~60 | 2 |
| `components/form-coach/dashboard/metric-card.tsx` | ~40 | 2 |
| `components/form-coach/dashboard/active-metrics-page.tsx` | ~100 | 2 |
| `components/form-coach/dashboard/advanced-metrics-page.tsx` | ~100 | 2 |
| `components/form-coach/dashboard/barbell-mini-chart.tsx` | ~60 | 2 |
| `components/form-coach/dashboard/setup-dashboard.tsx` | ~70 | 2 |
| `components/form-coach/dashboard/rest-dashboard.tsx` | ~70 | 2 |
| `components/form-coach/dashboard/page-indicator.tsx` | ~30 | 2 |

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `app/(protected)/form-coach.tsx` | 1, 5 | Split layout, relocate overlays, wire dashboard |
| `hooks/use-form-coach-orchestrator.ts` | 3, 6 | Expose setNumber, lastConcentricMs, remove __DEV__ guard, wire speakRepFeedback |
| `utils/rep-counter.ts` | 3 | Add phase timestamps + getLastConcentricMs() |
| `hooks/use-tts-feedback.ts` | 6 | Global throttle, speakRepFeedback, Speech.isSpeakingAsync guard |
| `hooks/use-form-coaching.ts` | 6 | Increase interval to 8s |

## Existing Code to Reuse

- `@shopify/react-native-skia` Canvas + Line/Path — for `barbell-mini-chart.tsx` (same pattern as `barbell-path-overlay.tsx`)
- `formSessionStore` — `getSession()`, `getLastFinishedSet()` for rest dashboard data
- `SEVERITY_COLORS` pattern from `form-feedback-overlay.tsx` — reuse in metric cards
- Reanimated `FadeIn`/`FadeOut` — for coaching message transitions in header
- NativeWind classes: `bg-zinc-900 rounded-lg`, `font-inter-bold`, `text-lime-400` etc.
- `expo-screen-orientation` already imported in form-coach.tsx

---

## Verification

1. `npx tsc --noEmit` — must pass
2. `npx expo lint` — must pass
3. **Portrait test**: Camera takes top 3/4, dashboard bottom 1/4. All metrics update in real-time. Swipe between page 1 and page 2.
4. **Landscape test**: Rotate phone — camera left, dashboard sidebar right. Metrics stack vertically.
5. **Setup state**: Dashboard shows exercise info + joint checklist + progress bar
6. **Active state**: Dashboard page 1 shows reps, form grade, angles, bar speed. Page 2 shows barbell chart, all angles, skipped checks.
7. **Rest state**: Dashboard shows set summary with rep dots + avg metrics
8. **Bar speed**: Do a squat rep, check "Bar" metric shows concentric time in seconds
9. **Exercise selector**: Tap exercise name in dashboard header → sheet opens
10. **Coaching**: Coaching messages appear in dashboard header right side
11. **Voice test (unmuted)**: Start squatting with front camera. Should hear: issue warnings every ~3-5s when form is bad, "Good" after good reps, coaching tips every ~8s during quiet periods. No overlapping/cancelled speech.
12. **Voice test (muted)**: Tap mute → all speech stops immediately. Unmute → speech resumes.
