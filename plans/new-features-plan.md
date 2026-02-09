# Home Screen Rebuild + Tab Navigation Restructure

## Context

The app has auth, onboarding, and placeholder tab screens. The Figma designs show a rich home screen with 3 states (empty, active workout, rest day) and a restructured tab bar (My Workouts / center FAB / History). Currently the home screen is a static placeholder with no real content. This plan builds the core home screen UI with mock data, matching the Figma designs exactly.

**Figma reference:** `https://www.figma.com/design/7stx1ZxsN8FC8NBMTyGyGE/Untitled`
- HP start (empty): node `0:7117`
- HP active: node `0:8300`
- HP rest day: node `0:8541`

---

## Decisions Log

| Topic | Decision |
|-------|----------|
| FAB tap behavior | Navigates to unified Add Workout screen (no bottom sheet) |
| Dot colors (weekly plan) | Hardcode Figma colors, no semantic muscle-group mapping |
| Settings navigation | Modal presentation (slides up, X to close) |
| Dev state toggle | None — change default in code manually |
| Start button | Stub (console.log) — active workout screen is a later feature |
| Edit button | Stub (console.log) — semantics TBD |
| Rest button | Stub (console.log) — no state switching |
| Import from video | Camera roll picker (expo-image-picker), NOT URL paste |
| Import manually | Console.log stub only |
| Tab bar style | Translucent blur via expo-blur, absolute positioned over content |
| Avatar source | Pull `avatar_url` from Supabase auth metadata, fallback to initials circle |
| Video preview | Static thumbnail (no video player / expo-video) |
| Add Workout screen | Modal at `app/(protected)/add-workout.tsx`, two options: From Video + Manual Entry |
| Add form fields | Video only — no title/description input. AI auto-generates from video content |
| Post-pick flow | Show video thumbnail + "Process" button. Processing itself is stubbed |
| Rest day tips | Single hardcoded tip string |
| History tab | Keep current content, just rename `library.tsx` → `history.tsx` |
| Header subtitle copy | Generic placeholders, refine later |
| Home screen state logic | Weekly-plan-driven: empty = no workouts ever, active = today has workout, rest = today is rest in plan |
| Streak logic | Mock values only. Empty state = motivational text. Real logic TBD |
| Social platform icons | TikTok, Instagram, YouTube, X (Twitter). Drop LinkedIn |
| Premium badge | Visual label only, not interactive |
| Import from Socials icons | Decorative only, not individually tappable |
| Weekly plan "View" link | Console.log stub — destination TBD (needs brainstorm) |

---

## Phase 1: Tab Navigation Restructure

### 1A. Rename & reorganize tab files

| Current | New | Figma label |
|---------|-----|-------------|
| `index.tsx` (Home) | `index.tsx` (My Workouts) | My Workouts |
| `library.tsx` (Library) | `history.tsx` (History) | History |
| `settings.tsx` | **Remove from tabs** | Settings gear in header |

**Files to modify:**
- `app/(protected)/(tabs)/_layout.tsx` — restructure tabs, add center FAB, update icons
- `app/(protected)/(tabs)/library.tsx` → rename to `history.tsx` (keep content as-is)
- `app/(protected)/(tabs)/settings.tsx` → move to `app/(protected)/settings.tsx` (modal screen)

### 1B. Custom tab bar with center FAB

Create `components/ui/custom-tab-bar.tsx`:
- 3 tab slots: My Workouts (left) | + FAB (center) | History (right)
- Center button: green circle `+` icon, slightly elevated above bar
- Use `BottomTabBarProps` from `@react-navigation/bottom-tabs`
- **Translucent blur background** via `BlurView` from `expo-blur`
- **Absolutely positioned** over scroll content
- FAB navigates to `/(protected)/add-workout` (modal)

Icons from lucide-react-native:
- My Workouts: `Dumbbell` or custom icon matching Figma
- History: `CalendarDays` or `History`
- Center: `Plus` in green circle

### 1C. Tab bar scroll integration

