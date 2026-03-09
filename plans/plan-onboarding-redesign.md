# Implementation Plan: Onboarding Redesign

**Source PRD:** `docs/prd-onboarding-redesign.md`
**Date:** 2026-03-09

## Overview

Replace 2-screen onboarding with 9-screen one-thing-per-screen flow. Extend `UserProfile` type + API mappers for 9 new fields. Build 3 new reusable components (SelectionCard, ChipGrid, NumberSelector) + shared OnboardingScreen shell. Reuse existing ProgressBar, Button, BackButton, FormInput, SegmentedControl, DateOfBirthPicker. Delete old `demographics.tsx` and `goal.tsx`, replace with 9 new screen files.

## Technical Decisions

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Component location | `components/ui/` vs `components/onboarding/` | `components/onboarding/` | New components are onboarding-specific (SelectionCard, ChipGrid, NumberSelector). Keep `ui/` for truly generic primitives. |
| Shared screen wrapper | Prop-based wrapper vs no wrapper | Wrapper component `OnboardingScreen` | All 9 screens share: ScrollView, title, subtitle, CTA area, back button, skip button. Wrapper eliminates ~40 lines of boilerplate per screen. |
| Focus areas toggle | Runtime toggle vs build-time flag | Constants file flag (`FOCUS_AREA_DESIGN`) | Simple `if` in component. Both designs built as separate components, swapped by flag. |
| Fitness goal values | Keep existing 5 values vs add new ones | Add `get_stronger` + `flexibility_mobility`, keep `athletic_performance` | PRD specifies 6 options. Keep old value for safety until backend confirms removal. |
| Save/complete logic | Last screen handles save vs dedicated hook | Extract `useCompleteOnboarding` hook | Current `goal.tsx` has save+complete logic. Extracting to hook keeps last screen clean and logic reusable. |
| Screen file naming | kebab-case vs camelCase | kebab-case (`training-style.tsx`) | Matches PRD spec. Expo Router maps filenames to route segments. |

---

## Phase 1: Data Layer + Types (scope: S)

Foundation work. No UI changes yet — app still works with old screens.

### Step 1.1: Extend UserProfile type + constants

- **What:** Add new type unions, array types, and constants to `types/profile.ts`. Add new fitness goal values.
- **Where:** `types/profile.ts`
- **Changes:**
  - Add types: `ExperienceLevel`, `ActivityLevel`, `Equipment`, `TrainingStyle`, `FocusArea`, `InjuryTag`
  - Add constants: `EXPERIENCE_LEVELS`, `ACTIVITY_LEVELS`, `EQUIPMENT_OPTIONS`, `TRAINING_STYLES`, `FOCUS_AREAS`, `INJURY_TAGS`, `SESSION_DURATIONS`, `TRAINING_FREQUENCIES`
  - Extend `UserProfile` interface with 9 new optional fields
  - Add `get_stronger` and `flexibility_mobility` to `FitnessGoal` union + `FITNESS_GOALS` array
- **Acceptance:** Types compile. No runtime changes.
- **Dependencies:** None

### Step 1.2: Extend API mappers

- **What:** Update `mapProfileToApi` and `mapApiProfileToMobile` to handle new fields. Extend `ApiProfilePayload` and `ApiProfileResponse` types.
- **Where:** `types/api.ts`
- **Changes:**
  - Add 9 new optional fields to `ApiProfilePayload` (camelCase, matching API contract)
  - Add 9 new fields to `ApiProfileResponse` (nullable)
  - Extend `mapProfileToApi`: add `if !== undefined` guards for each new field (direct pass-through, no unit conversion needed)
  - Extend `mapApiProfileToMobile`: map API response fields → UserProfile (direct pass-through)
- **Acceptance:** Mapper functions handle new fields. Existing fields unchanged.
- **Dependencies:** Step 1.1

### Step 1.3: Extract useCompleteOnboarding hook

- **What:** Extract save + complete logic from current `goal.tsx` into a reusable hook.
- **Where:** Create `hooks/use-complete-onboarding.ts`
- **Changes:**
  - Hook calls `useAuth()` for `saveProfile`, `completeOnboarding`, `loading`
  - Hook calls `useProfileForm()` for `getData`, `resetData`
  - Exposes `complete(extraFields?)` — merges extra fields, calls getData, saveProfile, completeOnboarding, resetData, returns result
  - Exposes `loading` state
