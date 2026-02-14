# Expo SDK 54 → 55 + NativeWind v4 → v5 + Tailwind v3 → v4 Upgrade Plan

## Context

Upgrade the Clip2Fit Expo app from SDK 54 (RN 0.81.5, React 19.1) to SDK 55 (RN 0.83.1, React 19.2). Simultaneously migrate NativeWind v4 → v5 and Tailwind CSS v3 → v4 (CSS-first config). SDK 55 removes Legacy Architecture support, introduces ^55.x package versioning, and requires new NativeWind architecture (import rewriting instead of JSX transform).

**Risk assessment:** LOW-MEDIUM. Codebase is modern and well-structured. No deprecated APIs (expo-av, AsyncStorage) in use. Main complexity is the NativeWind/Tailwind migration.

**Pre-existing plan:** `plans/upgrade-expo-to-55.md` exists with a solid foundation — this plan refines and expands it.

---

## Phase 1: Pre-Upgrade Prep

1. Commit all pending changes (dirty working tree)
2. Create branch: `git checkout -b upgrade/sdk-55`
3. Tag current state: `git tag pre-sdk55-upgrade`

---

## Phase 2: Core SDK Upgrade

### Step 1 — Install SDK 55

```bash
npx expo install expo@next --fix
```

This upgrades:
- `expo` → ~55.x
- All `expo-*` packages → ^55.x (new versioning scheme)
- `react` → 19.2.0
- `react-native` → 0.83.1
- `react-native-screens` → ~4.20.0
- `expo-router` → ~7.x (new major)
- `react-native-reanimated` — let `--fix` resolve the compatible version

### Step 2 — app.json changes

**File:** `app.json`

