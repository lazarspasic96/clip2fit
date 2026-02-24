# Fix Process URL Screen Bugs

## Bug 1: Circle content overflow

**Root cause:** In `hero-progress-ring.tsx` (line 81), `<Svg>` uses `className="absolute"` — NativeWind's `absolute` class may not apply `position: absolute` properly to the SVG component (it's not a standard RN View). When the SVG doesn't go absolute, it occupies 120x120 in the flow layout, pushing the badge+percentage below the circle boundary.

Same pattern in `mini-progress-ring.tsx` (line 46).

**Fix:** Restructure both rings so SVG and content each sit inside their own absolutely-positioned `<View>` wrapper. This guarantees overlay regardless of SVG styling quirks.

### hero-progress-ring.tsx
- Wrap `<Svg>` in `<View className="absolute inset-0">` instead of applying `className="absolute"` directly on Svg
- Wrap the badge+percentage `<View>` in `<View className="absolute inset-0 items-center justify-center">` so it's always visually centered on the ring

### mini-progress-ring.tsx
- Same pattern: wrap `<Svg>` in `<View className="absolute inset-0">`
- PlatformBadge is already the sole flow child and works, but make it consistent by also wrapping it in an absolute-centered container

---

## Bug 2: Minimize doesn't dismiss the modal

**Root cause:** In `process-url-content.tsx`, `handleMinimize` calls `safeGoBack()` which uses `router.back()` / `router.replace('/')`.

`process-url` is presented as `fullScreenModal`. Two possible failures:
1. `router.canGoBack()` returns `false` for fullScreenModal (separate nav stack) → falls through to `router.replace('/')`
2. `router.replace('/')` inside a modal replaces the route WITHIN the modal stack, not the parent stack — renders tabs inside the modal frame = looks like "same screen"

**Fix:** Use `router.dismiss()` in `handleMinimize` instead of `safeGoBack()`. `dismiss()` is Expo Router's dedicated method for closing modals/sheets and properly pops the modal from the parent stack.

### process-url-content.tsx
- `handleMinimize`: replace `safeGoBack()` with `router.dismiss()`

---

## Files to change
1. `components/processing/hero-progress-ring.tsx` — wrap SVG + content in absolute Views
2. `components/processing/mini-progress-ring.tsx` — same pattern
3. `components/processing/process-url-content.tsx` — use `router.dismiss()` for minimize