- **Acceptance:** Hook compiles. Not wired to UI yet.
- **Dependencies:** Step 1.1

---

## Phase 2: New UI Components (scope: M)

Build 3 reusable components + shared screen wrapper. No screen changes yet.

### Step 2.1: SelectionCard component

- **What:** Large tappable card for single-select screens. Icon + title + optional subtitle. Selected state with border highlight + Reanimated spring scale.
- **Where:** Create `components/onboarding/selection-card.tsx`
- **Props:**
  ```
  icon: LucideIcon (from lucide-react-native)
  title: string
  subtitle?: string
  selected: boolean
  onPress: () => void
  ```
- **Styling:**
  - Unselected: `bg-background-secondary border-border-primary rounded-xl px-4 py-4`
  - Selected: `border-brand-accent bg-background-tertiary`
  - Icon: 24px, `pointerEvents="none"`, color based on selected state
  - Press animation: Reanimated `withSpring` scale 1.0 → 0.97 → 1.0
  - Border color: Reanimated `withTiming` transition (200ms)
- **Acceptance:** Renders card with icon, title, subtitle. Tap toggles visual state. Spring animation on press. Works in dark mode.
- **Dependencies:** None

### Step 2.2: ChipGrid component

- **What:** Wrap-layout multi-select chips with optional icons. Supports exclusive options (e.g., "None" deselects others).
- **Where:** Create `components/onboarding/chip-grid.tsx`
- **Props:**
  ```
  options: { value: string, label: string, icon?: LucideIcon }[]
  selected: string[]
  onToggle: (value: string) => void
  exclusive?: string[]  // values that deselect all others when tapped
  columns?: 1 | 2       // 1 = full-width chips, 2 = 2-column grid
  ```
- **Styling:**
  - Container: `flex-row flex-wrap gap-2` (1-col) or 2-column grid via calculated width
  - Chip unselected: `bg-background-secondary border-border-primary rounded-xl px-4 py-3`
  - Chip selected: `bg-brand-accent/10 border-brand-accent` + checkmark icon
  - Haptic feedback on toggle (`expo-haptics` selectionAsync)
- **Exclusive logic:** Tapping "None" or "Full Body" deselects all others. Tapping any other deselects exclusive options.
- **Acceptance:** Multi-select works. Exclusive option deselects others. 2-column mode renders grid. Haptic fires on tap.
- **Dependencies:** None

### Step 2.3: NumberSelector component

- **What:** Row of circular buttons for discrete single-select (training frequency).
- **Where:** Create `components/onboarding/number-selector.tsx`
- **Props:**
  ```
  options: number[]
  value: number | undefined
  onChange: (value: number) => void
  ```
- **Styling:**
  - Container: `flex-row justify-between gap-3`
  - Button: `w-14 h-14 rounded-full items-center justify-center`
  - Unselected: `bg-background-secondary border-border-primary`
  - Selected: `bg-brand-accent` with scale-up (Reanimated `withSpring` to 1.1)
  - Text: `text-lg font-inter-bold`, color flips on select
- **Acceptance:** Tap selects number. Selected button scales up with accent bg. Single-select only.
- **Dependencies:** None

### Step 2.4: OnboardingScreen wrapper

- **What:** Shared layout shell for all 9 screens. Handles ScrollView, title, subtitle, CTA placement, back button, skip button.
- **Where:** Create `components/onboarding/onboarding-screen.tsx`
- **Props:**
  ```
  title: string
  subtitle?: string
  onNext: () => void
  onSkip?: () => void          // if provided, shows skip ghost button
  onBack?: () => void          // if provided, shows BackButton
  nextLabel?: string           // default "Next"
  nextDisabled?: boolean       // disables Next button
  loading?: boolean            // shows spinner on Next button
  children: React.ReactNode    // screen content
  scrollable?: boolean         // default true, wraps in ScrollView
  keyboardAware?: boolean      // default false, wraps in KeyboardAwareScrollView
  ```