- **Remove** `"newArchEnabled": true` — field removed in SDK 55, New Arch is the only option
- **Keep** `experiments.typedRoutes` and `experiments.reactCompiler` — still valid
- **Check** if `notification` field exists (it doesn't — safe)

### Step 3 — Remove unused `@expo/vector-icons`

```bash
npm uninstall @expo/vector-icons
```

Confirmed: zero imports in the codebase. All icons use `lucide-react-native`.

### Step 4 — Remove implicit `expo-constants`

`expo-constants` is implicit in SDK 55. Remove from `dependencies` if `--fix` doesn't handle it.

### Step 5 — Run diagnostics

```bash
npx expo-doctor
```

Fix any flagged issues before continuing.

---

## Phase 3: NativeWind v4 → v5 + Tailwind v3 → v4

This is the largest change. NativeWind v5 uses import rewriting (not JSX transform), requires `react-native-css`, and uses Tailwind CSS v4 CSS-first configuration.

### Step 1 — Uninstall old packages, install new

```bash
npm uninstall nativewind tailwindcss
npx expo install nativewind@preview react-native-css@preview
npx expo install --dev tailwindcss@next @tailwindcss/postcss postcss
```

### Step 2 — Add lightningcss resolution to `package.json`

```json
{
  "overrides": {
    "lightningcss": "1.30.1"
  }
}
```

### Step 3 — Update `babel.config.js`

**File:** `babel.config.js`

Before:
```js
presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']
```

After:
```js
presets: ['babel-preset-expo']
```

NativeWind v5 uses import rewriting — no babel integration needed. Since this file only contains the preset, consider deleting it entirely (Expo handles babel-preset-expo automatically in SDK 55).

### Step 4 — Update `metro.config.js`

**File:** `metro.config.js`

Before:
```js
module.exports = withNativeWind(config, { input: './global.css' })
```

After:
```js
module.exports = withNativeWind(config)
```

No second argument in v5. `withNativeWind` auto-discovers global.css.

### Step 5 — Create `postcss.config.mjs` (NEW file)

**File:** `postcss.config.mjs`

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Step 6 — Migrate `global.css` (Tailwind v3 → v4 + full @theme)

**File:** `global.css`

Replace all content with:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";

@source "../app/**/*.{js,jsx,ts,tsx}";
@source "../components/**/*.{js,jsx,ts,tsx}";

@theme {
  /* Colors - background */
  --color-background-primary: #09090b;
  --color-background-secondary: #18181b;
  --color-background-tertiary: #27272a;
  --color-background-button-primary: #84cc16;
  --color-background-button-secondary: #27272a;
  --color-background-badge-success: rgba(190,242,100,0.1);
  --color-background-badge-error: rgba(248,113,113,0.1);
  --color-background-badge-neutral: rgba(212,212,216,0.1);

  /* Colors - content */
  --color-content-primary: #fafafa;
  --color-content-secondary: #a1a1aa;
  --color-content-tertiary: #71717a;
  --color-content-button-primary: #18181b;
  --color-content-badge-success: #bef264;
  --color-content-badge-error: #f87171;
  --color-content-badge-info: #0284c7;

  /* Colors - border */
  --color-border-primary: #27272a;
  --color-border-secondary: #3f3f46;

  /* Colors - brand */
  --color-brand-logo: #bef264;
  --color-brand-accent: #84cc16;

  /* Fonts */
  --font-inter: "Inter_400Regular";
  --font-inter-medium: "Inter_500Medium";
  --font-inter-semibold: "Inter_600SemiBold";
  --font-inter-bold: "Inter_700Bold";
  --font-onest: "Onest_400Regular";

  /* Font sizes */
  --font-size-xs: 12px;
  --line-height-xs: 16px;
  --font-size-sm: 14px;
  --line-height-sm: 20px;
  --font-size-base: 16px;
  --line-height-base: 24px;
  --font-size-lg: 18px;
  --line-height-lg: 28px;
  --font-size-xl: 20px;
  --line-height-xl: 28px;
  --font-size-2xl: 24px;
  --line-height-2xl: 32px;
  --font-size-3xl: 30px;
  --line-height-3xl: 36px;
  --font-size-4xl: 36px;
  --line-height-4xl: 40px;
  --font-size-5xl: 48px;
  --line-height-5xl: 48px;

  /* Border radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 8px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Box shadow */
  --shadow-sm: 0px 1px 2px 0px rgba(0,0,0,0.05);
  --shadow-ring: 0 0 0 1px #27272a;
  --shadow-badge-success: 0 0 0 3px rgba(190,242,100,0.1);
  --shadow-badge-error: 0 0 0 3px rgba(248,113,113,0.1);
}
```

**Notes on migration:**
- `@tailwind` directives → `@import` with layers
- `tailwind.config.js` theme → `@theme` CSS variables
- `@source` directives tell Tailwind where to scan for class usage
- `letterSpacing` values from old fontSize config are dropped — no `tracking-*` classes used in codebase
- `fontWeight` values from old fontSize config are dropped — weights are set via font-family classes

### Step 7 — Update `nativewind-env.d.ts`

**File:** `nativewind-env.d.ts`

Before:
```ts
/// <reference types="nativewind/types" />
```

After:
```ts
/// <reference types="react-native-css/types" />
```

### Step 8 — Delete `tailwind.config.js`

All configuration now lives in `global.css` @theme block. File is no longer needed.

---

## Phase 4: Verify Third-Party Package Compatibility

These packages need verification after upgrade (run `npx expo install --fix` to get compatible versions):

| Package | Current | Notes |
|---|---|---|
| `@gorhom/bottom-sheet` | ^5.2.8 | Check for RN 0.83 compat, likely fine |
| `@react-native-google-signin/google-signin` | ^16.1.1 | New Arch only — already using it, should be fine |
| `expo-share-intent` | ^5.1.1 | Third-party — check GitHub for SDK 55 support |
| `react-native-keyboard-controller` | 1.18.5 | Upgrade to ~1.20.x for RN 0.83 |
| `@shopify/flash-list` | 2.0.2 | Likely needs `npx expo install --fix` |
| `react-native-svg` | 15.12.1 | Let `--fix` resolve |
| `lucide-react-native` | ^0.563.0 | Pure JS — should work |
| `zod` | ^4.3.6 | Pure JS — no issues |
| `react-hook-form` | ^7.71.1 | Pure JS — no issues |
| `@tanstack/react-query` | ^5.90.21 | Pure JS — no issues |

---

## Phase 5: Handle NativeWind v5 Shadow Breaking Change

NativeWind v5 uses `boxShadow` CSS property instead of individual shadow props (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`).

