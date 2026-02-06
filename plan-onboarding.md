# Clip2Fit - Mobile App Onboarding Plan

## Context
Build auth flow + onboarding for Clip2Fit. Decisions: NativeWind (not expo-ui), defer profile setup, email + social auth (Google/Apple) via Supabase, immediate access (no email verification blocking), combined demographics screen. Figma designs integrated once MCP is set up.

## Target Folder Structure
```
app/
  _layout.tsx              # Root: font loading, auth provider, redirect
  (auth)/                  # Not logged in
    _layout.tsx            # Stack (headerless)
    welcome.tsx            # Landing/value prop
    register.tsx           # Email + social signup
    login.tsx              # Email + social login
  (app)/                   # Logged in (protected)
    _layout.tsx            # Stack wrapper
    (tabs)/
      _layout.tsx          # Tab bar
      index.tsx            # Home (paste URL)
      library.tsx          # Saved workouts
      settings.tsx         # Settings + sign out
  (profile)/               # Deferred: post-first-conversion
    _layout.tsx
    name.tsx
    demographics.tsx       # Gender + age + height + weight (one screen)
    goal.tsx
components/
  ui/
    button.tsx             # Primary/secondary/outline/ghost variants
    text-input.tsx         # Label + error + icon support
    screen-wrapper.tsx     # SafeArea + KeyboardAvoiding
    logo.tsx               # Brand logo
    divider.tsx            # "or continue with" divider
  auth/
    social-auth-buttons.tsx
hooks/
  use-auth.tsx             # AuthProvider context + useAuth hook
  use-color-scheme.ts      # Existing
lib/
  supabase.ts              # Client init w/ AsyncStorage
  validation.ts            # Zod schemas
types/
  auth.ts
  profile.ts
constants/
  auth.ts                  # Error messages
```

## Auth Gating (root `_layout.tsx`)
Uses `useAuth()` + `useSegments()` + `useRouter()`:
- `!initialized` → keep splash screen visible
- `!user && !inAuthGroup` → redirect `/(auth)/welcome`
- `user && inAuthGroup` → redirect `/(app)/(tabs)`
- No email verification gate — immediate access after signup

---

## Phase 0: Foundation
**Install deps, Supabase client, auth context, types, validation**

Install:
- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `@hookform/resolvers` (verify zod v4 compat, fallback to zod/v3 compat layer if needed)

Create:
- `.env` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (gitignored)
- `lib/supabase.ts` — createClient w/ AsyncStorage adapter, typed client
- `lib/validation.ts` — loginSchema (email + password), registerSchema (+ confirmPassword)
- `types/auth.ts` — AuthState, AuthContextType
- `types/profile.ts` — UserProfile type (for deferred phase)
- `constants/auth.ts` — AUTH_ERRORS map
- `hooks/use-auth.tsx` — AuthProvider (React context) wrapping:
  - `onAuthStateChange` listener
  - `signInWithPassword`, `signUp`, `signOut` methods
  - `signInWithOAuth` (Google/Apple) — stub, wire up in later phase
  - `loading`, `initialized`, `user`, `session` state

Modify:
- `app/_layout.tsx` — wrap in `<AuthProvider>`, add redirect logic, remove `modal` + old `(tabs)` refs

**Checkpoint: ask to continue**

---

## Phase 1: Base UI Components
**Reusable components for all auth screens**

Files:
- `components/ui/screen-wrapper.tsx`
  - SafeAreaView + KeyboardAvoidingView (padding on iOS, height on Android)
  - Optional ScrollView with `keyboardShouldPersistTaps="handled"`
  - `className` prop for bg override

- `components/ui/button.tsx`
  - Variants: `primary` (lime bg), `secondary` (zinc bg), `outline` (border), `ghost` (transparent)
  - Props: `children: string`, `onPress`, `variant`, `loading`, `disabled`, `icon?: ReactNode`, `fullWidth`
  - h-14, rounded-xl, font-inter-semibold

- `components/ui/text-input.tsx`
  - forwardRef to RNTextInput
  - Props: `label?`, `error?`, `leftIcon?`, `rightIcon?` + all TextInputProps
  - h-14, bg-background-secondary, rounded-xl, border changes on error
  - Error text in xs/red below input

- `components/ui/logo.tsx`
  - Props: `size: 'sm' | 'md' | 'lg'`
  - Brand mark (lime bg square w/ "C2F") + "Clip to Fit" text (Onest font)

- `components/ui/divider.tsx`
  - Props: `text?: string`
  - Horizontal line with optional centered text ("or continue with")

