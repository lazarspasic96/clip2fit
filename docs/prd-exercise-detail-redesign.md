# PRD: Exercise Detail Screen Redesign

**Author:** Team
**Date:** 2026-03-09
**Status:** Draft

## Problem Statement

The exercise detail screen (`app/(protected)/exercise-detail.tsx`) has several visual and consistency issues that degrade the user experience:

1. **Bad chip styling** — Short muscle labels like "waist" render with cramped padding, making chips look broken.
2. **Inconsistent text colors** — Some sections use inline `Colors.content.secondary` style props while others use NativeWind classes. Mixed approaches across the same screen.
3. **No design token adherence** — Hardcoded color values instead of using the global Tailwind config tokens (`text-content-primary`, `bg-background-secondary`, etc.).
4. **Flat, static layout** — No scroll animations, no parallax, no visual hierarchy. A plain 300px static image followed by uniform text sections.
5. **No engagement hooks** — No favorite/bookmark capability. No way to save exercises for later reference outside of workouts.

This screen is a core part of the exercise discovery flow (Catalog → Detail → Add to Workout) and needs to feel polished and modern.

## Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Improve visual quality to match top fitness apps | User feedback / internal design review approval |
| Consistent design token usage across the screen | Zero hardcoded hex values in all detail components |
| Smooth 60fps scroll-linked animations | No frame drops on iPhone 12+ and modern Android devices |
| Enable exercise favoriting | Favorite button renders and toggles state |
| Explore 3 design directions before committing | 3 working designs with dev toggle, clean removal of rejected designs |

## Target Users

**Primary:** Fitness enthusiasts who use Clip2Fit to convert workout videos into structured plans. They browse the exercise catalog to learn proper form, understand target muscles, and add exercises to their workout.

**Context:** Users arrive at this screen from the exercise catalog (search/filter → tap exercise card). They need to quickly scan exercise details, understand the movement, and decide whether to add it to their workout.

## User Stories

- As a user, I want to see a visually engaging exercise detail page so that browsing exercises feels premium and trustworthy.
- As a user, I want smooth parallax/scroll animations so the app feels responsive and polished.
- As a user, I want to favorite an exercise so I can save it for later without adding it to a workout.
- As a user, I want to see all exercise attributes (muscle groups, equipment, difficulty, etc.) in a clear visual hierarchy so I can quickly understand the exercise.
- As a user, I want chip labels (even short ones like "waist") to display cleanly without visual glitches.
- As a user, I want consistent text styling across the screen so it doesn't look like different parts were designed separately.

## Requirements

### Must Have (P0)

- [ ] **3 distinct design variants** with a developer-facing toggle switch to preview all three
  - Acceptance: All 3 designs render without crashes; toggle switches between them instantly
- [ ] **Design 1: Airbnb-inspired** — Full-width hero image with parallax scroll, content overlay with rounded corners, hairline section dividers, icon+label info rows, sticky bottom CTA
  - Acceptance: Hero image has 0.5x parallax translateY; overscroll zooms image; animated header fades in at scroll threshold; content overlaps image with rounded-t-3xl
- [ ] **Design 2: Atlas (fitness card stack)** — Image in rounded card, stacked info cards with staggered entrance animations, 2-column stat grid
  - Acceptance: Cards enter with staggered FadeInDown animation (80ms delay between cards); stat grid renders in 2 columns
- [ ] **Design 3: Clinical (minimalist editorial)** — Centered smaller image, label-value attribute table, timeline-style instructions, generous whitespace
  - Acceptance: Image centered at max 280px width; attribute table has aligned label:value rows with hairline separators
- [ ] **Consistent design token usage** — All text colors, backgrounds, and borders use NativeWind classes or `Colors` constant. Zero hardcoded hex values.
  - Acceptance: `grep -r '#[0-9a-fA-F]\{6\}' components/catalog/detail-designs/` returns zero matches (excluding imports from constants)
- [ ] **Fix chip styling** — Short labels like "waist" display with proper minimum width and padding
  - Acceptance: Chips have min-w-[48px] and increased padding; visually verified on "waist", "push", "pull" labels
- [ ] **Sticky bottom CTA bar** — Shared "Add to Workout" / "Remove from Workout" button with BlurView across all designs
  - Acceptance: Button toggles between primary/secondary variant; blur effect visible; safe area insets applied
- [ ] **Back navigation** — Works in all designs via BackButton component
  - Acceptance: `router.back()` or fallback to tabs; button always visible above hero image

### Should Have (P1)

