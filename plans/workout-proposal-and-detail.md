# Workout Proposal, Save, and Detail Flow

## Context

After URL conversion, the app shows a static read-only preview (workout-preview.tsx) with a mock "Save to Library" Alert. Users need to:
1. **Review & edit** the AI-extracted workout before saving (AI isn't perfect)
2. **Save** to their library with edits applied
3. **View** saved workout details from My Workouts
4. **Start** a workout from real data (currently uses MOCK_WORKOUT_PLAN)
5. **Edit** a saved workout from the detail screen

This plan covers: TanStack Query migration → proposal modal → save → library → detail → edit → start workout.

---

## Interview Decisions

| Topic | Decision |
|-------|----------|
| Edited values → active workout | Edits become the new target values (ghost placeholders in active workout) |
| Exercise renumbering on delete | Immediate renumber (1,2,3...) |
| Reps input format | Freeform text ('8-10', '12', 'AMRAP', 'to failure') |
| Repeat workout button | Always "Start Workout" — no history awareness for v1 |
| Discard behavior | Keep original AI workout in DB. Discard only closes proposal. |
| Discard copy | "Discard edits? The original workout will still be in your library." |
| Exercise name editing | Read-only for v1. Editable in v2. |
| Muscle group pills | Read-only (AI's best guess, no editing) |
| Delete exercise UX | Tap trash → row slides left revealing red "Delete" button → second tap confirms |
| Post-delete (detail screen) | `router.back()` + refetch on focus (useFocusEffect / TQ refetchOnWindowFocus) |
| Add exercises in proposal | No — edit/delete only for v1 |
| Post-save navigation | `router.replace` to My Workouts tab. Clean break. |
| Source video (detail screen) | Header area, prominent button near creator attribution |
| targetReps type | Change to `string \| null` everywhere (supports '8-10', 'AMRAP') |
| Edit from detail | Standalone `edit-workout` screen (reuses proposal components, independent route) |
| Edit data source | Fetch fresh from API via useQuery (not route params) |
| Post-edit navigation | `router.back()` to detail (TQ cache invalidation refreshes data) |
| Detail exercise styling | Cards with dividers (distinct cards with spacing) |
| Component reuse | Separate components — ProposalExerciseRow and DetailExerciseRow are independent |
| Detail header layout | ← back left, ✏️ edit + 🗑️ delete icons on right |
| Save failure handling | Keep local edits intact. Error shown below save button. User can retry. |
| Duplicate URL conversion | No indication. Treat as fresh. User can delete duplicates. |
| Detail description | Truncate 2 lines + "Read more" to expand |
| Target muscle pills | Decorative only (no tap handler) |
| Active workout inputs | Ghost placeholders (empty input, target as grayed placeholder text) |
| Processing → proposal transition | Hard swap (no animation) |
| Rest field in proposal | Read-only display (not editable) |
| Entry animations in proposal | Mount only (no scroll-triggered animations) |
| **Data fetching** | **Full migration to TanStack Query** |
| TQ migration scope | All existing hooks (useWorkouts, useWorkout, useSaveProfile, etc.) |
| TQ cache strategy | Invalidate + refetch after mutations |
| TQ provider scope | Root layout (wraps entire app) |
| TQ fetch layer | Reuse existing apiGet/apiPatch/apiDelete wrappers |
| TQ query keys | Centralized in `constants/query-keys.ts` |
| TQ migration order | Separate Phase 0 before any UI work |
| Active workout data source | Own `useQuery(['workout', id])` — cache hit from detail screen |
| Proposal initial data | Cache conversion result in TQ so proposal reads via useQuery |

---

## Phase 0: TanStack Query Migration

### Install

```bash
npx expo install @tanstack/react-query
```

### New files

**`constants/query-keys.ts`**
```typescript
export const queryKeys = {
  workouts: {
    all: ['workouts'] as const,
    detail: (id: string) => ['workouts', id] as const,
  },
  profile: {
    current: ['profile'] as const,
  },
} as const
```

**`contexts/query-client.tsx`**
- Create `QueryClient` with defaults: `staleTime: 5 * 60 * 1000`, `retry: 1`
- Export `QueryClientProvider` wrapper component

### Modified files

**`app/_layout.tsx`**
- Wrap app with `QueryClientProvider` (outermost, above auth and other providers)

**`hooks/use-api.ts`** — Full rewrite to TanStack Query
- Keep existing `apiGet`, `apiPost`, `apiPatch`, `apiDelete` wrappers (auth headers, base URL)
- Replace all custom hooks:

| Old Hook | New Hook | Type |
|----------|----------|------|
| `useWorkouts()` | `useWorkoutsQuery()` | `useQuery` with `queryKeys.workouts.all` |
| `useWorkout(id)` | `useWorkoutQuery(id)` | `useQuery` with `queryKeys.workouts.detail(id)` |
| `useSaveProfile()` | `useSaveProfileMutation()` | `useMutation`, invalidates `queryKeys.profile.current` |
| `useConvertUrl()` | `useConvertUrlMutation()` | `useMutation`, on success: populate workout cache via `queryClient.setQueryData` |
| — (new) | `useUpdateWorkoutMutation()` | `useMutation` for PATCH, invalidates `queryKeys.workouts.all` + `queryKeys.workouts.detail(id)` |
| — (new) | `useDeleteWorkoutMutation()` | `useMutation` for DELETE, invalidates `queryKeys.workouts.all` |

- `useWorkoutQuery` returns both `WorkoutPlan` (mapped) and raw `ApiWorkout` (for proposal/edit)
- `useConvertUrlMutation` on success: `queryClient.setQueryData(queryKeys.workouts.detail(workout.id), workout)` so proposal reads from cache

### Update all consumers

All screens/components using old hooks need updating to the new TQ-based hooks:
- `app/(protected)/(tabs)/my-workouts.tsx` — `useWorkoutsQuery()` replaces `useWorkouts()`. Remove manual `refreshing` state (TQ handles it via `isRefetching`).
- `app/(protected)/process-url.tsx` / `components/processing/process-url-content.tsx` — `useConvertUrlMutation()` replaces `useConvertUrl()`
- `app/(protected)/onboarding/goal.tsx` (or wherever `useSaveProfile` is used) — `useSaveProfileMutation()`
- Any other consumer of old hooks

---

## Phase 1: Backend — Add PATCH endpoint

**File:** `clip2fit-api/src/app/api/workouts/[id]/route.ts`

Add `PATCH` handler — full exercise array replacement in a transaction:
1. Auth check + verify workout belongs to user (same pattern as existing GET/DELETE)
2. Validate body with Zod:
   ```typescript
   const exerciseSchema = z.object({
     name: z.string().min(1),
     sets: z.number().int().positive(),
     reps: z.string().min(1),
     targetWeight: z.number().nullable().optional(),
     restBetweenSets: z.string().nullable().optional(),
     notes: z.string().nullable().optional(),
     order: z.number().int(),
     muscleGroups: z.array(z.string()).default([]),
     isBodyweight: z.boolean().default(false),
   })
   const workoutUpdateSchema = z.object({
     title: z.string().min(1).optional(),
     description: z.string().nullable().optional(),
     exercises: z.array(exerciseSchema),  // full replacement
   })
   ```
3. Transaction: delete all existing exercises → insert new exercises → optionally update workout title/description
4. Return updated workout (same JSON shape as GET)

**References:**
- DB schema: `clip2fit-api/src/lib/db/schema.ts` — exercises FK with `onDelete: "cascade"`
- Existing GET/DELETE pattern in same file for auth + ownership check

---

## Phase 2: Types & API Hooks

### 2A. Add `PatchWorkoutPayload` type

**File:** `types/api.ts`
```typescript
export interface PatchWorkoutPayload {
  title?: string
  description?: string
  exercises: ApiExercise[]  // full array replacement
}
```

### 2B. Update `targetReps` type

**File:** `types/workout.ts`
- Change `WorkoutSet.targetReps` from `number` to `string | null`
- Update any code that assumes `targetReps` is numeric

### 2C. Add `creatorName` field

**File:** `types/workout.ts`
- Add `creatorName: string | null` to `WorkoutPlan`

**File:** `types/api.ts`
- Update `mapApiWorkout` to map `creatorName` from API response

### 2D. Add mutation hooks (in use-api.ts, TanStack Query)

- `useUpdateWorkoutMutation()` → `apiPatch<ApiWorkout>('/api/workouts/${id}', payload)`, invalidates `workouts.all` + `workouts.detail(id)`
- `useDeleteWorkoutMutation()` → `apiDelete('/api/workouts/${id}')`, invalidates `workouts.all`

---

## Phase 3: Workout Proposal (replaces workout-preview.tsx)

Renders inside the existing `process-url` fullScreenModal when `screenState === 'preview'`. Replaces the current read-only `WorkoutPreview`.

### Component tree
```
ProcessUrlContent (existing, screenState === 'preview')
  └── WorkoutProposal (new — replaces WorkoutPreview)
        ├── ProposalHeader (title, platform badge, description, stats)
        ├── ScrollView / KeyboardAwareScrollView
        │     └── ProposalExerciseRow[] (inline-editable exercise cards)
        ├── ProposalActions (sticky bottom: Save + Discard)
        └── DiscardProposalModal (confirm discard if dirty)
```

### New files

| File | ~Lines | Description |
|------|--------|-------------|
| `components/proposal/workout-proposal.tsx` | ~130 | Container. Reads workout from TQ cache via `useWorkoutQuery(id)`. Owns `editableExercises: ApiExercise[]` state (deep-cloned from `rawWorkout`). Handlers: updateExercise, deleteExercise, save, discard. Dirty tracking via JSON.stringify comparison. |
| `components/proposal/proposal-header.tsx` | ~80 | Read-only hero: PlatformBadge + title + creator + description + stats row (exercise count, duration, difficulty pill). |
| `components/proposal/proposal-exercise-row.tsx` | ~140 | Card per exercise. **Inline-editable fields:** sets (numeric TextInput), reps (freeform TextInput), notes (expandable TextInput). **Read-only fields:** exercise name, muscle group pills, rest time. **Delete:** trash icon → row slides left revealing red "Delete" button → second tap confirms. Order number auto-renumbers on delete. Entry animation: Reanimated `FadeInDown` with staggered delay (mount only). |
| `components/proposal/proposal-actions.tsx` | ~50 | Sticky bottom bar: "Save to Library" (primary Button, loading state from `useUpdateWorkoutMutation`) + "Discard" (ghost Button). Disabled save if 0 exercises. Bottom inset padding. |
| `components/proposal/discard-proposal-modal.tsx` | ~40 | Confirmation dialog. Copy: "Discard edits?" / "The original workout will still be in your library." Same modal pattern as existing `discard-workout-modal.tsx`. Only shown if dirty (edits made). If no edits, discard closes silently. |

### UI design for proposal exercise row

```
┌──────────────────────────────────────────────────┐
│  1   Close Grip Lat Pulldown              🗑️     │
│       Lats                                       │  ← muscle pills (read-only)
│  ┌──────────┬───────────┬─────────────────────┐  │
│  │ Sets: [3]│ Reps:[8-10]│ Rest: 90 seconds   │  │  ← sets/reps editable, rest read-only
│  └──────────┴───────────┴─────────────────────┘  │
│  📝 Keep torso vertical for a big stretch...     │  ← notes (tap to expand/edit)
└──────────────────────────────────────────────────┘
```

- Editable fields: underline-style inputs (matching existing `weight-input.tsx` pattern)
- Delete interaction: tap 🗑️ → row slides left ~70px, red "Delete" button revealed on right → tap "Delete" to confirm → Reanimated `Layout` transition animates remaining items up, order numbers renumber
- Notes section: collapsed by default, tap to expand (reuses `ExerciseNotes` pattern)
- Entry animation: `FadeInDown.delay(index * 50)` on mount only

### Modified files

| File | Change |
|------|--------|
| `components/processing/process-url-content.tsx` | Import `WorkoutProposal` instead of `WorkoutPreview`. Read workout ID from conversion result. Add `handleSaved` callback that does `router.replace('/(protected)/(tabs)/my-workouts')`. Hard swap transition (no animation). |
| `components/processing/workout-preview.tsx` | **Delete** — fully replaced by proposal. |

### Save flow
1. User taps "Save to Library"
2. `useUpdateWorkoutMutation().mutate({ id, payload: { exercises: editableExercises } })`
3. On success → invalidates `workouts.all` → `router.replace('/(protected)/(tabs)/my-workouts')`
4. On error → error text below save button, local edits preserved, user can retry

### Discard flow
1. If dirty (edits made): show DiscardProposalModal → "Discard edits? The original workout will still be in your library."
2. If clean (no edits): close process-url modal silently
3. Original AI workout stays in DB regardless

---

## Phase 4: Workout Detail Screen

New screen for viewing a single saved workout. Navigated to from My Workouts card tap.

### New files

| File | ~Lines | Description |
|------|--------|-------------|
| `app/(protected)/workout-detail.tsx` | ~12 | Thin screen wrapper, renders `WorkoutDetailContent` |
| `components/workout-detail/workout-detail-content.tsx` | ~180 | Main content. Reads `id` from `useLocalSearchParams`. Fetches via `useWorkoutQuery(id)`. Layout: header, hero, exercise list, sticky "Start Workout" footer. Loading skeleton / error states. |
| `components/workout-detail/detail-header.tsx` | ~60 | ← back (left), ✏️ edit + 🗑️ delete (right). Edit navigates to `edit-workout?id=X`. Delete opens confirmation modal. |
| `components/workout-detail/detail-exercise-row.tsx` | ~80 | Read-only exercise card. Shows order, name, muscles, sets x reps, rest, notes. Each exercise is a distinct card with spacing between (cards with dividers style). |
| `components/workout-detail/delete-workout-modal.tsx` | ~40 | Confirm delete. On confirm: `useDeleteWorkoutMutation().mutate(id)` → on success: `router.back()`. TQ invalidation ensures My Workouts refetches. |

### Creator name display
Show `creatorName` when available: "John Doe (@johndoe)". Fall back to handle only. Uses `creatorName` from updated `WorkoutPlan` type.

### Source video button
Prominent button in the header/hero area near creator attribution. Deep links to TikTok/IG via `Linking.openURL()`.

### Detail screen layout
```
┌──────────────────────────────────────────┐
│  ←  Pull Day Workout        ✏️  🗑️       │  ← header (back + edit + delete)
│──────────────────────────────────────────│
│  [TikTok]  John Doe (@johndoe)           │  ← platform badge + creatorName + handle
│  [Watch Original Video]                  │  ← prominent source video button
│                                          │
│  A scientifically-backed pull day...     │  ← description (truncated 2 lines)
│  Read more                               │  ← expand to show full
│                                          │
│  7 exercises  ·  45 min  ·  intermediate │  ← stats
│  Back · Biceps                           │  ← target muscle pills (decorative)
│──────────────────────────────────────────│
│  Exercises                               │
│  ┌────────────────────────────────────┐  │
│  │ 1  Close Grip Lat Pulldown        │  │  ← card
│  │    Lats · 3 x 8-10 · Rest 90s    │  │
│  │    📝 Keep torso vertical...      │  │
│  └────────────────────────────────────┘  │
│                                          │  ← spacing between cards
│  ┌────────────────────────────────────┐  │
│  │ 2  Chest Supported Machine Row    │  │  ← card
│  │    ...                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │       Start Workout               │  │  ← sticky bottom CTA
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Phase 5: Edit Workout Screen (Standalone)

Standalone route for editing a saved workout. Reuses proposal components but is independent from the process-url flow.

### New files

| File | ~Lines | Description |
|------|--------|-------------|
| `app/(protected)/edit-workout.tsx` | ~12 | Thin screen wrapper, renders `EditWorkoutContent` |
| `components/edit-workout/edit-workout-content.tsx` | ~50 | Reads `id` from params. Fetches via `useWorkoutQuery(id)` (fresh from API). Renders `WorkoutProposal` component with `mode: 'edit'` prop. On save success: `router.back()` to detail screen (TQ cache invalidation refreshes detail data). |

### WorkoutProposal modifications
- Add optional `mode: 'proposal' | 'edit'` prop (default: `'proposal'`)
- `mode === 'edit'`: Save button says "Save Changes" instead of "Save to Library". On success → `router.back()` (not replace to My Workouts). Discard button says "Cancel".
- `mode === 'proposal'`: Existing behavior (save → replace to My Workouts, discard copy mentions original staying in library)

### Route registration

**`app/(protected)/_layout.tsx`** — add `edit-workout` route with `presentation: 'card'` (standard push, swipe-back enabled)

---

## Phase 6: Navigation Wiring

### Modified files

| File | Change |
|------|--------|
| `app/(protected)/_layout.tsx` | Add `<Stack.Screen name="workout-detail" />` with `presentation: 'card'`. Add `<Stack.Screen name="edit-workout" />` with `presentation: 'card'`. |
| `app/(protected)/(tabs)/my-workouts.tsx` | Wire `onPress` on `WorkoutCard` Pressable: `router.push('/(protected)/workout-detail?id=${item.id}')`. Replace `useWorkouts()` with `useWorkoutsQuery()`. Remove manual refresh state (use TQ's `isRefetching`). |
| `components/home/todays-workout-card.tsx` | Wire card tap to `workout-detail` if applicable |

---

## Phase 7: Remove Mock from Active Workout

### Modified files

| File | Change |
|------|--------|
| `app/(protected)/active-workout.tsx` | Accept `id` search param |
| `components/workout/active-workout-content.tsx` | Read `id` from params. If `id` provided → `useWorkoutQuery(id)` (TQ cache hit from detail screen), map to session data. If no `id` → fall back to `MOCK_WORKOUT_PLAN` (keeps dev testing working). `targetReps` now `string \| null` — shown as ghost placeholder text in input fields. |

### Type changes ripple

Update active workout components that reference `targetReps`:
- `components/workout/reps-input.tsx` — placeholder accepts `string | null`
- Any set row component that displays target reps

### Flow
Workout Detail → "Start Workout" → `router.push('/(protected)/active-workout?id=${workout.id}')` → `useWorkoutQuery(id)` returns cache hit → starts real workout session.

---

## Side Effects & Edge Cases

| Scenario | Handling |
|----------|----------|
| Network failure during save (proposal) | `useUpdateWorkoutMutation` error state. Error text below save button. Local edits preserved. Button re-enables for retry. |
| Network failure during save (edit screen) | Same pattern. Error below save button. |
| Network failure during delete | `useDeleteWorkoutMutation` error state. `DeleteWorkoutModal` shows inline error. |
| User deletes ALL exercises in proposal | Disable "Save to Library" button. |
| User taps X with unsaved edits | Show `DiscardProposalModal`. If no edits (clean state), dismiss directly. Dirty tracking via JSON.stringify comparison. |
| Existing workout (same URL converted twice) | No indication. Proposal shows normally. May create duplicates. |
| Keyboard covers input in proposal | Use `KeyboardAwareScrollView` from `react-native-keyboard-controller`. |
| My Workouts stale after save/delete | TQ cache invalidation + refetch on focus. |
| Active workout with deleted workout ID | `useWorkoutQuery` returns error → show error state + back button. |
| Detail screen after edit-workout save | TQ cache invalidated → detail refetches automatically on focus. |

---

## Tradeoffs & Decisions

| Decision | Rationale |
|----------|-----------|
| **TanStack Query full migration** | Unified caching, invalidation, loading/error states. Pays for itself immediately with the save → list → detail cache flow. |
| **Invalidate + refetch** (not optimistic) | Simpler, always correct. Slight delay on My Workouts list reload is acceptable. |
| **Separate edit-workout route** (not inline) | Clean separation. Proposal components reusable. Detail stays read-only. |
| **Red slide-to-reveal delete** | Discoverable but not accidental. Industry-standard pattern. |
| **targetReps as string** | Supports freeform reps from AI extraction ('8-10', 'AMRAP'). No lossy parsing. |
| **Full exercise array in PATCH** (not granular ops) | Simpler client logic. No diff tracking. Backend replaces atomically. |
| **Replace** workout-preview.tsx (not keep both) | Proposal is a superset — preview + edit. No reason to maintain both. |
| **`presentation: 'card'`** for detail + edit | Content screens, not actions. Standard push nav with swipe-back. |
| **Separate ProposalExerciseRow / DetailExerciseRow** | Different enough (editable vs read-only) that a shared base adds complexity without benefit. |
| **No exercise reorder (v2)** | Needs gesture handler setup + drag library. Overkill for MVP. |
| **No add exercises (v2)** | Scope creep. Edit/delete covers the critical "AI got it wrong" use case. |
| **Exercise name read-only (v2)** | Rarely wrong. Adding inline editing for names is low priority. |

---

## File Manifest Summary

**New files (15):**
- `constants/query-keys.ts`
- `contexts/query-client.tsx`
- `components/proposal/workout-proposal.tsx`
- `components/proposal/proposal-header.tsx`
- `components/proposal/proposal-exercise-row.tsx`
- `components/proposal/proposal-actions.tsx`
- `components/proposal/discard-proposal-modal.tsx`
- `app/(protected)/workout-detail.tsx`
- `components/workout-detail/workout-detail-content.tsx`
- `components/workout-detail/detail-header.tsx`
- `components/workout-detail/detail-exercise-row.tsx`
- `components/workout-detail/delete-workout-modal.tsx`
- `app/(protected)/edit-workout.tsx`
- `components/edit-workout/edit-workout-content.tsx`

**Modified files (11):**
- `clip2fit-api/src/app/api/workouts/[id]/route.ts` — add PATCH handler
- `app/_layout.tsx` — wrap with QueryClientProvider
- `hooks/use-api.ts` — full rewrite to TanStack Query hooks
- `types/api.ts` — add `PatchWorkoutPayload`, update `mapApiWorkout` for `creatorName`
- `types/workout.ts` — `targetReps` → `string | null`, add `creatorName` to `WorkoutPlan`
- `components/processing/process-url-content.tsx` — swap WorkoutPreview → WorkoutProposal
- `app/(protected)/_layout.tsx` — add `workout-detail` + `edit-workout` routes
- `app/(protected)/(tabs)/my-workouts.tsx` — wire card tap nav + TQ migration
- `components/home/todays-workout-card.tsx` — wire card tap to detail
- `app/(protected)/active-workout.tsx` — accept `id` search param
- `components/workout/active-workout-content.tsx` — fetch real workout via TQ when `id` provided

**Deleted files (1):**
- `components/processing/workout-preview.tsx`

---

## Implementation Order

1. **Phase 0** — TanStack Query migration (install, query keys, provider, rewrite all hooks, update consumers)
2. **Phase 1** — Backend PATCH endpoint
3. **Phase 2** — Types & new API hooks (PatchWorkoutPayload, targetReps type change, creatorName, mutation hooks)
4. **Phase 3** — Workout Proposal (5 components, replace workout-preview)
5. **Phase 4** — Workout Detail (5 components, new route)
6. **Phase 5** — Edit Workout (2 components, new route, modify WorkoutProposal for dual mode)
7. **Phase 6** — Navigation wiring (My Workouts → Detail → Edit → Active Workout)
8. **Phase 7** — Remove mock from active workout (real data via TQ cache)

---

## Verification

1. **TQ migration**: All existing screens (My Workouts, process-url, onboarding) work exactly as before with new TQ hooks
2. **Convert a URL** → proposal shows with all exercises editable (sets, reps, notes)
3. **Edit sets/reps/notes** → inline editing works, keyboard doesn't cover fields
4. **Delete an exercise** → slide-to-reveal red button → confirm → row animates out, list renumbers
5. **Delete all exercises** → save button disabled
6. **Tap X with edits** → discard modal: "Discard edits? The original workout will still be in your library."
7. **Tap X without edits** → direct dismiss (no modal)
8. **Save to Library** → PATCH fires, navigates to My Workouts, workout visible in list
9. **Save failure** → error below button, local edits preserved, retry works
10. **Tap workout in My Workouts** → detail screen opens with all info (description truncated, "Read more" works)
11. **Source video button** → opens TikTok/IG in external app
12. **Tap ✏️ on detail** → edit-workout screen opens, fetches fresh data, editable
13. **Save from edit** → back to detail, data refreshed
14. **Delete from detail** → confirmation modal → deletion → back to My Workouts (list refetches)
15. **Start Workout from detail** → active-workout receives real data (TQ cache hit), target values as ghost placeholders