- **Layout:**
  ```
  <View flex-1 bg-background-primary>
    <ScrollView flex-1 contentContainerStyle={padding: 24}>
      {onBack && <BackButton />}
      <Text title />
      <Text subtitle />
      {children}
    </ScrollView>
    <View px-6 bottom CTA area>
      <Button onPress={onNext} disabled={nextDisabled} loading={loading}>{nextLabel}</Button>
      {onSkip && <Button variant="ghost" onPress={onSkip}>Skip</Button>}
    </View>
  </View>
  ```
- **Safe area:** Bottom padding via `useSafeAreaInsets()` — `Math.max(insets.bottom, 32)`
- **Acceptance:** Renders title, subtitle, children, CTA buttons. Back button conditional. Skip button conditional. Keyboard-aware mode works.
- **Dependencies:** None

---

## Phase 3: Onboarding Screens 1–5 (Required) (scope: M)

Build the 5 required screens. Wire up layout + navigation.

### Step 3.1: Update onboarding layout

- **What:** Update `_layout.tsx` to register 9 screens. Update SCREENS array. Update progress bar to show segmented 9-step progress with "Step X of 9" text.
- **Where:** Modify `app/(protected)/onboarding/_layout.tsx`
- **Changes:**
  - `SCREENS` = `['goal', 'experience', 'equipment', 'frequency', 'duration', 'training-style', 'focus-areas', 'injuries', 'about-you']`
  - Register all 9 `Stack.Screen` entries
  - Add "Step X of 9" text below progress bar
  - Keep Settings gear button
  - Initial route is now `goal` (not `demographics`)
- **Acceptance:** Layout renders with 9-segment progress bar. Step counter text shows. Navigation works.
- **Dependencies:** Phase 2

### Step 3.2: Update root navigator initial route

- **What:** Change onboarding redirect from `demographics` to `goal`.
- **Where:** Modify `app/_layout.tsx` (RootNavigator effect)
- **Changes:**
  - Change `router.replace('/(protected)/onboarding/demographics')` → `router.replace('/(protected)/onboarding/goal')`
- **Acceptance:** New users land on goal screen first.
- **Dependencies:** Step 3.1

### Step 3.3: Screen 1 — Fitness Goal

- **What:** Single-select large cards with icons. Required screen — no skip button.
- **Where:** Rewrite `app/(protected)/onboarding/goal.tsx`
- **Changes:**
  - Remove old save/complete logic (moved to last screen)
  - Use `OnboardingScreen` wrapper with title "What are you working toward?"
  - Render `SelectionCard` for each `FITNESS_GOALS` option with appropriate Lucide icons
  - `useState` for selected goal, `updateField('fitnessGoal', goal)` on Next
  - Navigate to `experience` on Next
  - No back button (first screen), no skip button (required)
  - `nextDisabled` when no selection
- **Icons mapping:** Target → lose_weight, Dumbbell → build_muscle, TrendingUp → get_stronger, Heart → improve_endurance, Activity → general_fitness, Stretch → flexibility_mobility
- **Acceptance:** 6 cards render with icons. Tap selects one (deselects others). Next disabled until selection. Navigates to experience.
- **Dependencies:** Steps 1.1, 2.1, 2.4

### Step 3.4: Screen 2 — Experience Level

- **What:** 3 large cards with title + description. Required.
- **Where:** Create `app/(protected)/onboarding/experience.tsx`
- **Content:**
  - Use `OnboardingScreen` with title "Where are you on your fitness journey?"
  - 3 `SelectionCard` components (Beginner/Intermediate/Advanced) with descriptions as subtitles
  - Icons: Sprout → beginner, Flame → intermediate, Trophy → advanced
  - `updateField('experienceLevel', level)` on Next
  - Navigate to `equipment`
  - Back button to goal screen
- **Acceptance:** 3 cards with descriptions. Selection required. Back works. Navigates to equipment.
- **Dependencies:** Steps 1.1, 2.1, 2.4

### Step 3.5: Screen 3 — Equipment

- **What:** Multi-select 2-column grid with icons + quick-select presets. Required.
- **Where:** Create `app/(protected)/onboarding/equipment.tsx`
- **Content:**
  - Use `OnboardingScreen` with title "What do you have to work with?"
  - Two preset buttons at top: "At Home" and "Full Gym" (styled as secondary Button or custom)
  - `ChipGrid` with `columns={2}` for equipment options, each with Lucide icon
  - Preset logic: "At Home" toggles `['bodyweight', 'dumbbells', 'resistance_bands']`, "Full Gym" toggles all
  - `updateField('equipment', selectedEquipment)` on Next
  - Navigate to `frequency`
  - `nextDisabled` when `selected.length === 0`
