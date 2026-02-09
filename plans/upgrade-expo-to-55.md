# Expo SDK 54 → 55 Upgrade Plan

## Context

Upgrade from Expo SDK 54 (RN 0.81.5, React 19.1) to SDK 55 preview (RN 0.83.1, React 19.2). SDK 55 removes Legacy Architecture support, bumps all expo packages to ^55.x versioning. NativeWind v4 → v5 migration required (Tailwind CSS v3 → v4).

**Status:** SDK 55 is currently `55.0.0-preview.10` — install with `expo@next`.

---

## Phase 1: Pre-Upgrade Prep

1. Commit all pending changes (dirty working tree currently)
2. Create branch: `git checkout -b upgrade/sdk-55`
3. Tag: `git tag pre-sdk55-upgrade`

---

## Phase 2: Core SDK Upgrade

### Step 1 — Install SDK 55

```bash
npx expo install expo@next --fix
```

Upgrades: expo → ^55, all expo-* packages → ^55.x, React → 19.2, RN → 0.83.1, react-native-screens → ~4.20.0

### Step 2 — app.json changes

**File:** `app.json`

- Remove `"newArchEnabled": true` (field removed in SDK 55 — New Arch is the only option now)
- Keep `experiments.typedRoutes` and `experiments.reactCompiler` — still valid

### Step 3 — Remove unused dependency

```bash
npm uninstall @expo/vector-icons
```

Zero imports in codebase — confirmed unused. Project uses `expo-symbols` instead.

### Step 4 — Remove `expo-constants` if still in package.json

`expo-constants` is now implicit in SDK 55 — remove from dependencies if `npx expo install --fix` doesn't handle it.

---

## Phase 3: NativeWind v4 → v5 + Tailwind v3 → v4

This is the biggest part of the upgrade.

### Step 1 — Install new packages

```bash
npm uninstall nativewind tailwindcss
npx expo install nativewind@preview react-native-css@preview
npx expo install --dev tailwindcss@next @tailwindcss/postcss postcss
```

### Step 2 — Add lightningcss override to package.json

```json
{
  "overrides": {
    "lightningcss": "1.30.1"
  }
}
```

### Step 3 — Update `babel.config.js`

**Before:**
```js
presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']
```

**After:**
```js
presets: ['babel-preset-expo']
```

NativeWind v5 uses import rewriting instead of JSX transform — no babel config needed.

### Step 4 — Update `metro.config.js`

**Before:**
```js
module.exports = withNativeWind(config, { input: './global.css' })
```

**After:**
```js
module.exports = withNativeWind(config)
```

No second argument in v5.

### Step 5 — Create `postcss.config.mjs` (NEW file)

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Step 6 — Update `global.css`

**Before:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After (includes Step 7 — full @theme migration):**

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";

@source "../app/**/*.{js,jsx,ts,tsx}";
@source "../components/**/*.{js,jsx,ts,tsx}";