**Action:** After metro starts, visually check all components using shadow classes:
- `shadow-sm` — used in cards
- `shadow-ring` — used for focus rings
- `shadow-badge-*` — used in badges

If shadows break, may need to adjust the shadow CSS variable syntax for NativeWind v5's boxShadow format.

---

## Phase 6: Clean Install & Build

```bash
rm -rf node_modules .expo package-lock.json
npm install
npx expo-doctor
npx expo start --clear
```

If prebuild needed (native module changes):
```bash
npx expo prebuild --clean
```

---

## Phase 7: Testing Checklist

### Build Verification
- [ ] `npx expo start --clear` — Metro starts without errors
- [ ] iOS simulator — app launches, no crashes
- [ ] Android emulator — app launches, no crashes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (pre-existing apostrophe errors expected)

### Style Verification (NativeWind v5)
- [ ] All `className` styles render correctly
- [ ] Custom colors work: `bg-background-primary`, `text-content-secondary`, etc.
- [ ] Custom fonts load: `font-inter`, `font-inter-bold`, etc.
- [ ] Custom font sizes render: `text-xs`, `text-2xl`, etc.
- [ ] Shadows render correctly (boxShadow migration)
- [ ] Border radius values correct: `rounded-xs`, `rounded-xl`, etc.

### Functionality Verification
- [ ] Auth flow: login, signup, Google Sign-In
- [ ] Onboarding flow completes
- [ ] Tab navigation works (custom tab bar)
- [ ] Home screen renders
- [ ] Schedule screen renders
- [ ] My Workouts screen renders
- [ ] Settings screen renders
- [ ] Share intent receiving works
- [ ] Keyboard handling (KeyboardAvoidingView, KeyboardAwareScrollView)
- [ ] Haptics work
- [ ] Bottom sheets open/close correctly
- [ ] All Reanimated animations smooth (12 files use it)
- [ ] Flash list scrolling in library

---

## Files Modified Summary

| File | Action |
|---|---|
| `package.json` | SDK 55 deps, NativeWind v5, react-native-css, remove @expo/vector-icons, add lightningcss override |
| `app.json` | Remove `newArchEnabled` |
| `babel.config.js` | Remove NativeWind presets (or delete file entirely) |
| `metro.config.js` | Remove second arg from withNativeWind |
| `global.css` | Tailwind v4 imports + full @theme block |
| `postcss.config.mjs` | NEW — @tailwindcss/postcss plugin |
| `nativewind-env.d.ts` | Update types reference to react-native-css |
| `tailwind.config.js` | DELETE |

---

## Rollback Plan

```bash
git checkout main
# or
git reset --hard pre-sdk55-upgrade
```

---

## Unresolved Questions

1. **SDK 55 stable vs beta** — Currently `55.0.0-preview.10`. If stable has shipped by implementation time, use `expo@latest` instead of `expo@next`.
2. **expo-share-intent SDK 55** — Third-party package. Need to verify v5.x supports RN 0.83. If not, may need to pin or find a workaround.
3. **@source directives** — Verify `@source` works with NativeWind v5's metro plugin for content scanning. May need adjustment if classes aren't being detected.
4. **Shadow rendering** — NativeWind v5's boxShadow may render differently from v4's individual shadow props. Visual QA needed.

## Sources

- [Expo SDK 55 Beta Changelog](https://expo.dev/changelog/sdk-55-beta)
- [NativeWind v5 Installation](https://www.nativewind.dev/v5/getting-started/installation)
- [NativeWind v4 → v5 Migration](https://www.nativewind.dev/v5/guides/migrate-from-v4)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [React Native 0.83 Release](https://reactnative.dev/blog/2025/12/10/react-native-0.83)
- [Expo SDK Upgrade Walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo SDK 55 Docs](https://docs.expo.dev/versions/v55.0.0/)
