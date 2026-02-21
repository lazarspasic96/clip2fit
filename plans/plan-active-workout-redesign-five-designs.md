# Plan: Active Workout Session Redesign (5 Designs + Dev Toggle)

## Skills Used
- `frontend-design`: to ensure five visually distinct, intentional UI directions (not small visual variations).
- `building-native-ui`: to keep Expo/React Native implementation native-feeling, performant, and maintainable.

## Product Goal
Redesign the active workout session screen so users can:
- See the current exercise clearly.
- Move to next/previous exercise.
- Log sets, reps, and weight quickly.
- Track full-workout progress (not only current exercise).
- Return and edit an exercise/set when needed.
- Learn proper exercise execution from catalog content (start/end images, description/instructions, optional primary muscles, and video when available).

## Hard Requirements
- Build **5 unique designs** and allow toggling between them via a **temporary top switcher**.
- One design must be the **current existing design** with an added **floating pill/CTA** at the bottom that opens a **bottom sheet** with exercise media/info/video.
- Use `expo-image` for exercise media and Expo-native components/patterns.

## Current State (Codebase)
- Route: `app/(protected)/(tabs)/(home)/active-workout.tsx`
- Entry container: `components/workout/active-workout-content.tsx`
- Current active design host: `components/workout/design-switcher.tsx`
- Current design: `components/workout/designs/design-b-pulse/pulse-dashboard.tsx`
- Existing catalog info sheet components are already present but not wired into active workout flow:
  - `components/workout/shared/exercise-info-bar.tsx`
  - `components/workout/shared/exercise-info-sheet.tsx`
  - `components/workout/shared/use-exercise-catalog.ts`

## Data & Fetching Architecture (Shared for all 5 Designs)

### 1) Workout exercise -> catalog detail lookup
- Source key: `WorkoutExercise.catalogExerciseId`.
- For active exercise, fetch catalog detail via existing `useCatalogDetail` path.
- Add a small orchestrator hook to reduce loading flashes when switching exercises:
  - Proposed: `components/workout/shared/use-workout-exercise-insights.ts`
  - Responsibilities:
    - Return active exercise catalog detail.
    - Prefetch adjacent exercises (previous/next) using query client.
    - Expose normalized shape for UI (`images`, `instructions`, `primaryMuscleGroups`, `videoUrl`).

### 2) Video source strategy
- Current catalog type does not expose a dedicated `videoUrl` field.
- Plan:
  - Use `exercise.sourceVideoUrl` when available.
  - If catalog API later adds media URL, wire it in this hook without touching design components.
  - Bottom sheet/video section gracefully hides when no playable URL exists.

### 3) Optional muscle display
- Keep primary muscles behind a shared flag in design props (quickly toggle on/off while evaluating concepts).

## Shared Interaction Contract (All Designs)
- Header actions: Back, Finish/Save.
- Exercise navigation: previous/next controls + direct index tap via segmented progress.
- Set logging: reps/weight input + check action.
- Edit behavior: completed sets remain editable from the same exercise screen.
- Workout progress: exercise-level and set-level progress visible at all times.
- Exercise education access: one-tap path to instructions/media for current exercise.

## Design Concepts (5 Unique Variants)

## Design 1: Pulse Baseline + Coach Pill (Required Existing Variant)
Keep existing `PulseDashboard` structure, add a persistent floating CTA at bottom:
- Floating pill content: start image thumbnail + exercise name + "How to" label.
- Tap opens bottom sheet with:
  - start/end image pager (`expo-image`),
  - instructions/description,
  - optional primary muscles chips,
  - video action/player section (if URL available).
- Why this design: minimum behavioral risk, quickest production-ready evolution.

## Design 2: Command Center Pro
Dense but clean training console:
- Top: workout progress and timer.
- Middle: active exercise with quick nav arrows.
- Main panel: editable set table + previous performance in one glance.
- Right/secondary card area (mobile stacked): compact "How to perform" card with image + short cues.
- Why this design: ideal for users who optimize performance and want maximum control.