- **Icons mapping:** PersonStanding → bodyweight, Dumbbell → dumbbells, Scaling → barbell_rack, Cable → resistance_bands, Weight → kettlebells, ArrowUpFromLine → pullup_bar, RectangleHorizontal → bench, Columns3 → cable_machine, Building → full_gym
- **Acceptance:** 2-column grid renders. Multi-select works. Presets toggle correct items. At least 1 required. Navigates to frequency.
- **Dependencies:** Steps 1.1, 2.2, 2.4

### Step 3.6: Screen 4 — Training Frequency

- **What:** Circular number buttons (2-6) with split preview text below.
- **Where:** Create `app/(protected)/onboarding/frequency.tsx`
- **Content:**
  - Use `OnboardingScreen` with title "How many days per week can you train?"
  - `NumberSelector` with options `[2, 3, 4, 5, 6]`
  - Below selector: split preview text (animated fade with Reanimated `FadeIn`/`FadeOut`)
  - Split mapping: `{ 2: 'Full Body × 2', 3: 'Full Body × 3 or Push/Pull/Legs', 4: 'Upper/Lower × 2', 5: 'Push/Pull/Legs + Upper/Lower', 6: 'Push/Pull/Legs × 2' }`
  - `updateField('trainingFrequency', frequency)` on Next
  - Navigate to `duration`
- **Acceptance:** 5 circular buttons. Tap selects one. Preview text updates with animation. Required selection. Navigates to duration.
- **Dependencies:** Steps 1.1, 2.3, 2.4

### Step 3.7: Screen 5 — Session Duration

- **What:** Single-select cards with duration + subtitle. Required.
- **Where:** Create `app/(protected)/onboarding/duration.tsx`
- **Content:**
  - Use `OnboardingScreen` with title "How long can you work out?"
  - `SelectionCard` for each duration option: 15 ("Quick & efficient"), 30 ("Focused session"), 45 ("The sweet spot"), 60 ("Full program"), 90 ("Extended with warm-up & cool-down")
  - Icons: Zap → 15, Clock → 30/45/60/90 (or Timer variants)
  - `updateField('sessionDuration', duration)` on Next
  - Navigate to `training-style`
- **Acceptance:** 5 cards with subtitles. Required selection. Navigates to training-style.
- **Dependencies:** Steps 1.1, 2.1, 2.4

---

## Phase 4: Onboarding Screens 6–9 (Skippable) + Complete (scope: M)

### Step 4.1: Screen 6 — Training Style

- **What:** Multi-select chips. Skippable.
- **Where:** Create `app/(protected)/onboarding/training-style.tsx`
- **Content:**
  - Use `OnboardingScreen` with title "Any training styles you prefer?", `onSkip` navigates to `focus-areas`
  - `ChipGrid` with training style options (no icons needed — text chips)
  - `updateField('trainingStyles', selected)` on Next
  - Navigate to `focus-areas`
  - Skip label: "I'm open to anything"
- **Acceptance:** Multi-select chips. Skip works (no data saved for this field). Navigates to focus-areas.
- **Dependencies:** Steps 1.1, 2.2, 2.4

### Step 4.2: Screen 7 — Focus Areas (Design A: Chips)

- **What:** Multi-select chips with body part names. Skippable. "Full Body" is exclusive.
- **Where:** Create `app/(protected)/onboarding/focus-areas.tsx`
- **Content:**
  - Use `OnboardingScreen` with title "Any areas you want to focus on?", `onSkip` navigates to `injuries`
  - `ChipGrid` with focus area options, `exclusive={['full_body']}`
  - `updateField('focusAreas', selected)` on Next
  - Navigate to `injuries`
  - Skip label: "Full body is fine"
- **Acceptance:** Multi-select. "Full Body" deselects others (and vice versa). Skip works. Navigates to injuries.
- **Dependencies:** Steps 1.1, 2.2, 2.4

### Step 4.3: Screen 7 — Focus Areas (Design B: Body Outline)

