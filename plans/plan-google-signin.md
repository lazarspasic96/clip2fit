# Google Sign-In Integration Plan

## Context

App has email/password auth via Supabase. Adding Google Sign-In for faster onboarding. Google Cloud Console project exists with a Web Client ID. Supabase Google provider enabled. Mobile only (no web platform).

---

## Google Cloud Console Review

### Web Client (Screenshot 1) — Correct

- Redirect URI `https://vyqpwjlgwqxolmsstjrp.supabase.co/auth/v1/callback` ✅
- JS origins empty — fine for native mobile
- **Confirm** Web Client ID + Secret are in Supabase Dashboard > Auth > Providers > Google

### Branding (Screenshot 2) — OK for dev, needs work for prod

| Field              | Status                             | Action                                                  |
| ------------------ | ---------------------------------- | ------------------------------------------------------- |
| Logo               | Empty                              | Upload app logo (square, 120x120px) before verification |
| Home page          | Empty                              | Add URL before verification                             |
| Privacy policy     | Empty                              | Add URL before verification — **required**              |
| Terms of Service   | Empty                              | Add URL before verification — **required**              |
| Authorised domains | `vyqpwjlgwqxolmsstjrp.supabase.co` | ✅ OK                                                   |
| Developer contact  | `lazarspasic96@gmail.com`          | ✅ OK                                                   |

> Current state is fine for development. Google shows "unverified app" warning but auth works. Fill before publishing.

### Required: Create iOS & Android OAuth Clients

Confirmed via [library docs](https://react-native-google-signin.github.io/docs/setting-up/get-config-file) — **all three OAuth clients are mandatory**:

1. **Web Client** ✅ already exists
2. **iOS Client** — Google Console > Credentials > Create OAuth Client ID > Type: **iOS** > Bundle ID: `com.lazarspasic96.clip2fit`. Save the **iOS Client ID** (need it for `iosUrlScheme` in app.json and `iosClientId` in configure call)
3. **Android Client** — Type: **Android** > Package: `com.lazarspasic96.clip2fit` > SHA-1 from debug keystore. Just needs to exist — not directly used in code

Get debug SHA-1:

```bash
keytool -keystore ~/.android/debug.keystore -list -v -storepass android
```

**Supabase Dashboard** — update Google provider's Client ID field to comma-separated list (web first):

```
WEB_CLIENT_ID,IOS_CLIENT_ID,ANDROID_CLIENT_ID
```

---

## Approach: Native Google Sign-In

`@react-native-google-signin/google-signin` + `supabase.auth.signInWithIdToken()`

- Native sign-in sheet (no browser bounce)
- One-tap on subsequent logins
- `expo-sqlite` already requires dev builds, no extra cost

---

## Phase 1: Install & Configure

### 1a. Install package

```bash
npx expo install @react-native-google-signin/google-signin
```

### 1b. `app.json` — add config plugin

```json
[
  "@react-native-google-signin/google-signin",
  {
    "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
  }
]
```

### 1c. `.env` — add client IDs

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
```

### 1d. Rebuild

```bash
npx expo prebuild --clean && npx expo run:ios
```

---

## Phase 2: Code Changes

### 2a. `types/auth.ts`

Add to `AuthContextType`:

```typescript
signInWithGoogle: () => Promise<AuthResult>
```

### 2b. `contexts/auth-context.tsx`

- Import `GoogleSignin`, `statusCodes`
- `GoogleSignin.configure({ webClientId, iosClientId })` in AuthProvider
- New `signInWithGoogle` callback:
  1. `GoogleSignin.hasPlayServices()`
  2. `GoogleSignin.signIn()` → get `response.data.idToken`
  3. `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`
  4. Return `AuthResult` — existing `onAuthStateChange` handles session update
- Error handling: `SIGN_IN_CANCELLED`, `IN_PROGRESS`, `PLAY_SERVICES_NOT_AVAILABLE`
- Add to Provider value

### 2c. New `components/auth/google-sign-in-button.tsx`

- Pressable with Google "G" logo + "Continue with Google"
- Secondary style (bordered, bg-background-secondary)
- Loading + disabled state
- Arrow function component

### 2d. New `components/auth/auth-divider.tsx`

- Horizontal line — "or" — horizontal line
- Reuses theme colors

### 2e. New `assets/images/google-logo.png`

- Multicolor Google "G" logo

### 2f. `app/(auth)/login.tsx`

After `</FormProvider>`, before "Don't have an account?" link:

```tsx
<AuthDivider />
<GoogleSignInButton onPress={onGoogleSignIn} loading={loading} />
```

### 2g. `app/(auth)/signup.tsx` — same pattern

---

## Files Summary

| File                                        | Action                                         |
| ------------------------------------------- | ---------------------------------------------- |
| `app.json`                                  | Add google-signin plugin                       |
| `.env`                                      | Add Google client IDs                          |
| `types/auth.ts`                             | Add `signInWithGoogle` to interface            |
| `contexts/auth-context.tsx`                 | Configure GoogleSignin, add `signInWithGoogle` |
| `components/auth/google-sign-in-button.tsx` | **New** — Google button                        |
| `components/auth/auth-divider.tsx`          | **New** — "or" divider                         |
| `assets/images/google-logo.png`             | **New** — Google logo asset                    |
| `app/(auth)/login.tsx`                      | Add Google button + divider                    |
| `app/(auth)/signup.tsx`                     | Add Google button + divider                    |

---

## Verification

1. `npx expo prebuild --clean && npx expo run:ios`
2. Login screen → tap "Continue with Google"
3. Native Google sign-in sheet appears
4. Select account → redirected back, authenticated
5. Supabase Dashboard > Auth > Users — user with Google provider visible
6. Sign out → sign in again → works
7. Repeat on signup screen

---

## Prerequisites (user action before implementation)

1. Create **iOS OAuth Client** in Google Cloud Console (Bundle ID: `com.lazarspasic96.clip2fit`)
2. Create **Android OAuth Client** in Google Cloud Console (Package: `com.lazarspasic96.clip2fit` + SHA-1)
3. Update Supabase Dashboard Google provider with comma-separated client IDs
4. Provide the iOS Client ID and Web Client ID values for `.env`

---

Sources:

- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [@react-native-google-signin setup](https://react-native-google-signin.github.io/docs/setting-up/expo)
- [OAuth client IDs guide](https://react-native-google-signin.github.io/docs/setting-up/get-config-file)
- [Expo Google Authentication](https://docs.expo.dev/guides/google-authentication/)
- [Supabase Native Mobile Auth Blog](https://supabase.com/blog/native-mobile-auth)

google: 911676643313-572044odd2f6nqqtppd8sgp3sqjsb3b1.apps.googleusercontent.com

ios: 911676643313-rq7ho5qv199r5ls7msvb7dma35idg300.apps.googleusercontent.com

911676643313-b9tshuvrbca7dhma3tbaq4maaalt1c14.apps.googleusercontent.com,911676643313-rq7ho5qv199r5ls7msvb7dma35idg300.apps.googleusercontent.com,911676643313-572044odd2f6nqqtppd8sgp3sqjsb3b1.apps.googleusercontent.com
