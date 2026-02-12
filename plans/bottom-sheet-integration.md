# Plan: Replace `Modal` with `@gorhom/bottom-sheet`

## Context

All modal UIs currently use `Modal` from `react-native` — 3 confirmation dialogs (fade) and 1 edit sheet (slide). Replace all with `@gorhom/bottom-sheet` for proper gesture-driven sheets, native feel, and consistent UX.

## 4 Modal Usages Found

| # | File | Type | Used in |
|---|------|------|---------|
| 1 | `components/ui/delete-workout-modal.tsx` | Confirm (fade) | `my-workouts.tsx:92` |
| 2 | `components/proposal/discard-proposal-modal.tsx` | Confirm (fade) | `workout-proposal.tsx:114` |
| 3 | `components/workout/discard-workout-modal.tsx` | Confirm (fade) | `active-workout-content.tsx:66` |
| 4 | `components/workout-detail/edit-exercise-sheet.tsx` | Form sheet (slide) | `workout-detail-content.tsx:180` |

## Design Decisions

- **Confirmation dialogs → compact bottom sheets** using `BottomSheetModal` with `enableDynamicSizing` (modern iOS pattern, auto-sizes to content)
- **Create shared `ConfirmationSheet`** — all 3 confirmation dialogs are near-identical, replace with one reusable component
- **Edit exercise sheet** — replace `Modal` + `KeyboardAwareScrollView` + `TextInput` with `BottomSheetModal` + `BottomSheetScrollView` + `BottomSheetTextInput` (built-in keyboard handling)
- **Provider placement**: `BottomSheetModalProvider` inside `KeyboardProvider`, wrapping `AuthProvider`

## Prerequisites (already met)

- `react-native-gesture-handler@~2.28.0` ✅
- `react-native-reanimated@~4.1.1` ✅
- `GestureHandlerRootView` wraps app ✅

---

## Phase 1: Install + Provider Setup

### 1.1 Install library
```bash
npx expo install @gorhom/bottom-sheet
```

### 1.2 Add `BottomSheetModalProvider` to `app/_layout.tsx`
Import `BottomSheetModalProvider` from `@gorhom/bottom-sheet`. Wrap between `KeyboardProvider` and `AuthProvider`:
```
KeyboardProvider
  BottomSheetModalProvider  ← NEW
    AuthProvider
      RootNavigator
```

---

## Phase 2: Create `ConfirmationSheet`

### 2.1 Create `components/ui/confirmation-sheet.tsx` (~75 lines)

Props: `visible`, `title`, `description`, `cancelLabel?`, `confirmLabel`, `onCancel`, `onConfirm`, `loading?`, `error?`

Key implementation:
- `useRef<BottomSheetModal>` + `useEffect` on `visible` → `present()`/`dismiss()`
- `enableDynamicSizing` + `enablePanDownToClose`
- `BottomSheetBackdrop` with `opacity={0.6}`, `pressBehavior="close"`
- `BottomSheetView` (not scrollable — content is short)
- `onDismiss` → `onCancel` (idempotent — consumers already set `visible=false`)
- `backgroundStyle` uses `Colors.background.secondary`, `handleIndicatorStyle` uses `Colors.content.tertiary`

---

## Phase 3: Replace 3 Confirmation Dialogs

### 3.1 `my-workouts.tsx` — swap `DeleteWorkoutModal` → `ConfirmationSheet`
- Change import
- Replace JSX: `title="Delete workout?"`, `description="This action cannot be undone."`, `confirmLabel="Delete"`, pass `loading` + `error`

### 3.2 `workout-proposal.tsx` — swap `DiscardProposalModal` → `ConfirmationSheet`
- Change import
- Move `title`/`description` derivation (based on `mode`) into component body
- Replace JSX: `confirmLabel="Discard"`, `onConfirm` calls `setShowDiscardModal(false)` then `onDiscard()`

### 3.3 `active-workout-content.tsx` — swap `DiscardWorkoutModal` → `ConfirmationSheet`
- Change import
- Replace JSX: `title="End workout?"`, `description="Progress won't be saved."`, `confirmLabel="End"`

### 3.4 Delete old files
- `components/ui/delete-workout-modal.tsx`
- `components/proposal/discard-proposal-modal.tsx`
- `components/workout/discard-workout-modal.tsx`

---

## Phase 4: Rewrite Edit Exercise Sheet

### 4.1 Rewrite `components/workout-detail/edit-exercise-sheet.tsx` (~120 lines)

Same props interface: `exercise`, `visible`, `onDismiss`, `onUpdate`

Key changes:
- `Modal` → `BottomSheetModal` (ref + `useEffect` for `present()`/`dismiss()`)
- `KeyboardAwareScrollView` → `BottomSheetScrollView`
- 3x `TextInput` → `BottomSheetTextInput`
- Remove manual backdrop `Pressable`, grab handle `View` — handled by library
- Add `keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"`
- State sync: move from `onShow` callback → `useEffect` before `present()`
- Remove `useSafeAreaInsets` (library handles safe area)
- No consumer changes needed — same props interface

### ⚠️ Potential issue: NativeWind `className` on `BottomSheetTextInput`
NativeWind may not resolve `className` on non-standard RN components. If it doesn't work, fall back to `style` prop. Test early.

---

## Phase 5: Verify

1. Search codebase for remaining `Modal` imports from `react-native` → should be zero
2. Run `npm run lint`
3. Test all 4 sheets on iOS simulator:
   - My Workouts: swipe-delete → confirmation sheet appears, backdrop dismiss, swipe dismiss, confirm delete
   - Workout proposal: edit → discard → confirmation sheet
   - Active workout: close → end workout sheet
   - Workout detail: tap pencil → edit exercise sheet, keyboard works, swipe dismiss

## Files Summary

| File | Action |
|------|--------|
| `app/_layout.tsx` | Modify (+3 lines) |
| `components/ui/confirmation-sheet.tsx` | **Create** (~75 lines) |
| `components/workout-detail/edit-exercise-sheet.tsx` | **Rewrite** (~120 lines) |
| `app/(protected)/(tabs)/my-workouts.tsx` | Modify (import + JSX swap) |
| `components/proposal/workout-proposal.tsx` | Modify (import + JSX swap) |
| `components/workout/active-workout-content.tsx` | Modify (import + JSX swap) |
| `components/ui/delete-workout-modal.tsx` | **Delete** |
| `components/proposal/discard-proposal-modal.tsx` | **Delete** |
| `components/workout/discard-workout-modal.tsx` | **Delete** |
