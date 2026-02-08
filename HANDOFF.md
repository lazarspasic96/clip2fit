# Handoff: Onboarding Screens Implementation

## Goal

Implement onboarding screens for Clip2Fit. The plan has 4 phases (A-D): Welcome screen, route restructuring, button consolidation, and profile onboarding. The original plan file was at `.claude/plans/hidden-popping-dongarra.md` but has been deleted — use `plan-onboarding.md` and this document as the source of truth.

## Current Progress

### Phase A: Welcome Screen + Logo Component — DONE

- **Created** `components/ui/logo.tsx` — Reusable logo with `size` prop (sm/md/lg), optional Reanimated `FadeInDown` animation via `animated`/`delay` props
- **Created** `app/(auth)/welcome.tsx` — Full-screen landing with staggered FadeInDown animations, ImageBackground pattern, "Get Started" → signup, "Sign in" → login
- **Modified** `app/(auth)/_layout.tsx` — Added `welcome` as first Stack.Screen
- **Modified** `app/_layout.tsx` — Redirect unauthenticated → `/(auth)/welcome`
- **Modified** `app/(auth)/login.tsx` — Replaced inline logo text with `<Logo size="md" />`
- **Modified** `app/(auth)/signup.tsx` — Replaced inline logo text with `<Logo size="md" />`

### Phase B: Route Restructuring — DONE

- **Created** `app/(app)/_layout.tsx` — Headerless Stack wrapper
- **Created** `app/(app)/(tabs)/_layout.tsx` — Tabs with Home/Library/Settings, lucide icons, dark tab bar styling, `TAB_BAR_STYLE` extracted to const
- **Created** `app/(app)/(tabs)/index.tsx` — Home placeholder (Logo + paste URL description)
- **Created** `app/(app)/(tabs)/library.tsx` — Empty state placeholder
- **Created** `app/(app)/(tabs)/settings.tsx` — User email, "Complete Profile" button, sign out button
- **Updated** `app/_layout.tsx`:
  - `unstable_settings.anchor` → `'(app)'`
  - Authenticated redirect → `/(app)/(tabs)`
  - Stack.Screen `(app)` + `(profile)` registered
- **Deleted** old `app/(tabs)/` directory (\_layout.tsx, index.tsx, test.tsx)

### Phase C: Button Consolidation — DONE

- **Created** `components/ui/button.tsx` — Reusable button with `primary`/`secondary`/`ghost` variants, `loading`/`disabled` states, `className`/`style` props, uses `cn()` for class merging
- **Updated imports** in: `welcome.tsx`, `login.tsx`, `signup.tsx`, `check-email.tsx`, `settings.tsx` — all now use `Button` from `@/components/ui/button`
- **Deleted** `components/auth/auth-button.tsx`
- **Added** "Forgot password?" stub link to `login.tsx` — right-aligned below password field, shows `Alert.alert` placeholder

### Phase D: Profile Onboarding — NOT STARTED

This is the remaining work. Create types, contexts, UI components, and 3 profile screens.

**Files to create:**
- `types/profile.ts` — UserProfile, FitnessGoal, Gender, HeightUnit, WeightUnit types + constants
- `contexts/profile-form-context.tsx` — Multi-step form state with useRef (no re-renders)
- `components/ui/progress-bar.tsx` — Animated progress bar (Reanimated withTiming)
- `components/ui/radio-group.tsx` — Generic radio selection component
- `components/ui/segmented-control.tsx` — Unit toggle (cm/ft, kg/lbs)
- `app/(profile)/_layout.tsx` — Stack + ProgressBar + ProfileFormProvider
- `app/(profile)/name.tsx` — Full name input
- `app/(profile)/demographics.tsx` — Gender, age, height, weight (all optional)
- `app/(profile)/goal.tsx` — Fitness goal selection, saves all data to Supabase

**Files to modify:**
- `types/auth.ts` — Add `updateProfile`, `profileComplete` to AuthContextType
- `contexts/auth-context.tsx` — Add `updateProfile` method (uses `supabase.auth.updateUser({ data })`) + `profileComplete` boolean derived from `user.user_metadata`
- `app/(app)/(tabs)/settings.tsx` — Conditionally show "Complete Profile" based on `profileComplete`

## What Worked

- **Logo extraction** — Clean reusable component with `cn()` for className merging, optional animation props
- **Staggered Reanimated animations** — `FadeInDown.delay(N).springify()` works well for welcome screen entrance
- **Button consolidation** — `primary`/`secondary`/`ghost` variants with Record maps for classes/colors keeps it clean
- **sed for bulk renames** — When the linter hook keeps invalidating file reads, `sed -i` via Bash is the reliable way to do import swaps across files

## What Didn't Work / Watch Out For

- **Linter/formatter modifies files aggressively** — A hook reformats files on every read/write. The Edit tool will fail with "File has been modified since read" frequently. Workarounds:
  1. Use `Write` to rewrite the whole file in one shot (but it can also fail)
  2. Use `sed -i` via Bash for targeted replacements — this is the most reliable approach
  3. Re-read immediately before each edit attempt
  4. **Never batch multiple edits to the same file** — the linter runs between edits
- **login.tsx uses `expo-image` Image, welcome.tsx uses ImageBackground** — Two different background image approaches. May want to align later.
- **Typed Routes** — Expo typed routes (experimental) show TS errors for new routes until types regenerate on next Metro start. These are transient.

## Key Files Reference

| File | Purpose |
|------|---------|
| `plan-onboarding.md` | Original onboarding plan |
| `tailwind.config.js` | All design tokens (colors, fonts, spacing, radii) |
| `components/ui/cn.ts` | `clsx` className utility |
| `components/ui/logo.tsx` | Reusable logo component |
| `components/ui/button.tsx` | Reusable button (primary/secondary/ghost) — NEW |
| `components/ui/form-input.tsx` | react-hook-form Controller wrapper |
| `components/ui/input.tsx` | Base TextInput with focus/error states |
| `contexts/auth-context.tsx` | Auth state: signIn, signUp, signInWithGoogle, signOut, resendSignUpEmail |
| `hooks/use-zod-form.ts` | useForm + zodResolver wrapper |
| `app/_layout.tsx` | Root layout — already has `(profile)` Stack.Screen registered |
| `app/(app)/(tabs)/settings.tsx` | Settings — already has "Complete Profile" pressable linking to `/(profile)/name` |

## Current Route Structure

```
app/
  _layout.tsx              # Root: auth redirect, Stack with (auth), (app), (profile)
  (auth)/
    _layout.tsx            # Stack (headerless)
    welcome.tsx            # Landing screen
    login.tsx              # Email + Google login + forgot password stub
    signup.tsx             # Email + Google signup
    check-email.tsx        # Post-signup confirmation
  (app)/
    _layout.tsx            # Headerless Stack wrapper
    (tabs)/
      _layout.tsx          # Tab bar: Home, Library, Settings
      index.tsx            # Home placeholder
      library.tsx          # Library placeholder
      settings.tsx         # Email, Complete Profile, Sign Out
  (profile)/               # NOT YET CREATED — Phase D
    _layout.tsx
    name.tsx
    demographics.tsx
    goal.tsx
```

## Next Steps

1. **Phase D** — Create all profile onboarding files (types, context, UI components, screens) per the details above
2. **Verify** — Run `npx expo start`, test full flow: welcome → signup → tabs → settings → profile onboarding → back to settings
