# PRD: Onboarding Redesign — Personalized Workout Data Collection

**Author:** Team
**Date:** 2026-03-09
**Status:** Draft

## Problem Statement

Current onboarding is 2 screens (demographics + fitness goal) — insufficient data for GPT to generate personalized workouts. A personal trainer asks 10+ intake questions before programming. We need the same depth: goal, experience, equipment, schedule, preferences, and limitations. Without this, AI-generated plans will be generic and low-value.

## Goals & Success Metrics

- **Collect enough data for quality GPT workout generation** → All 5 required screens completed by 90%+ of users who start onboarding
- **Keep completion rate high despite more screens** → <20% drop-off from screen 1 to final screen
- **One-thing-per-screen UX** → Average <8 seconds per screen (tap-and-go, not form-filling)
- **Data completeness** → 70%+ of users fill at least 1 skippable screen

## Target Users

New Clip2Fit users signing up for the first time. No existing user migration needed (app not published yet). Fitness level ranges from complete beginner to advanced gym-goer.

## User Stories

- As a new user, I want to tell the app my fitness goal so it builds workouts that match what I'm working toward.
- As a beginner, I want to specify my experience level so I don't get advanced exercises I can't perform.
- As a home gym user, I want to list my equipment so the app doesn't suggest machines I don't have.
- As someone with a bad knee, I want to flag injuries so the app avoids exercises that could hurt me.
- As a busy professional, I want to set my available time and days so workouts fit my schedule.
- As a user who completed onboarding, I want to edit my training preferences from Settings without redoing onboarding.

## Requirements

### Must Have (P0)

#### Screen Flow (9 screens, one-thing-per-screen)

- [ ] **Screen 1 — Fitness Goal** (REQUIRED)
  - Single-select large tappable cards with icons
  - Options: Lose Weight, Build Muscle, Get Stronger, Improve Endurance, General Fitness, Flexibility & Mobility
  - Copy: "What are you working toward?"
  - AC: User must select one option before proceeding. Selection persists if user goes back.

- [ ] **Screen 2 — Experience Level** (REQUIRED)
  - Single-select, 3 large cards with title + description
  - Options:
    - Beginner: "New to working out, or returning after a long break"
    - Intermediate: "Train regularly, comfortable with most exercises"
    - Advanced: "Years of consistent training, looking to optimize"
  - Copy: "Where are you on your fitness journey?"
  - AC: User must select one option. Selection persists on back navigation.

- [ ] **Screen 3 — Equipment** (REQUIRED)
  - Multi-select tiles in 2-column grid with icons + text
  - Options: Bodyweight Only, Dumbbells, Barbell & Rack, Resistance Bands, Kettlebells, Pull-up Bar, Bench, Cable Machine, Full Gym
  - Quick-select presets at top: "At Home" (auto-selects bodyweight + dumbbells + bands), "Full Gym" (selects all)
  - Copy: "What do you have to work with?"
  - AC: At least 1 equipment item selected. Presets toggle their associated items. Individual items can be toggled after preset selection.

- [ ] **Screen 4 — Training Frequency** (REQUIRED)
  - Row of circular number buttons: 2, 3, 4, 5, 6
  - Below selection, show split preview text:
    - 2 days → "Full Body × 2"
    - 3 days → "Full Body × 3 or Push/Pull/Legs"
    - 4 days → "Upper/Lower × 2"
    - 5 days → "Push/Pull/Legs + Upper/Lower"
    - 6 days → "Push/Pull/Legs × 2"
  - Copy: "How many days per week can you train?"
  - AC: User must select a number. Split preview updates on selection with animated text transition.

- [ ] **Screen 5 — Session Duration** (REQUIRED)
  - Single-select cards
  - Options with subtitles:
    - 15–20 min → "Quick & efficient"
    - 30 min → "Focused session"
    - 45 min → "The sweet spot"
    - 60 min → "Full program"
    - 90+ min → "Extended training with warm-up & cool-down"
  - Copy: "How long can you work out?"
  - AC: User must select one duration.

- [ ] **Screen 6 — Training Style** (SKIPPABLE)
  - Multi-select chips
  - Options: Strength Training, HIIT / Circuit, Bodybuilding, Calisthenics, Yoga / Mobility, CrossFit-style, Mixed
  - Skip button: "I'm open to anything" (ghost button below CTA)
  - Copy: "Any training styles you prefer?"
  - AC: User can select 0+ styles. Skip proceeds with no styles selected.

- [ ] **Screen 7 — Focus Areas** (SKIPPABLE)
  - Two implementations with internal dev toggle to compare:
    - **Design A**: Multi-select chips with body part names + muscle icons
    - **Design B**: SVG body outline (front + back) with tappable highlighted regions
  - Options: Chest, Back, Shoulders, Arms, Core / Abs, Glutes, Legs, Full Body
  - Skip button: "Full body is fine"
  - Copy: "Any areas you want to focus on?"
  - AC: Both designs functional. Toggle between them via dev config flag. "Full Body" deselects individual regions; selecting individual region deselects "Full Body".

