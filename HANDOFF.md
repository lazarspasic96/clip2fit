# Handoff: Home Screen Rebuild + Tab Navigation Restructure

## Goal

Implement the full home screen UI with 3 states (empty, active workout, rest day) plus restructured tab navigation with a center FAB button, matching the Figma designs. The plan is at `plans/new-features-plan.md` — it has 5 phases.

**Figma reference:** `https://www.figma.com/design/7stx1ZxsN8FC8NBMTyGyGE/Untitled`
- Empty state: node `0:7117`
- Active state: node `0:8300`
- Rest day state: node `0:8541`

## Current Progress

### Phase 1: Tab Navigation Restructure — DONE

- **Renamed** `library.tsx` → `history.tsx` (content preserved, just name change)
- **Moved** `settings.tsx` from tabs → `app/(protected)/settings.tsx` (modal with X close button)
- **Created** `components/ui/custom-tab-bar.tsx` — 2 tabs (My Workouts + History) with center green FAB
- **Created** `constants/layout.ts` — `TAB_BAR_HEIGHT = 88`
- **Created** `app/(protected)/add-workout.tsx` — stub modal (placeholder for Phase 5)
- **Updated** `app/(protected)/_layout.tsx` — added `settings` + `add-workout` as modal Stack screens (`presentation: 'modal'`, `animation: 'slide_from_bottom'`)
- **Updated** `app/(protected)/(tabs)/_layout.tsx` — uses `CustomTabBar`, only 2 tab screens
- **Deleted** old `library.tsx` and `settings.tsx` from tabs

### Phase 2: Home Screen Components — DONE

All in `components/home/`:

| Component | File | Description |
|-----------|------|-------------|
| `HomeHeader` | `home-header.tsx` | Avatar (image or initials fallback) + "Hi, Name! 👋" + gear → settings modal |
| `TodaysWorkoutCard` | `todays-workout-card.tsx` | Active state: thumbnail, platform icon, creator handle, Start/Edit/Rest buttons, stats (duration/exercises/calories) |
| `EmptyWorkoutCard` | `empty-workout-card.tsx` | Green + icon, "Add/Import workout!" → navigates to add-workout modal |
| `RestDayCard` | `rest-day-card.tsx` | Rest message, image, Edit button, hydration tip |
| `WeeklyTrainingPlan` | `weekly-training-plan.tsx` | 7-day row: date, colored dots, workout labels, today = green highlight |
| `CurrentStreakCard` | `current-streak-card.tsx` | 🔥 + streak text |
| `ImportFromSocialsCard` | `import-from-socials-card.tsx` | SVG social icons (TikTok, Instagram, YouTube, X) + Premium badge |
| `BottomActionButtons` | `bottom-action-buttons.tsx` | Two side-by-side cards: "From video" + "Manual" |

### Phase 3: Home Screen Assembly — DONE

- **Rewrote** `app/(protected)/(tabs)/index.tsx` — ScrollView with all components, state-driven
- **Created** `utils/mock-data.ts` — types (`HomeScreenState`, `MockWorkout`, `WeekDay`) + 3 mock presets (empty/active/rest)
- State controlled by `CURRENT_STATE` const on line 16 of `index.tsx` — change to `'active'` or `'rest'` to preview

### Phase 4: Settings Screen Migration — DONE (completed as part of Phase 1)

### Phase 5: Add Workout Screen — NOT STARTED

Full implementation per the plan. Currently just a stub placeholder.

## What Worked

- **Custom tab bar** via `tabBar` prop on `<Tabs>` — clean pattern, full control over layout
- **Semi-transparent View** instead of BlurView — `expo-blur` needs a native rebuild (dev client), so we used `rgba(9, 9, 11, 0.85)` as fallback. Swap to `BlurView` after next rebuild.
- **Mock data presets** — single `CURRENT_STATE` const switches all UI, easy to test all 3 states
- **SVG social icons** via `react-native-svg` inline `<Path>` — no asset files needed
- **Gap prop on ScrollView `contentContainerStyle`** — clean spacing between cards without margin hacks

## What Didn't Work / Watch Out For

- **`expo-blur` BlurView** — Installed via `npx expo install expo-blur` but the current dev build doesn't have the native module. Shows red error: "Unimplemented component `<ViewManagerAdapter_ExpoBlurView>`". Using a semi-transparent `View` as workaround. After next `eas build` or `npx expo prebuild`, can switch back to `BlurView`.
- **Linter/formatter hook** — Reformats files on every read/write. The `Edit` tool can fail with "File has been modified since read". Workarounds: use `Write` for full file rewrites, or `sed -i` via Bash for targeted changes. Re-read immediately before each edit.
- **Typed Routes** — Transient TS errors for new routes until Metro restarts and regenerates types.

## Key Files Reference

| File | Purpose |
|------|---------|
| `plans/new-features-plan.md` | Full implementation plan (source of truth) |
| `constants/layout.ts` | `TAB_BAR_HEIGHT` constant |
| `constants/colors.ts` | Color tokens for style props |
| `utils/mock-data.ts` | Mock data types + 3 state presets |
| `components/ui/custom-tab-bar.tsx` | Custom blur tab bar + FAB |
| `components/home/*.tsx` | All home screen card components |
| `app/(protected)/(tabs)/index.tsx` | Home screen (change `CURRENT_STATE` on L16 to test states) |
| `app/(protected)/settings.tsx` | Settings modal screen |
| `app/(protected)/add-workout.tsx` | Add workout modal (stub) |
| `contexts/auth-context.tsx` | Auth: user, session, signOut, onboardingComplete, saveProfile |

## Current Route Structure

```
app/
  _layout.tsx                  # Root: auth + onboarding state machine
  (auth)/
    _layout.tsx
    welcome.tsx
    login.tsx
    signup.tsx
    check-email.tsx
  (protected)/
    _layout.tsx                # Stack: tabs + onboarding + settings modal + add-workout modal
    (tabs)/
      _layout.tsx              # Custom tab bar: My Workouts | + FAB | History
      index.tsx                # Home screen (empty/active/rest states)
      history.tsx              # History placeholder (was library.tsx)
    onboarding/
      _layout.tsx
      demographics.tsx
      goal.tsx
    settings.tsx               # Modal (moved from tabs)
    add-workout.tsx            # Modal (stub)
```

## Next Steps

1. **Phase 5: Add Workout Screen** — Full implementation of `app/(protected)/add-workout.tsx`:
   - Two option cards: "From Video" (opens camera roll via `expo-image-picker`, video media type) + "Manual Entry" (console.log stub)
   - After video pick: show static thumbnail + green "Process" button (stubbed)
   - No title/description fields — AI auto-generates from video
   - `expo-image-picker` should already be in Expo SDK 54, but verify it's installed
2. **Visual polish** — Compare each component against Figma screenshots, adjust spacing/sizing
3. **BlurView swap** — After next dev client rebuild, replace semi-transparent View in `custom-tab-bar.tsx` with `BlurView` from `expo-blur`
4. **Lint** — `npm run lint` passes clean as of this handoff