All tab screens using ScrollView must add `contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}` to account for the absolute-positioned tab bar overlapping content.

Define `TAB_BAR_HEIGHT` constant in `constants/layout.ts` (or similar).

---

## Phase 2: Home Screen Components

All new components go in `components/home/`. Each is a self-contained card.

### 2A. `home-header.tsx`
- Avatar: pull `avatar_url` from `useAuth().user.user_metadata`, render with `Image` from `expo-image`. Fallback: colored circle with user initials
- "Hi, {name}!" + wave emoji. Get `displayName` from `useAuth().user.user_metadata.fullName`
- Settings gear icon (top-right) → navigates to settings screen (modal)
- Subtitle text (generic placeholders):
  - **empty**: "Let's get started!"
  - **active**: "You have a workout today"
  - **rest**: "Enjoy your rest day"

### 2B. `todays-workout-card.tsx` (active state)
- Dark card (`bg-background-secondary`) with rounded corners
- Left side: title, description, platform icon + @handle
- Right side: workout thumbnail image (`Image` from `expo-image`)
- Button row:
  - **Start** (green filled) → `console.log('Start workout')` (stub)
  - **Edit** (ghost) → `console.log('Edit workout')` (stub)
  - **Rest** (ghost) → `console.log('Mark as rest')` (stub)
- Stats row: clock icon + duration, chain icon + exercise count, flame icon + calories
- Props: `workout: MockWorkout`

### 2C. `empty-workout-card.tsx` (empty state)
- Green `+` circle icon on left
- "Add/Import workout!" title
- "Import or add training from your phone or social." subtitle
- Pressable → navigates to `/(protected)/add-workout` (modal)

### 2D. `rest-day-card.tsx` (rest day state)
- "It's time for rest." title + "No workout for today!" subtitle
- Rest image on right side (placeholder image from `expo-image`)
- "Edit" button → `console.log('Edit rest day')` (stub)
- Tip section: info icon + single hardcoded hydration tip text

### 2E. `weekly-training-plan.tsx`
- Header: "Weekly Training Plan" + "View" link with calendar icon → `console.log('View weekly plan')` (stub — destination TBD)
- 7-day row (M T W T F S S) with day numbers
- Active day: green bg highlight
- Each day shows: dot indicators (colors hardcoded from Figma) + workout label
- Empty state: `+` icon per day (no workouts assigned)
- Props: `days: WeekDay[]`, `activeIndex: number`

### 2F. `current-streak-card.tsx`
- Fire emoji/icon + "Current Streak" title
- Active message: "8 weeks in a row. Great job!!!" (mock)
- Empty message: "Start your first workout to build a streak!" (motivational)
- Dark card bg

### 2G. `import-from-socials-card.tsx`
- "Import workout directly from" title
- "Socials" text + platform icons row: **TikTok, Instagram, YouTube, X (Twitter)**
- Icons are **decorative only** — not individually tappable
- "Only with [Premium] AI enhanced!" subtitle with green badge — **visual label only**, not interactive
- Green `+` circle on left

### 2H. `bottom-action-buttons.tsx`
- Two side-by-side cards
- Left: video icon + "Import workout from video" → navigates to `/(protected)/add-workout` (modal, pre-selects video option)
- Right: download icon + "Import workout manually" → `console.log('Import manually')` (stub)
- Both are pressable

---

## Phase 3: Home Screen Assembly

### 3A. Mock data layer

Create `utils/mock-data.ts`:
```ts
type HomeScreenState = 'empty' | 'active' | 'rest'

type MockWorkout = {
  id: string
  title: string
  description: string
  platform: 'tiktok' | 'instagram' | 'youtube'
  creatorHandle: string
  thumbnailUrl: string
  duration: string
  exerciseCount: number
  calories: number
}

type WeekDay = {
  label: string // M, T, W...
  date: number // 15, 16, 17...
  workoutLabel?: string // Pull, Push, Full...
  isRest: boolean
  isToday: boolean
  dotColors: string[] // hardcoded from Figma
}
```