- [ ] **Screen 8 — Injuries & Limitations** (SKIPPABLE)
  - Multi-select chips + optional free-text field
  - Chips: Bad Knees, Lower Back Issues, Shoulder Problems, Wrist/Hand Issues, Hip Problems, Neck Issues, None
  - Free-text: "Anything else we should know?" (max 200 chars)
  - "Why we ask" info tooltip: "We use this to avoid exercises that could cause pain or re-injury."
  - Skip button: "No limitations"
  - Copy: "Anything we should keep in mind?"
  - AC: "None" deselects all chips. Selecting a chip deselects "None". Free-text is optional. Info tooltip opens as a small inline expandable or bottom sheet.

- [ ] **Screen 9 — About You** (SKIPPABLE)
  - Fields: Name, Gender (segmented control), Date of Birth (native picker), Height (with unit toggle), Weight (with unit toggle), Activity Level (single-select: Sedentary, Lightly Active, Moderately Active, Very Active)
  - ALL fields optional — user can skip entire screen
  - Copy: "One last thing — tell us about yourself"
  - AC: All fields are optional. Empty fields are not sent to the API. Validation still applies if a field IS filled (e.g., DOB must be 13-120 age range, height/weight must be positive).

#### Navigation & Layout

- [ ] **Progress bar** — Segmented (9 segments), animated fill on step change
  - AC: Shows "Step X of 9" text below bar. Bar reflects current screen position accurately.

- [ ] **Back navigation** — BackButton on every screen except screen 1
  - AC: Going back preserves all selections made on previous screens (stored in ProfileFormProvider ref).

- [ ] **Skip on skippable screens** — Ghost button below primary CTA
  - AC: Skip advances to next screen without storing data for that screen's field.

- [ ] **Stack navigation** — Expo Router Stack with `slide_from_right` animation
  - AC: Smooth transitions. No flash of previous screen content.

#### Data Storage

- [ ] **Extend UserProfile type** with new fields:
  ```
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
  equipment: Equipment[]  (multi-select array)
  trainingFrequency: number  (2-6)
  sessionDuration: number  (in minutes: 15, 30, 45, 60, 90)
  trainingStyles: TrainingStyle[]  (multi-select array)
  focusAreas: FocusArea[]  (multi-select array)
  injuries: InjuryTag[]  (multi-select array)
  injuryNotes: string  (free-text, max 200 chars)
  ```
  AC: All new fields are optional (nullable). Types are string literal unions. Arrays stored as PostgreSQL TEXT[] on backend.

- [ ] **Batch save on completion** — Single `PATCH /api/profiles` with all accumulated data
  - AC: Uses existing ProfileFormProvider ref pattern. One API call at the end. On failure, show error alert and allow retry.

- [ ] **Update mapProfileToApi** to handle new array and string fields
  - AC: New fields mapped with same `if !== undefined` guard pattern as existing fields. No unit conversions needed for new fields (unlike height/weight).

- [ ] **completeOnboarding** remains unchanged — sets `user_metadata.onboardingComplete = true`
  - AC: Called after successful profile save. Same flow as current implementation.

#### New UI Components

- [ ] **SelectionCard** — Large tappable card for single-select screens
  - Icon (left or top), title, optional subtitle
  - Selected state: border highlight + subtle scale animation (Reanimated spring)
  - AC: Supports icon prop (Lucide icon component), title, subtitle. Selected state clearly distinguishable. Press animation: scale 1.0 → 0.97 → 1.0.

- [ ] **ChipGrid** — Wrap-layout multi-select chips
  - Chip with optional icon, label, selected/unselected states
  - AC: Wraps to next line. Chips show checkmark on select. Supports `maxSelect` prop for exclusive options (like "None" or "Full Body").

- [ ] **NumberSelector** — Row of circular buttons for discrete number selection
  - Circular buttons with number, selected state scales up + accent color
  - AC: Single-select. Selected button visually distinct (accent bg, scale). Unselected buttons dimmed.

### Should Have (P1)

- [ ] **Settings: Training Preferences screen** — Single screen in Settings to edit all new onboarding fields (equipment, frequency, duration, style, focus areas, injuries, experience, activity level)
  - AC: Loads current profile via `useProfileQuery()`. Saves only changed fields via diff. Uses same UI components as onboarding (ChipGrid, SelectionCard, NumberSelector). Grouped into sections with headers.

- [ ] **Motivational copy** — Engaging, conversational question copy on each screen (not clinical)
  - AC: Each screen uses the copy specified above ("What are you working toward?" not "Select your fitness goal").

- [ ] **Micro-animations on selection** — Spring bounce on card tap, border color transition
  - AC: Reanimated `withSpring` for scale. `withTiming` for border/background color. 200-300ms duration. No jank on low-end devices.