- **What:** SVG body outline (front + back) with tappable regions.
- **Where:** Create `components/onboarding/body-outline-picker.tsx`
- **Content:**
  - SVG component with front and back body silhouettes
  - Each muscle region is a `<Path>` wrapped in `<Pressable>`
  - Tapped region fills with `brand-accent` color at low opacity
  - Maps region taps to `FocusArea` values
  - Same exclusive logic as Design A ("Full Body" vs individual)
- **Toggle:** `constants/onboarding.ts` exports `FOCUS_AREA_DESIGN: 'chips' | 'body_outline'`. `focus-areas.tsx` renders Design A or B based on flag.
- **Acceptance:** SVG renders front+back body. Regions tappable. Highlight on select. Toggle switches between designs.
- **Dependencies:** Step 4.2, SVG asset for body outline
- **Note:** Can be deferred — Design A (chips) ships first. This step is independent.

### Step 4.4: Screen 8 — Injuries & Limitations

- **What:** Multi-select chips + free-text input. Skippable. "None" is exclusive. Info tooltip.
- **Where:** Create `app/(protected)/onboarding/injuries.tsx`
- **Content:**
  - Use `OnboardingScreen` with `keyboardAware={true}`, title "Anything we should keep in mind?", `onSkip` navigates to `about-you`
  - Info icon (lucide `Info`) next to title — on press, toggle inline text: "We use this to avoid exercises that could cause pain or re-injury."
  - `ChipGrid` with injury options, `exclusive={['none']}` ("None" value not saved to API — just deselects others)
  - `Input` for free-text notes (max 200 chars)
  - `updateField('injuries', selected)` + `updateField('injuryNotes', notes)` on Next
  - Navigate to `about-you`
  - Skip label: "No limitations"
- **Acceptance:** Multi-select chips. "None" deselects all. Free-text input. Info tooltip toggle. Skip works. Navigates to about-you.
- **Dependencies:** Steps 1.1, 2.2, 2.4

### Step 4.5: Screen 9 — About You + Complete

- **What:** Demographics form (all optional) + activity level. Final screen — triggers save + complete.
- **Where:** Create `app/(protected)/onboarding/about-you.tsx`
- **Content:**
  - Use `OnboardingScreen` with `keyboardAware={true}`, title "One last thing — tell us about yourself"
  - Reuse existing form components: `FormInput` (name), `FormRadioGroup` (gender), `DateOfBirthPicker` (DOB), height/weight with `FormInput` + `FormSegmentedControl`
  - Add activity level: `RadioGroup` with 4 options (Sedentary, Lightly Active, Moderately Active, Very Active)
  - ALL fields optional — no validation required to proceed
  - `nextLabel="Complete"`, no skip button (this IS the last screen, just tap Complete with empty fields)
  - On Complete: gather all form data → `updateField()` for each filled field → call `useCompleteOnboarding` hook
  - On success: `resetData()`, navigate to `/(protected)/(tabs)`
  - On failure: Alert with error, allow retry
- **Acceptance:** All fields optional. Complete saves + marks onboarding done. Navigates to main app.
- **Dependencies:** Steps 1.1, 1.3, 2.4

### Step 4.6: Delete old screens

- **What:** Remove old demographics.tsx and verify no dead imports.
- **Where:** Delete `app/(protected)/onboarding/demographics.tsx`
- **Acceptance:** No broken imports. App compiles. Onboarding flow uses new 9-screen route.
- **Dependencies:** Steps 4.5

---

## Phase 5: Settings — Training Preferences (scope: M)

### Step 5.1: Create Training Preferences settings screen

- **What:** Single scrollable screen to view/edit all new onboarding fields. Uses same components as onboarding.
- **Where:** Create `app/(protected)/sheets/edit-training-preferences.tsx`
- **Content:**
  - Load profile via `useProfileQuery()`
  - Sections with headers: Experience, Equipment, Schedule, Training Style, Focus Areas, Injuries
  - Each section uses the same component as onboarding (SelectionCard, ChipGrid, NumberSelector)
  - Initialize local state from profile query data
  - Save button at bottom — compute diff via `computeProfileDiff()`, save only changes via `useSaveProfileMutation()`
  - Invalidate query cache on success, dismiss sheet
- **Acceptance:** All new fields viewable and editable. Saves only changed fields. Navigates back on success.
- **Dependencies:** Phase 2, Phase 4

### Step 5.2: Add Training Preferences row to Settings