## Design 3: Swipe Coach Cards
Card-first, learning-first flow:
- Active exercise appears as a hero card with start/end image swipe.
- Under hero: set logger card (reps/weight/check).
- Horizontal swipe between exercises with clear index and progress markers.
- Why this design: highly visual, intuitive for users who follow form guidance while training.

## Design 4: Route Timeline
Journey metaphor for full workout:
- Vertical timeline of all exercises with status markers (done/current/upcoming).
- Expanded current exercise node contains full set logger.
- Exercise info opens as a snap-point bottom sheet from each node.
- Why this design: strongest whole-workout awareness and easy jump-back editing.

## Design 5: Focus Mode + Queue Dock
Minimal active focus with contextual queue:
- Center focus: only current set + next action.
- Bottom dock: upcoming exercises queue, tappable to jump.
- "Learn" button opens media drawer/sheet with start/end images + cues.
- Why this design: reduces cognitive load and keeps interaction speed high.

## Temporary Top Design Switcher (Dev-Only)
- Location: top of active workout screen below safe area.
- UI: horizontally scrollable pill segmented control with five labels:
  - `Baseline`
  - `Command`
  - `Coach Cards`
  - `Timeline`
  - `Focus`
- Behavior:
  - Local state in `components/workout/design-switcher.tsx`.
  - Default selected: `Baseline` (existing behavior first).
  - Visible only in development if desired (`__DEV__` guard optional).

## Implementation Plan

### Phase 1: Shared foundation
- Add orchestrator hook for catalog data + prefetching.
- Add shared "exercise education" sheet props contract.
- Ensure set editing works when revisiting exercises (including completed rows).

### Phase 2: Baseline redesign (Design 1)
- Keep current Pulse UI.
- Add floating coach pill + open bottom sheet with media/instructions/video.
- Validate no regressions in finish flow.

### Phase 3: Build remaining 4 design components
- New folder proposal:
  - `components/workout/designs/design-a-baseline/`
  - `components/workout/designs/design-c-command/`
  - `components/workout/designs/design-d-coach-cards/`
  - `components/workout/designs/design-e-timeline/`
  - `components/workout/designs/design-f-focus/`
- Each design consumes the same shared hooks and actions from `useActiveWorkout`.

### Phase 4: Wire top switcher
- Expand `components/workout/design-switcher.tsx` to render five design tabs.
- Keep finish/save and PR celebration logic centralized.

### Phase 5: UX polish pass
- Spacing/padding audit (safe area, thumb reach, keyboard behavior).
- Visual hierarchy pass (font sizes, contrast, button prominence).
- Motion pass (small intentional transitions only).

### Phase 6: Evaluation and finalization
- Dogfood with real workout sessions.
- Pick winner.
- Remove temporary switcher + non-selected designs.

## Acceptance Criteria
- User can complete an entire workout in each design.
- Next/previous navigation always works and preserves state.
- Set logging and editing work after navigating away and back.
- Whole-workout progress is always visible.
- Current exercise instruction media loads reliably with graceful fallbacks.
- Baseline design includes floating pill + bottom sheet with required information.

## QA Checklist
- Start workout from home card -> lands in active workout.
- Toggle each design at top; no crash or state reset.
- Log sets/reps/weight in all designs.
- Navigate next/previous and return to prior exercise to edit.
- Open exercise info sheet for multiple exercises quickly (check loading/flicker).
- Complete workout and verify finish/save behavior.
- Verify layout on small and large devices.

## Risks
- Catalog media/video incompleteness (must degrade gracefully).
- Over-animated designs can hurt responsiveness; prioritize smooth logging interactions.
- Divergence between designs if shared state contract is not enforced.

## Out of Scope (for this redesign pass)
- New backend schema for catalog video fields.
- AI form-checking/camera guidance.
- Reworking workout generation pipeline.