### Nice to Have (P2)

- [ ] **Equipment icons** — Custom or library icons for each equipment type (dumbbell, barbell, band, etc.)
  - AC: Lucide or custom SVG icons. Consistent style, ~24px. Fallback to text-only if icon not available.

- [ ] **"Why we ask" tooltip** on injuries screen — Info icon that expands inline explanation
  - AC: Small (i) icon next to screen title. On tap, shows 1-line explanation. Dismissible.

- [ ] **Split preview animation** on frequency screen — Text transition when changing day count
  - AC: Fade-out old text, fade-in new text. Reanimated `FadeIn`/`FadeOut` layout animation.

## Out of Scope

- **GPT workout generation** — Separate feature. This PRD covers data collection only.
- **Workout generation loading screen post-onboarding** — Generation is on-demand, not auto-triggered.
- **Existing user migration** — App not published. No backward compatibility needed.
- **Nutrition, sleep, or lifestyle questions** — Out of scope for workout generation.
- **Body fat %, BMI calculation** — Not needed for workout programming.
- **Share extension onboarding** — Not part of this flow.
- **Backend API changes** — Assumes `PATCH /api/profiles` already accepts new fields (backend adds columns separately).

## Technical Considerations

### Frontend Architecture

- **File structure**: `app/(protected)/onboarding/` — one file per screen (9 files + `_layout.tsx`)
- **Naming**: `goal.tsx`, `experience.tsx`, `equipment.tsx`, `frequency.tsx`, `duration.tsx`, `training-style.tsx`, `focus-areas.tsx`, `injuries.tsx`, `about-you.tsx`
- **ProfileFormProvider**: Extend to handle array fields. `updateField` already accepts generic values — no changes needed to the context itself, just the `UserProfile` type.
- **New components**: `components/onboarding/selection-card.tsx`, `components/onboarding/chip-grid.tsx`, `components/onboarding/number-selector.tsx`
- **Shared shell**: Consider a shared `OnboardingScreen` wrapper component for consistent padding, title, subtitle, CTA placement.

### Data Model

- New fields on `profiles` table (all nullable):
  - `experience_level TEXT`
  - `activity_level TEXT`
  - `equipment TEXT[]`
  - `training_frequency INT`
  - `session_duration INT`
  - `training_styles TEXT[]`
  - `focus_areas TEXT[]`
  - `injuries TEXT[]`
  - `injury_notes TEXT`
- PostgreSQL arrays for multi-select fields (small bounded arrays, always read/written as unit — no junction tables needed).

### API Contract

- `PATCH /api/profiles` body extends with new fields (snake_case on API, camelCase on client)
- `mapProfileToApi` mapper updated with camelCase → snake_case conversions for new fields
- No new endpoints needed.

### Navigation

- Stack navigator with 9 screens registered in `onboarding/_layout.tsx`
- `SCREENS` array updated: `['goal', 'experience', 'equipment', 'frequency', 'duration', 'training-style', 'focus-areas', 'injuries', 'about-you']`
- Progress bar uses `SCREENS.indexOf(currentScreen) + 1` / `SCREENS.length`

### Focus Areas Toggle (Design A vs B)

- Dev-only config flag (e.g., `FOCUS_AREA_DESIGN: 'chips' | 'body_outline'` in a constants file)
- Both designs built as separate components, swapped via flag
- Not a user-facing toggle — internal decision tool only

## Dependencies

- **Backend**: `profiles` table needs 9 new nullable columns added. Non-destructive migration.
- **Icons**: Equipment icons needed (Lucide covers most: `Dumbbell`, `Swords` for barbell, etc. — may need custom for some).
- **Body outline SVG** (if Design B for focus areas): Need front + back body silhouette SVG asset with tappable region paths.

## Open Questions

1. **Frequency screen — include 7 days?** Currently 2-6. Some users train daily. Should we support 7?
2. **Equipment — "Full Gym" preset**: Does this literally select ALL items, or a curated subset?
3. **Duration — is 15-20 min one option or two?** Current spec merges them.
4. **Focus Areas body outline**: Do we source/create the SVG ourselves, or use a library? Any existing RN body picker libraries?
5. **Backend column naming**: Confirm `training_frequency` vs `days_per_week`, `session_duration` vs `workout_duration_minutes`.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| 9 screens causes high drop-off | Medium | High | 5 required + 4 skippable. Engaging questions first, boring demographics last. Monitor analytics on each screen. |
| Body outline SVG (Design B) takes too long | Medium | Low | Design A (chips) is the fallback. Ship chips first, iterate on body outline. |
| Profile data insufficient for quality GPT output | Low | High | Tier 1 data (goal, experience, equipment, frequency, duration) covers 80% of what GPT needs. Test prompts early with sample data. |
| Array fields complicate API contract | Low | Low | PostgreSQL TEXT[] is straightforward. mapProfileToApi handles serialization. |
