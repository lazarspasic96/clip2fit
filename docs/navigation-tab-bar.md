# Navigation Tab Bar Architecture

This project uses a hybrid tabs setup:

- iOS 26+ and Android: `expo-router/unstable-native-tabs`
- Older iOS: `expo-router` JS `Tabs` with `expo-blur` `BlurView` background

## Goals

- Keep the tab bar readable on all supported OS versions.
- Preserve liquid glass behavior when it is available and appropriate.
- Avoid content overlap at the bottom of long lists.
- Keep behavior centralized and easy to maintain.

## Runtime Policy

Source of truth: `hooks/use-tab-bar-policy.ts` and `app/(protected)/(tabs)/_layout.tsx`.

Decision inputs:

- `Platform.OS`
- `isLiquidGlassAvailable()` from `expo-glass-effect`
- `AccessibilityInfo.isReduceTransparencyEnabled()`

Decision outputs:

- `useExpoBlurTabsFallback`
- `backgroundColor`
- `blurEffect`
- `disableScrollEdgeTransparency`
- `minimizeBehavior`

## Mode Matrix

1. iOS + Liquid Glass available + Reduce Transparency OFF:
- Mode: `ios-liquid`
- Uses system liquid appearance.
- Scroll-edge transparency is explicitly disabled to avoid the transparent-footer issue.
- Minimize behavior is enabled (`onScrollDown`).

2. iOS without Liquid Glass support:
- Uses JS `Tabs` with `tabBarBackground={<BlurView ... />}` from `expo-blur`.
- Keeps dark overlay for contrast.

3. iOS with Reduce Transparency ON:
- Uses readable solid dark tab background (no blur).

4. Android:
- Mode: `android-solid`
- Uses a solid background (`Colors.background.secondary`).
- No transparent/blur tab bar behavior.

5. Web:
- Mode: `web-solid`
- Uses a solid background fallback.

## Why Android Is Intentionally Solid

`NativeTabs` does not provide an `expo-blur` tab-bar background path on Android in this setup.
Keeping Android on `NativeTabs` preserves native behavior and avoids a full tab-system split across both platforms.

## Shared Metrics Contract

Source of truth: `constants/tab-bar.ts`.

- `TAB_BAR_HEIGHT`
- `TAB_BAR_FLOATING_OFFSET`
- `TAB_CONTENT_BOTTOM_CLEARANCE`

These values are used by:

- Tab-screen scroll containers (`Home`, `Schedule`, `Library`, `Stats`)
- Floating conversion pill offset logic

## Maintenance Rules

1. Do not add per-screen ad-hoc bottom clearances in tabs.
2. Update `constants/tab-bar.ts` first, then consume constants everywhere.
3. Keep all tab appearance decisions inside `useTabBarPolicy` and tab rendering branch logic in tabs `_layout`.
4. If Android blur is required later, treat it as an architecture change (move Android to JS `Tabs` too).