@theme {
  /* Colors — background */
  --color-background-primary: #09090b;
  --color-background-secondary: #18181b;
  --color-background-tertiary: #27272a;
  --color-background-button-primary: #84cc16;
  --color-background-button-secondary: #27272a;
  --color-background-badge-success: rgba(190,242,100,0.1);
  --color-background-badge-error: rgba(248,113,113,0.1);
  --color-background-badge-neutral: rgba(212,212,216,0.1);

  /* Colors — content */
  --color-content-primary: #fafafa;
  --color-content-secondary: #a1a1aa;
  --color-content-tertiary: #71717a;
  --color-content-button-primary: #18181b;
  --color-content-badge-success: #bef264;
  --color-content-badge-error: #f87171;
  --color-content-badge-info: #0284c7;

  /* Colors — border */
  --color-border-primary: #27272a;
  --color-border-secondary: #3f3f46;

  /* Colors — brand */
  --color-brand-logo: #bef264;
  --color-brand-accent: #84cc16;

  /* Fonts */
  --font-inter: "Inter_400Regular";
  --font-inter-medium: "Inter_500Medium";
  --font-inter-semibold: "Inter_600SemiBold";
  --font-inter-bold: "Inter_700Bold";
  --font-onest: "Onest_400Regular";

  /* Font sizes (with line-height) */
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

### Step 8 — Update `nativewind-env.d.ts`

**Before:**
```ts
/// <reference types="nativewind/types" />
```

**After:**
```ts
/// <reference types="react-native-css/types" />
```

### Step 9 — Delete `tailwind.config.js`

No longer needed — all config is in `global.css` @theme block.

---

## Phase 4: Fix Breaking Changes

### letterSpacing from fontSize config

Old tailwind.config.js had `letterSpacing` values in fontSize definitions (e.g., xs: `0.06em`, sm: `0.02em`, 5xl: `-0.02em`). Tailwind v4 @theme doesn't support compound fontSize definitions with letterSpacing.

**No `tracking-*` classes used in codebase** — safe to drop letterSpacing from migration. If needed later, add `--letter-spacing-*` CSS vars.

### Shadow classes

NativeWind v5 uses `boxShadow` CSS property instead of individual shadow props. May cause visual differences — test carefully.

### elevation / cssInterop

**Not used** in codebase — no migration needed for either.

---

## Phase 5: Clean Install & Verify

```bash
rm -rf node_modules .expo package-lock.json
npm install
npx expo-doctor
npx expo start --clear
```

---

## Phase 6: Testing Checklist

### Build
- [ ] `npx expo start --clear` — Metro starts without errors
- [ ] iOS simulator — app launches, no crashes
- [ ] Android emulator — app launches, no crashes
- [ ] Web — `npx expo start --web` works

### Styles
- [ ] All NativeWind className styles render correctly
- [ ] Custom colors (background-primary, content-secondary, etc.) work
- [ ] Custom fonts (font-inter, font-inter-bold, etc.) load
- [ ] Custom font sizes render correctly
- [ ] Shadows render correctly
- [ ] Border radius values correct

### Functionality
- [ ] Auth flow: login, signup, Google Sign-In
- [ ] Onboarding flow completes
- [ ] Tab navigation works
- [ ] Settings screen renders
- [ ] Keyboard handling (KeyboardAvoidingView, KeyboardAwareScrollView)
- [ ] Haptics work
- [ ] SQLite storage (session persistence)
- [ ] Reanimated animations smooth

### TypeScript & Lint
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (pre-existing apostrophe errors expected)

---

## Files to Modify

| File | Action |
|---|---|
| `package.json` | SDK 55 deps, NativeWind v5, remove @expo/vector-icons, add lightningcss override |
| `app.json` | Remove `newArchEnabled` |
| `babel.config.js` | Remove NativeWind JSX transform + preset |
| `metro.config.js` | Remove second arg from withNativeWind |
| `global.css` | Tailwind v4 imports + @theme block with full design system |
| `postcss.config.mjs` | NEW — @tailwindcss/postcss plugin |
| `nativewind-env.d.ts` | Update reference to react-native-css/types |
| `tailwind.config.js` | DELETE — migrated to CSS |

---

## Rollback

```bash
git checkout main
# or
git reset --hard pre-sdk55-upgrade
```

---

## Unresolved Questions

1. **Tailwind v4 content/source** — Verify `@source` directives work in NativeWind v5 or if content scanning is handled differently by the metro plugin.
2. **NativeWind v5 preset** — Old config used `presets: [require('nativewind/preset')]`. With tailwind.config.js deleted, verify the nativewind/metro plugin handles this automatically.
3. **SDK 55 stable release timing** — Currently preview.10. If stable drops during implementation, switch from `expo@next` to `expo@latest`.

## Sources

- [Expo SDK 55 Beta Announcement](https://expo.dev/changelog/sdk-55-beta)
- [NativeWind v5 Installation](https://www.nativewind.dev/v5/getting-started/installation)
- [NativeWind v4 → v5 Migration](https://www.nativewind.dev/v5/guides/migrate-from-v4)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [React Native 0.83 Release](https://reactnative.dev/blog/2025/12/10/react-native-0.83)