Provide 3 mock presets: empty user, active workout day, rest day.

**State semantics** (for when real data is wired):
- **empty**: user has no workouts ever created
- **active**: today has a workout assigned in the weekly plan
- **rest**: today is marked as a rest day in the weekly plan

### 3B. Rebuild `app/(protected)/(tabs)/index.tsx`

- ScrollView with all home components stacked vertically
- `contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}` for absolute tab bar
- Switch content based on `HomeScreenState`:
  - **empty**: HomeHeader → EmptyWorkoutCard → WeeklyTrainingPlan (empty) → CurrentStreakCard (motivational empty) → ImportFromSocialsCard → BottomActionButtons
  - **active**: HomeHeader → TodaysWorkoutCard → WeeklyTrainingPlan (filled) → CurrentStreakCard (streak data) → ImportFromSocialsCard → BottomActionButtons
  - **rest**: HomeHeader → RestDayCard → WeeklyTrainingPlan (filled, rest day active) → CurrentStreakCard → ImportFromSocialsCard → BottomActionButtons
- Default state: `'empty'`. Change manually in code to test other states.

---

## Phase 4: Settings Screen Migration

- Move to `app/(protected)/settings.tsx` — same content as current tab version
- **Modal presentation** (slides up, X/close button to dismiss)
- Update `app/(protected)/_layout.tsx` to include settings as a modal screen in the Stack
- Accessed via gear icon in HomeHeader

---

## Phase 5: Add Workout Screen

Create `app/(protected)/add-workout.tsx`:
- **Modal presentation** (slides up)
- Two options displayed as large cards:
  1. **"From Video"** — tapping opens camera roll via `expo-image-picker` (video media type)
  2. **"Manual Entry"** — tapping calls `console.log('Manual entry')` (stub)
- After video pick: show **static thumbnail** of selected video + green "Process" button
- No title/description input fields — AI will auto-generate from video content
- "Process" button → stub (loading state → "Processing complete" toast or similar)
- No actual backend/upload wiring in this phase

**Dependencies:**
- `expo-image-picker` (should already be available in Expo SDK 54)

---

## File Summary

### New files
- `components/home/home-header.tsx`
- `components/home/todays-workout-card.tsx`
- `components/home/empty-workout-card.tsx`
- `components/home/rest-day-card.tsx`
- `components/home/weekly-training-plan.tsx`
- `components/home/current-streak-card.tsx`
- `components/home/import-from-socials-card.tsx`
- `components/home/bottom-action-buttons.tsx`
- `components/ui/custom-tab-bar.tsx`
- `utils/mock-data.ts`
- `constants/layout.ts` (TAB_BAR_HEIGHT and similar layout constants)
- `app/(protected)/add-workout.tsx`

### Modified files
- `app/(protected)/(tabs)/_layout.tsx` — new tab config + custom blur tab bar
- `app/(protected)/(tabs)/index.tsx` — complete rewrite with state-driven home screen
- `app/(protected)/(tabs)/library.tsx` → rename to `history.tsx` (content unchanged)
- `app/(protected)/(tabs)/settings.tsx` → move to `app/(protected)/settings.tsx` (modal)
- `app/(protected)/_layout.tsx` — add settings + add-workout as modal screens in Stack

### Deleted files
- `app/(protected)/(tabs)/settings.tsx` (moved)
- `app/(protected)/(tabs)/library.tsx` (renamed)

---

## Verification

1. `npm run lint` — no new lint errors
2. `npm start` — Metro starts without errors
3. Navigate through all tab screens (My Workouts, History)
4. Home screen shows empty state by default
5. Manually change state in code to verify active/rest states render correctly
6. Settings gear in header opens settings as modal (slides up)
7. Center FAB navigates to Add Workout modal
8. Add Workout screen: "From Video" opens camera roll picker, shows thumbnail after pick
9. All cards render with correct styling matching Figma
10. Tab bar has blur effect, content scrolls behind it
11. Avatar shows user image from auth or initials fallback
12. Test on iOS simulator for safe area + tab bar spacing