- `components/auth/social-auth-buttons.tsx`
  - Google + Apple outline buttons using lucide icons
  - Props: `onGooglePress`, `onApplePress`, `loading?`

**Checkpoint: ask to continue**

---

## Phase 2: Auth Layouts + Route Groups
**Create (auth) and (app) route groups, migrate existing tabs**

Create:
- `app/(auth)/_layout.tsx` — `<Stack>` headerless, slide_from_right animation, bg #09090b
- `app/(app)/_layout.tsx` — `<Stack>` headerless
- `app/(app)/(tabs)/_layout.tsx` — `<Tabs>` with Home (HomeIcon), Library (BookOpen), Settings (Settings) icons, activeTint #84cc16

Move:
- `app/(tabs)/index.tsx` → `app/(app)/(tabs)/index.tsx` (update to placeholder)

Delete:
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/test.tsx`

Create placeholders:
- `app/(app)/(tabs)/library.tsx` — "Coming soon"
- `app/(app)/(tabs)/settings.tsx` — sign out button

**Checkpoint: ask to continue**

---

## Phase 3: Welcome Screen
**`app/(auth)/welcome.tsx`**

- Full screen, no scroll, `justify-between` vertically, px-6 py-12
- Top section: `<Logo size="lg" />` with Reanimated `FadeInDown.delay(200)`
- Middle section: headline (2xl, inter-bold) + subtitle (base, content-secondary), FadeInDown.delay(400)
- Bottom section: "Get Started" (primary btn → register) + "Already have an account?" (ghost btn → login), FadeInDown.delay(600)

**Checkpoint: ask to continue**

---

## Phase 4: Register Screen
**`app/(auth)/register.tsx`**

- Scrollable via ScreenWrapper
- Header: "Create Account" (2xl bold) + "Start converting videos into workouts" (base secondary)
- Form (react-hook-form + zodResolver):
  - Email: `<TextInput label="Email" leftIcon={<Mail />} keyboardType="email-address" autoComplete="email" />`
  - Password: `<TextInput label="Password" leftIcon={<Lock />} secureTextEntry />`
  - Confirm: `<TextInput label="Confirm Password" leftIcon={<Lock />} secureTextEntry />`
  - Submit: `<Button loading={loading}>Create Account</Button>`
- `<Divider text="or continue with" />`
- `<SocialAuthButtons />`
- Footer: "Already have an account? **Sign In**" (brand-accent link → login)

Validation: email valid, password 8+ chars / 1 upper / 1 number, confirmPassword matches

**Checkpoint: ask to continue**

---

## Phase 5: Login Screen
**`app/(auth)/login.tsx`**

- Same ScreenWrapper structure as register
- Header: "Welcome Back" + "Sign in to continue"
- Form:
  - Email + Password inputs (same as register, no confirm)
  - "Forgot password?" link (brand-accent, right-aligned) — stub for now
  - Submit: "Sign In" button
- Divider + social buttons
- Footer: "Don't have an account? **Sign Up**" → register

Validation: email valid, password 8+ chars

**Checkpoint: ask to continue**

---

## Phase 6: Protected App Placeholders
**Wire up logged-in screens**

- `app/(app)/(tabs)/index.tsx` — center text "Paste a video URL to get started" + placeholder input
- `app/(app)/(tabs)/library.tsx` — center text "Your saved workouts will appear here"
- `app/(app)/(tabs)/settings.tsx` — "Settings" header + sign out button (`useAuth().signOut`)

End-to-end test: signup → lands on home tab → sign out → lands on welcome

---

## Phase 7 (Deferred): Profile Setup
**Not built now. Reference only.**

`(profile)/` group, Stack with progress bar:
1. `name.tsx` — full name text input
2. `demographics.tsx` — gender (picker), age (number), height (cm/ft toggle), weight (kg/lbs toggle)
3. `goal.tsx` — radio: lose weight, build muscle, improve endurance, general fitness, athletic performance

Trigger: settings "Complete Profile" button or prompt after first conversion.

---

## Key Files to Modify
| File | Change |
|------|--------|
| `app/_layout.tsx` | Add AuthProvider, auth redirect, remove old screens |
| `app/(tabs)/_layout.tsx` | Delete (moved to app group) |
| `package.json` | New deps |
| `.gitignore` | Ensure .env files listed |

## Verification
After each phase:
1. `npm start` — no errors
2. Navigate all implemented screens
3. Auth redirect works (Phase 0+2 together)
4. Forms validate, show errors inline
5. Keyboard avoidance on iOS
6. Sign out returns to welcome