- [ ] **Favorite button** — Heart icon in the header area (like Airbnb's heart icon) that toggles favorite state
  - Acceptance: Heart icon renders in top-right area; toggles filled/unfilled on press; state persists during session (local state is fine for now, backend integration later)
- [ ] **All non-null attributes shown** — Info rows/cards/table rows rendered for every attribute that has a value; null attributes hidden
  - Acceptance: Exercise with `force: null` does not show a force row; exercise with all attributes shows all rows
- [ ] **Related exercises section** — Reuse existing `ExerciseRelatedList` horizontal scroll in all 3 designs
  - Acceptance: Related exercises render at bottom of all designs; navigation to related exercise works
- [ ] **Animated header (Airbnb design)** — Blur header with exercise name fades in as user scrolls past the hero image
  - Acceptance: Header is invisible at scroll=0; fully visible when hero image is scrolled away

### Nice to Have (P2)

- [ ] **Haptic feedback** on favorite toggle (light impact)
- [ ] **Skeleton loading state** — Custom skeleton matching each design's layout (not just a centered spinner)
- [ ] **GIF play/pause** — Tap image to pause/resume GIF animation

## Out of Scope

- **Backend favorite API** — Favorite state will be local-only for now; backend persistence is a separate ticket
- **Image carousel** — Keeping single GIF/image; no swipeable multi-image support
- **Share functionality** — No share button or deep linking in this iteration
- **Shared element transitions** — Screen-to-screen hero image transitions (catalog card → detail) are a future enhancement
- **Exercise comparison** — Side-by-side exercise comparison view
- **Custom exercise editing** — Editing exercise details from the detail screen

## Technical Considerations

### Architecture
- Each design is a self-contained folder under `components/catalog/detail-designs/{design-name}/`
- Shared props interface: `ExerciseDetailDesignProps { exercise, selected, onToggle, onBack }`
- Screen file (`exercise-detail.tsx`) acts as a thin host: data fetching + design switching
- Shared sub-components reused across all designs: `ExerciseMuscleGroups`, `ExerciseInstructions`, `ExerciseRelatedList`

### Animations (Reanimated)
- **Airbnb design**: `useAnimatedScrollHandler` + `Animated.ScrollView` for parallax. First usage of scroll-linked animations in the codebase.
  - `interpolate(scrollY, [0, 340], [0, 170])` for 0.5x parallax
  - `interpolate(scrollY, [-100, 0], [1.3, 1])` for overscroll zoom
  - `interpolate(scrollY, [260, 340], [0, 1])` for header fade
- **Atlas design**: `FadeInDown.delay(index * 80).springify()` layout entering animations
- **Clinical design**: No animations — strength is typography and whitespace

### Data Model
No changes. Uses existing `CatalogExerciseDetail` type:
```typescript
{ id, name, aliases, bodyPart, target, secondaryMuscles,
  equipment, category, difficulty, force, mechanic,
  gifUrl, thumbnailUrl, instructions, description }
```

### Token System
All colors via:
- NativeWind classes: `text-content-primary`, `bg-background-secondary`, `border-border-primary`
- `Colors` constant (for style props / Reanimated / icons): `Colors.content.primary`, `Colors.brand.accent`
- Muscle colors via `MuscleChip` component (soft/solid/ghost tones)

### Post-Selection Cleanup
After user selects a design:
1. Delete 2 unused design folders
2. Delete switcher component and design type
3. Move winning design to `components/catalog/`, rename files (strip design prefix)
4. Delete old orphaned files (`exercise-detail-content.tsx`, `exercise-image-pager.tsx`)
5. Verify zero dead code, zero unused imports

## Dependencies

- `react-native-reanimated` — Already installed; needed for `useAnimatedScrollHandler`, `Animated.ScrollView`, `interpolate`
- `expo-blur` — Already installed; needed for `BlurView` sticky bottom bar and animated header
- `expo-image` — Already installed; used for GIF/thumbnail rendering
- `lucide-react-native` — Already installed; icons for info rows (Layers, Dumbbell, Signal, ArrowUpDown, Link, Heart)
- No new package installs required

## Open Questions

1. **Favorite persistence** — Should favorite state use AsyncStorage for cross-session persistence, or purely in-memory until backend API is built?
2. **Favorite count** — Should there be a "Favorites" tab/section in the library to view saved exercises?
3. **Design toggle mechanism** — Should the toggle be a floating pill row or a bottom sheet selector? (Recommendation: floating pill row, simpler)

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| GIF performance inside parallax container on Android | Medium | Use `thumbnailUrl` during active scroll, switch to GIF when scroll ends |
| `Animated.ScrollView` conflicts with NativeWind `className` | Low | Use `style` prop for animated properties, `className` for static ones |
| 3 designs bloat the bundle temporarily | Low | Cleanup phase removes 2 designs; tree-shaking handles the rest |
| Scope creep into backend favorite API | Medium | PRD explicitly scopes favorite as local-only; backend is separate ticket |
