# Plan: Keyboard & Safe Area Refactor

## Context

Keyboard handling is broken/inconsistent across the app: buttons don't push above keyboard, no dismiss-on-tap, `SafeAreaView` component causes flickering during transitions, Android behavior is wrong. This refactor installs `react-native-keyboard-controller` (Expo-recommended) and establishes consistent rules across all 13 affected files.

Sources: [React Navigation safe area docs](https://reactnavigation.org/docs/handling-safe-area/), [Expo keyboard guide](https://docs.expo.dev/guides/keyboard-handling/), [react-native-keyboard-controller](https://kirillzyusko.github.io/react-native-keyboard-controller/), [RN KeyboardAvoidingView docs](https://reactnative.dev/docs/keyboardavoidingview)

---

## Rules (to add to CLAUDE.md after implementation)

### Safe Area
1. **NEVER** use `SafeAreaView` component — use `useSafeAreaInsets()` hook (avoids flickering/jumpy animations)
2. Apply insets per-screen via `style={{ paddingTop: insets.top }}` etc.
3. Scrollable screens: apply insets via `contentContainerStyle`

### Keyboard
4. Import `KeyboardAvoidingView` from `react-native-keyboard-controller` (NOT `react-native`)
5. `behavior`: `"padding"` on iOS, `undefined` on Android
6. Always set `keyboardVerticalOffset` — `insets.top` + fixed header height above screen
7. Dismiss on outside tap: `<Pressable onPress={Keyboard.dismiss}>` wrapper
8. Multi-input scrollable forms: use `KeyboardAwareScrollView` from `react-native-keyboard-controller`
9. `keyboardShouldPersistTaps="handled"` on all ScrollViews with interactive elements
10. `KeyboardProvider` wraps app at root

### Android
11. `softwareKeyboardLayoutMode: "pan"` in app.json

---

## Phase 0: Install & Configure

### 0a. Install package
```bash
npx expo install react-native-keyboard-controller
```

### 0b. `app.json` — add Android keyboard mode
Add `"softwareKeyboardLayoutMode": "pan"` under `expo.android`:
```json
"android": {
  "softwareKeyboardLayoutMode": "pan",
  ...
}
```

### 0c. `app/_layout.tsx` — add KeyboardProvider
- Import `KeyboardProvider` from `react-native-keyboard-controller`
- Wrap `RootLayout` return:
```tsx
return (
  <KeyboardProvider>
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  </KeyboardProvider>
)
```

---

## Phase 1: Auth Screens

### 1a. `app/(auth)/welcome.tsx` — static, no keyboard
- Replace `SafeAreaView` import → `useSafeAreaInsets`
- `<SafeAreaView className="flex-1">` → `<View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>`

### 1b. `app/(auth)/login.tsx` — form with keyboard
- Remove `SafeAreaView` import, remove `KeyboardAvoidingView` from `react-native`
- Add `useSafeAreaInsets`, add `KeyboardAvoidingView` from `react-native-keyboard-controller`
- Add `Keyboard` import for dismiss
- Replace `SafeAreaView` → `View` with `style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}`
- Replace KAV: `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`, `keyboardVerticalOffset={insets.top}`
- Wrap inner content in `<Pressable className="flex-1" onPress={Keyboard.dismiss}>`

### 1c. `app/(auth)/signup.tsx` — same pattern as login
Identical changes to login.tsx.

### 1d. `app/(auth)/check-email.tsx` — static, no keyboard
- Replace `SafeAreaView` import → `useSafeAreaInsets`
- `<SafeAreaView className="flex-1 bg-background-primary">` → `<View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>`

---

## Phase 2: Onboarding Screens

### 2a. `app/(protected)/onboarding/_layout.tsx` — shared layout with ProgressBar
- Replace `SafeAreaView` import → `useSafeAreaInsets`
- `<SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>` → `<View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>`
- Bottom insets NOT applied here — individual screens handle their own bottom

### 2b. `app/(protected)/onboarding/name.tsx` — single input + keyboard
- Replace `KeyboardAvoidingView` from `react-native` → from `react-native-keyboard-controller`
- Change behavior: `'padding' : 'height'` → `'padding' : undefined`
- Keep `keyboardVerticalOffset={insets.top + 30}` (accounts for layout paddingTop + ProgressBar)
- Keep existing `Pressable` + `Keyboard.dismiss` wrapper
- Add bottom safe area: `<View className="mt-auto gap-3" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>`

### 2c. `app/(protected)/onboarding/demographics.tsx` — multi-input scrollable form (biggest change)
- Remove `KeyboardAvoidingView`, `ScrollView`, `Platform` from `react-native`
- Add `KeyboardAwareScrollView` from `react-native-keyboard-controller`
- Add `useSafeAreaInsets`
- Replace `<KeyboardAvoidingView><ScrollView>` → single `<KeyboardAwareScrollView>` with:
  - `contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32 }}`
  - `keyboardShouldPersistTaps="handled"`
- Bottom buttons stay outside scroll, add safe area: `style={{ paddingBottom: Math.max(insets.bottom, 32) }}`

### 2d. `app/(protected)/onboarding/goal.tsx` — scroll, no keyboard input
- Add `useSafeAreaInsets`
- Bottom buttons: `<View className="px-6 gap-3" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>`
- Keep ScrollView as-is (no text inputs, no keyboard controller needed)

---

## Phase 3: Tab Screens

Tab bar handles bottom safe area. Only top inset needed.

### 3a. `app/(protected)/(tabs)/index.tsx`
- Replace `SafeAreaView` → `useSafeAreaInsets`
- `<SafeAreaView className="flex-1 bg-background-primary">` → `<View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>`

### 3b. `app/(protected)/(tabs)/library.tsx`
Same as index.tsx.

### 3c. `app/(protected)/(tabs)/settings.tsx`
Same as index.tsx. Also add bottom safe area for the sign-out button:
- `<View className="mt-auto" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>` (replacing `pb-8`)

---

## Phase 4: Update CLAUDE.md

Add the rules from the top of this plan to the project CLAUDE.md under a "### Keyboard & Safe Area" section.

---

## Phase 5: Rebuild & Test

Requires dev build rebuild: `npx expo run:ios` / `npx expo run:android`

**Test checklist:**
- [ ] Login/Signup: keyboard pushes content up, dismiss on outside tap, buttons accessible
- [ ] Welcome/Check-email: content respects safe area top + bottom
- [ ] Onboarding name: keyboard avoidance + offset correct, buttons above keyboard, dismiss works
- [ ] Onboarding demographics: `KeyboardAwareScrollView` auto-scrolls to focused input, buttons pinned at bottom
- [ ] Onboarding goal: bottom buttons respect safe area
- [ ] Tab screens: no status bar overlap, no tab bar overlap
- [ ] Android: keyboard behavior correct with `"pan"` mode

---

## Files Changed (13)

| File | Change |
|------|--------|
| `app.json` | Add `softwareKeyboardLayoutMode: "pan"` |
| `app/_layout.tsx` | Add `KeyboardProvider` wrapper |
| `app/(auth)/welcome.tsx` | `SafeAreaView` → `useSafeAreaInsets` |
| `app/(auth)/login.tsx` | `SafeAreaView` → insets, RN KAV → KC KAV, add dismiss |
| `app/(auth)/signup.tsx` | Same as login |
| `app/(auth)/check-email.tsx` | `SafeAreaView` → `useSafeAreaInsets` |
| `app/(protected)/onboarding/_layout.tsx` | `SafeAreaView` → `useSafeAreaInsets` (top only) |
| `app/(protected)/onboarding/name.tsx` | RN KAV → KC KAV, fix Android behavior |
| `app/(protected)/onboarding/demographics.tsx` | KAV+ScrollView → `KeyboardAwareScrollView` |
| `app/(protected)/onboarding/goal.tsx` | Add bottom safe area insets |
| `app/(protected)/(tabs)/index.tsx` | `SafeAreaView` → `useSafeAreaInsets` |
| `app/(protected)/(tabs)/library.tsx` | Same as index |
| `app/(protected)/(tabs)/settings.tsx` | `SafeAreaView` → `useSafeAreaInsets`, add bottom inset |

RN = react-native, KC = react-native-keyboard-controller, KAV = KeyboardAvoidingView