- **What:** Add a new SettingsSection + SettingsRow in settings screen linking to the new sheet.
- **Where:** Modify `app/(protected)/settings.tsx`
- **Changes:**
  - Add new `SettingsSection` titled "Training Preferences" (after "Fitness Goal" section or replacing it)
  - Add `SettingsRow` label="Training Preferences" that navigates to `edit-training-preferences` sheet
  - Register sheet in `app/(protected)/_layout.tsx` (formSheet presentation)
- **Acceptance:** Settings shows Training Preferences row. Tapping opens edit sheet. Data persists after save.
- **Dependencies:** Step 5.1

---

## Phase 6: Polish + Animations (scope: S)

### Step 6.1: Micro-animations

- **What:** Add spring bounce + border color transitions to SelectionCard and ChipGrid.
- **Where:** Modify `components/onboarding/selection-card.tsx`, `components/onboarding/chip-grid.tsx`
- **Changes:**
  - SelectionCard: `useSharedValue` for scale, `withSpring` on press in/out, `useAnimatedStyle` for transform
  - SelectionCard: `useSharedValue` for border color, `withTiming(200ms)` on selected state change
  - ChipGrid: Same pattern for individual chips
- **Acceptance:** Smooth spring bounce on tap. Border color fades in/out. No jank.
- **Dependencies:** Phase 3

### Step 6.2: Split preview animation on frequency screen

- **What:** Animated text transition when changing day count.
- **Where:** Modify `app/(protected)/onboarding/frequency.tsx`
- **Changes:**
  - Wrap preview text in Reanimated `entering={FadeIn}` `exiting={FadeOut}`
  - Use `key={frequency}` to trigger re-mount animation on change
- **Acceptance:** Old text fades out, new text fades in when selection changes.
- **Dependencies:** Step 3.6

### Step 6.3: Info tooltip on injuries screen

- **What:** Expand/collapse info text next to injuries title.
- **Where:** Modify `app/(protected)/onboarding/injuries.tsx`
- **Changes:**
  - Info icon next to title, toggles boolean state
  - Expandable text below title with Reanimated layout animation
  - Text: "We use this to avoid exercises that could cause pain or re-injury."
- **Acceptance:** Info icon visible. Tap shows/hides explanation. Animated expand/collapse.
- **Dependencies:** Step 4.4

---

## Migration / Data Changes

- **Frontend only** — no database migration in this repo
- Backend team handles DB migration separately (see `docs/prd-backend-onboarding-profile-fields.md`)
- Frontend can ship before backend deploys new columns — `mapProfileToApi` only sends fields that exist. Backend ignores unknown fields (existing Zod `passthrough` or `strip` behavior depends on their schema config).
- **Assumption:** Backend `PATCH /api/profiles` will accept new fields by the time this ships. If not, new fields silently fail (existing `saveProfile` catches ApiError).

---

## Testing Strategy

- **Manual QA checklist:**
  - [ ] Fresh onboarding: navigate all 9 screens, fill all fields, complete → verify profile saved
  - [ ] Skip all skippable screens → verify 5 required fields saved, 4 skippable fields null
  - [ ] Back navigation on every screen → verify selections persist
  - [ ] Equipment presets ("At Home", "Full Gym") toggle correct items
  - [ ] Exclusive options: "None" on injuries, "Full Body" on focus areas
  - [ ] About You screen: complete with no fields filled → works
  - [ ] About You screen: complete with partial fields → only filled fields saved
  - [ ] Settings > Training Preferences: edit values → verify save works
  - [ ] Error handling: simulate API failure on complete → alert shown, retry works
  - [ ] Progress bar: accurate on all 9 screens, including back navigation
  - [ ] Animations: spring bounce, border transitions, frequency preview fade
  - [ ] Focus areas toggle: switch between chips (A) and body outline (B)

---

## Open Questions

1. **Frequency: include 7 days?** — PRD says 2-6. Deferred to user decision.
2. **Body outline SVG asset** — Need to source/create. Design B can be built after Phase 4 ships.
3. **Equipment icon mapping** — Some Lucide icons are approximate (e.g., no exact "kettlebell" icon). May need custom SVGs.
4. **`athletic_performance` fitness goal** — Keep or remove? PRD doesn't list it but old code has it. Recommend keeping for now, hiding from UI.
