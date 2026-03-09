# PRD: Training Preferences Settings & Onboarding Polish

**Author:** Team
**Date:** 2026-03-09
**Status:** Draft

## Problem Statement

Users complete a 9-screen onboarding flow collecting training preferences (goal, experience, equipment, frequency, duration, training style, focus areas, injuries, demographics). After onboarding, **none of these training-specific fields are editable** — Settings only exposes name, gender, DOB, height, weight, and fitness goal. If a user changes gyms, gets injured, adjusts their schedule, or simply made the wrong pick during onboarding, they're stuck.

Additionally, the onboarding flow is missing a **workout location** question (gym / home / both / outdoor) that nearly every competitor (Fitbod, Caliber, SWEAT, Freeletics) asks — this directly impacts which exercises and equipment recommendations are relevant.

Finally, single-select onboarding screens (Goal, Experience, Duration) require an explicit "Next" tap that adds unnecessary friction. Top-tier apps like Fitbod auto-advance after selection.

## Goals & Success Metrics

- **Editable training preferences** → 100% of onboarding fields are modifiable post-onboarding
- **Workout location captured** → New data point available for AI extraction personalization
- **Faster onboarding** → Auto-advance reduces taps on single-select screens by ~33% (3 fewer Next taps)
- **Reduced support requests** → Users can self-serve preference changes instead of re-onboarding

## Target Users

All Clip2Fit users who have completed onboarding and want to update their training profile as their fitness journey evolves — changing gyms, recovering from injury, adjusting schedule, or trying new training styles.

## User Stories

- As a user who switched from a home gym to a full gym, I want to update my equipment list so converted workouts include machine exercises.
- As a user recovering from a knee injury, I want to add "knees" to my injury tags so AI avoids leg-heavy exercises.
- As a new user, I want to tell the app I train at home so equipment suggestions match my setup.
- As a user, I want single-select screens to auto-advance so onboarding feels snappy and modern.
- As a user, I want to change my training frequency from 4 to 3 days/week so my schedule is accurate.

## Requirements

### Must Have (P0)

#### Training Preferences Screen (Settings)

- [ ] **Single scrollable screen** accessible from Settings showing all training preferences grouped by section
- [ ] Screen route: `app/(protected)/sheets/edit-training-preferences.tsx`, presented as a formSheet with detents `[0.85, 1]`
- [ ] **Sections** (in order):
  1. **Fitness Goal** — `SelectionCard` list (reuse from onboarding), single-select
  2. **Experience Level** — `SelectionCard` list (Beginner / Intermediate / Advanced), single-select
  3. **Workout Location** — `SelectionCard` list (At the Gym / At Home / Both / Outdoors), single-select
  4. **Equipment** — `ChipGrid` with 2 columns + "At Home" / "Full Gym" presets, multi-select
  5. **Schedule** — Training Frequency (`NumberSelector` 2-6) + Session Duration (`SelectionCard` list), side by side or stacked
  6. **Training Style** — `ChipGrid`, multi-select
  7. **Focus Areas** — `ChipGrid` with 2 columns, multi-select, "Full Body" exclusive
  8. **Injuries & Limitations** — `ChipGrid` with 2 columns + free-text notes, multi-select, "None" exclusive
- [ ] **Data loading**: Initialize all local state from `useProfileQuery()` data on mount
- [ ] **Save behavior**: Compute diff against original profile. Only send changed fields via `useSaveProfileMutation()`. Invalidate query cache on success. Dismiss sheet.
- [ ] **Save button** pinned at bottom with loading state. Disabled when no changes detected.
- [ ] **Error display**: Show inline error text below save button on mutation failure
- [ ] **Acceptance**: User can edit every training preference field. Changes persist after navigating away and returning.

#### Settings Row + Navigation

- [ ] **New SettingsSection** titled "Training Preferences" in `settings.tsx`, placed between "Fitness Goal" and "Account" sections
- [ ] **Single SettingsRow** labeled "Training Preferences" with chevron, navigates to `edit-training-preferences` sheet
- [ ] **Remove standalone Fitness Goal section** — goal is now editable inside Training Preferences screen. Keep the existing `edit-fitness-goal.tsx` sheet for backward compat but remove the row from Settings.
- [ ] **Register sheet** in `app/(protected)/_layout.tsx` with `sheetOptions` and `sheetAllowedDetents: [0.85, 1]`
- [ ] **Acceptance**: Settings shows "Training Preferences" row. Tapping opens the edit sheet. Current values pre-populated.

#### Workout Location — New Onboarding Screen

- [ ] **New type**: Add `WorkoutLocation = 'gym' | 'home' | 'both' | 'outdoor'` to `types/profile.ts`
- [ ] **Add to UserProfile**: `workoutLocation?: WorkoutLocation`
- [ ] **Add constant**: `WORKOUT_LOCATIONS` array with label/value pairs
- [ ] **Extend API mappers**: Add `workoutLocation` to `ApiProfilePayload`, `ApiProfileResponse`, both mapper functions
- [ ] **New screen**: `app/(protected)/onboarding/workout-location.tsx` — inserted as screen 3 (between Experience and Equipment)
  - Title: "Where do you usually train?"
  - 4 `SelectionCard` options: At the Gym (Building icon), At Home (Home icon), Both (ArrowLeftRight icon), Outdoors (Trees icon)
  - Single-select, required, auto-advance after selection (400ms delay)
  - `updateField('workoutLocation', location)` then navigate to `equipment`
  - Back button to `experience`
- [ ] **Update onboarding layout**: Insert `workout-location` into SCREENS array at index 2. Update step count to 10. Register `Stack.Screen`.
- [ ] **Update experience.tsx**: Navigate to `workout-location` instead of `equipment` on Next
- [ ] **Acceptance**: New screen renders between Experience and Equipment. Selection saved. 10-step progress bar accurate.

#### Auto-Advance on Single-Select Screens

- [ ] **Screens affected**: `goal.tsx`, `experience.tsx`, `workout-location.tsx`, `duration.tsx`
- [ ] **Behavior**: When user taps a SelectionCard, highlight it immediately, then auto-navigate to next screen after 400ms delay. Next button remains visible but is secondary — users can also tap it manually.
- [ ] **Implementation**: On selection, call `updateField(...)` immediately. Start a 400ms `setTimeout`. On timeout, call `router.push(nextScreen)`. Clear timeout on unmount (useEffect cleanup).
- [ ] **No auto-advance on multi-select screens**: equipment, training-style, focus-areas, injuries, about-you
- [ ] **Acceptance**: Tapping a card on Goal/Experience/Location/Duration auto-advances to next screen. Feels responsive (400ms). Back navigation returns to previous screen with selection preserved.

### Should Have (P1)

- [ ] **Section headers** in training preferences sheet with subtle divider lines between groups
- [ ] **Display format helpers** in `utils/format-profile.ts`: `displayExperience()`, `displayEquipment()`, `displayFrequency()`, `displayDuration()`, `displayLocation()` for potential future use in Settings summary rows
- [ ] **Activity Level** editable in Training Preferences screen (currently only on About You onboarding screen, not editable in Settings)

### Nice to Have (P2)

- [ ] **Preview summary row** in Settings showing key preferences inline (e.g., "Intermediate | Full Gym | 4x/week | 45 min")
- [ ] **Haptic feedback** on save success (`Haptics.notificationAsync(NotificationFeedbackType.Success)`)
- [ ] **Staggered entering animations** on sections when training preferences sheet opens

## Out of Scope

- Body outline (Design B) for focus areas — deferred as per original plan
- Apple Health / Google Fit sync for auto-filling demographics
- Notification permission request during onboarding
- Drag-and-drop priority ranking for goals (SWEAT pattern)
- Assessment week / progressive calibration
- Backend migration for new fields (separate PRD: `docs/prd-backend-onboarding-profile-fields.md`)

## Technical Considerations

### Data Model Changes

New type + field in `types/profile.ts`:
```
WorkoutLocation = 'gym' | 'home' | 'both' | 'outdoor'
UserProfile.workoutLocation?: WorkoutLocation
```

Extend `ApiProfilePayload` and `ApiProfileResponse` in `types/api.ts` with `workoutLocation` field. Update both mapper functions.

### Component Reuse

All onboarding components are already generic and reusable:
- `SelectionCard` — works with any icon + title + subtitle
- `ChipGrid` — configurable columns, exclusive options, multi-select
- `NumberSelector` — any numeric range
- `OnboardingScreen` — NOT reused for settings (it has nav-specific props). Settings screen uses its own layout.

### Auto-Advance Pattern

```typescript
const autoAdvanceRef = useRef<ReturnType<typeof setTimeout>>()

const handleSelect = (value: T) => {
  setValue(value)
  updateField(fieldName, value)
  clearTimeout(autoAdvanceRef.current)
  autoAdvanceRef.current = setTimeout(() => {
    router.push(nextRoute)
  }, 400)
}

useEffect(() => () => clearTimeout(autoAdvanceRef.current), [])
```

### Sheet Registration

Add to `app/(protected)/_layout.tsx`:
```tsx
<Stack.Screen
  name="sheets/edit-training-preferences"
  options={{ ...sheetOptions, sheetAllowedDetents: [0.85, 1] }}
/>
```

### Onboarding Layout Update

SCREENS array becomes 10 items:
```
['goal', 'experience', 'workout-location', 'equipment', 'frequency', 'duration', 'training-style', 'focus-areas', 'injuries', 'about-you']
```

## Dependencies

- **Backend**: Must accept `workoutLocation` field in `PATCH /api/profiles`. If not yet deployed, field silently fails (existing error handling catches `ApiError`).
- **Backend PRD**: `docs/prd-backend-onboarding-profile-fields.md` must include `workout_location` column.

## Open Questions

1. **Should we show current values as subtitle text on the Settings "Training Preferences" row?** E.g., "Intermediate | Full Gym | 4x/week". Adds context but increases complexity.
2. **Outdoor location — what equipment options make sense?** Currently equipment screen doesn't adapt based on location. Should selecting "Outdoors" pre-select "Bodyweight" and "Resistance Bands"?
3. **Auto-advance accessibility** — should we disable auto-advance if the user has enabled "Reduce Motion" in system settings? Check `AccessibilityInfo.isReduceMotionEnabled`.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Backend doesn't accept `workoutLocation` yet | Medium | Low | Field silently fails. No crash. Saved when backend deploys. |
| Auto-advance feels too fast/slow | Low | Medium | 400ms is tested by Fitbod/SWEAT. Can tune. Reduce Motion check as P1. |
| 10 onboarding screens increase drop-off | Low | Medium | 5 required + 5 skippable. Auto-advance speeds up required screens. Monitor analytics per screen. |
| Training Preferences sheet too tall for small phones | Low | Low | Sheet uses 0.85 detent + scrollable content. Tested on SE-size screens. |
