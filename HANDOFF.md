# Handoff: Paywall Implementation + App Store Production Launch

## Goal

Ship Clip2Fit to the iOS App Store with a working paywall and RevenueCat subscription infrastructure. The app is fully built (video-to-workout conversion pipeline works reliably). What's missing: finish RevenueCat dashboard config, legal pages, analytics events, and App Store submission.

Full design doc: `~/.gstack/projects/lazarspasic96-clip2fit/lazarspasic-main-design-20260406-222237.md`
Prior monetization plan: `plans/plan-monetization-premium-strategy.md`
Paywall update plan: `plans/plan-paywall-pricing-update.md`

## Key Decisions Made (DO NOT revisit)

- **Hard paywall** — 1 free conversion during onboarding demo, everything else gated
- **Pricing** — $7.99/week, $34.99/yr with 7-day free trial (pre-selected). NO monthly or lifetime plans.
- **Two plans only** — Weekly + Annual. Lifetime was removed.
- **RevenueCat** — Real payments from day one, no mock provider
- **Custom paywall** — Keep the custom-built Receipt variant paywall. Do NOT use RevenueCat's built-in Paywall UI.
- **iOS-only launch** — Google Play comes later
- **Onboarding restructured** — 11 screens merged into 3, demo conversion + paywall added as steps 4-5 (all done)
- **Paywall design** — Receipt variant (Product-as-proof). Mini workout card with blurred exercises, NOT icon+title+subtitle rows
- **Entitlement ID** — `premium` in code (`types/subscription.ts`). Matches RevenueCat dashboard (`entle1e0c2774c`).

## Free vs Premium Tiers

**FREE:** 1 demo conversion (onboarding), exercise catalog, manual workout creation (up to 3), workout tracking, PR tracking, stats, schedule, library capped at 3 workouts

**PREMIUM:** Unlimited video conversions + unlimited workout library

## Current Progress

### Phase 1: Onboarding Restructure — DONE

Merged 11 onboarding screens into 3. Old screens deleted.

### Phase 2: RevenueCat SDK + Subscription Context — DONE

**Installed:** `react-native-purchases`

**Files created:**
- `types/subscription.ts` — `SubscriptionPlan` (`weekly | annual`), `SubscriptionTier` (`free | premium`), `PurchaseResult`, plan product IDs (`clip2fit.weekly`, `clip2fit.annual`), display metadata (prices, labels, tags), `FREE_WORKOUT_LIMIT = 3`
- `contexts/subscription-context.tsx` — `SubscriptionProvider` + `useSubscription()` hook

**Files modified:**
- `app/_layout.tsx` — wrapped app with `<SubscriptionProvider>` (inside Auth, outside Conversion)

**Context provides:**
- `isPremium` / `tier` — derived from RevenueCat entitlements (entitlement ID: `premium`)
- `purchase(plan)` — buys a package by plan type via RevenueCat offerings
- `restore()` — restores purchases, returns success/failure
- `initialized` / `loading` — state flags
- Auto-syncs RevenueCat identity with Supabase auth user via `Purchases.logIn(user.id)`
- Listens for subscription changes (renewals, cancellations) via `addCustomerInfoUpdateListener`

**Env var:** `EXPO_PUBLIC_REVENUECAT_APPLE_KEY` — set in `.env` and EAS secrets

### Phase 3: Paywall Screen — DONE

**Files created:**
- `components/paywall/platform-chips.tsx` — TikTok, Instagram, YouTube brand SVG chips with real logos/colors
- `components/paywall/workout-preview-card.tsx` — Mini workout card: 3 visible exercises + 2 blurred/locked, lock icon footer
- `components/paywall/plan-card.tsx` — Radio-style plan selector with Reanimated spring press animation
- `components/paywall/paywall-content.tsx` — Full Receipt variant layout (headline, chips, preview card, unlock message, plan cards, CTA, restore, terms, skip)
- `app/(protected)/onboarding/paywall.tsx` — Onboarding step 5, full-screen paywall

**Paywall behavior:**
- Onboarding mode: full-screen, no close button, "Continue with limited features" at bottom
- Feature gate mode: formSheet at 0.85 detent, dismissible with close X (Phase 5)
- Both purchase and skip call `complete()` to finish onboarding
- Annual plan pre-selected with "BEST VALUE" tag and 7-day free trial
- CTA label: "Start Free Trial" for annual, "Subscribe Weekly" for weekly
- Restore Purchases with loading state and result alert
- Purchase errors shown in Alert, cancelled purchases silently handled

### Phase 4: Demo Conversion Step — DONE

**Files created:**
- `app/(protected)/onboarding/demo-conversion.tsx` — Onboarding step 4

**Demo conversion screen features:**
- URL input with paste button (same UI pattern as main conversion flow)
- Supported platform icons (TikTok, Instagram, YouTube) from `components/ui/platform-icons.tsx`
- "Try with a sample video" button (uses `https://www.tiktok.com/@jeff_nippard/video/7325187706016040198`)
- "Skip for now" at bottom to go straight to paywall
- Inline processing view with existing `HeroProgressRing` + stage messages from `ConversionContext`
- Error state with tap-to-retry
- On completion: shows brief success animation (1.5s), then auto-navigates to paywall
- Leverages existing `ConversionContext` — no duplicate conversion logic

**Files modified:**
- `app/(protected)/onboarding/preferences.tsx` — no longer calls `complete()`, navigates to `demo-conversion` instead. Removed `useCompleteOnboarding` import.
- `app/(protected)/onboarding/_layout.tsx` — added `demo-conversion` + `paywall` screens. Progress bar + step counter hidden on both (they handle their own safe area). `PROGRESS_SCREENS` array (3 items) for progress bar, `FULL_SCREEN_STEPS` set for layout logic.

### Current Onboarding Flow (5 steps)

| Step | Screen | File | Status |
|------|--------|------|--------|
| 1 | **About You** — name, DOB, gender, height, weight (all optional) | `about-you.tsx` | DONE |
| 2 | **Training Profile** — goal + experience + activity level (required) | `training-profile.tsx` | DONE |
| 3 | **Preferences** — location, equipment, frequency, duration + optional styles/focus/injuries | `preferences.tsx` | DONE |
| 4 | **Demo Conversion** — paste URL or sample video, inline progress | `demo-conversion.tsx` | DONE |
| 5 | **Paywall** — Receipt variant, full-screen hard paywall | `paywall.tsx` | DONE |

### Phase 5: Feature Gating — DONE

**Files created:**
- `hooks/use-premium-gate.ts` — `usePremiumGate()` hook providing `{ isPremium, requirePremium }`. `requirePremium(callback)` runs callback if premium, opens paywall sheet if free.
- `app/(protected)/sheets/paywall.tsx` — Dismissible paywall sheet (formSheet, 0.85/1 detent, close X button). Reuses `PaywallContent` with `onComplete` that dismisses the sheet.
- `components/profile/subscription-card.tsx` — Subscription management card for profile screen. Shows current plan (Free/Premium), Crown icon, upgrade CTA or manage subscription link (opens App Store subscriptions), restore purchases button.

**Files modified:**
- `app/(protected)/_layout.tsx` — Registered `sheets/paywall` route with `sheetAllowedDetents: [0.85, 1]`
- `types/subscription.ts` — Added `FREE_WORKOUT_LIMIT = 3` constant
- `components/home/import-from-socials-card.tsx` — "Import from socials" card now gated via `requirePremium`
- `components/home/bottom-action-buttons.tsx` — "Import workout from video" button gated via `requirePremium` (manual entry remains free)
- `app/(protected)/add-workout.tsx` — "From URL" and "From Video" options gated via `requirePremium` (manual entry remains free)
- `app/_layout.tsx` — `ShareIntentHandler` checks `isPremium` before starting conversion; free users see paywall sheet instead
- `app/(protected)/workout-builder.tsx` — Save action checks workout count against `FREE_WORKOUT_LIMIT`; at cap, free users see paywall sheet
- `app/(protected)/(tabs)/my-workouts.tsx` — Shows "X/3 workouts" counter and "Upgrade for unlimited" text for free users at cap
- `components/profile/profile-dashboard.tsx` — Added `SubscriptionCard` between hero card and profile sections

**Gating matrix:**

| Action | Free | Premium |
|--------|------|---------|
| Video conversions (URL/video/share) | Blocked → paywall sheet | Unlimited |
| Manual workout creation | Up to 3 (library cap) | Unlimited |
| Workout library | Capped at 3 | Unlimited |
| Exercise catalog browsing | Full access | Full access |
| Workout tracking/PRs/stats | Full access | Full access |

## Where We Left Off

**Phases 1-5 are complete. Code changes for removing lifetime plan and updating pricing are done.**

### RevenueCat Dashboard — DONE (via MCP API, Apr 7 2026)

All configured programmatically. Old "Test Store" app and "Clip2Fit Pro" entitlement cleaned up.

| Item | Value | ID |
|------|-------|----|
| **Project** | Clip2Fit | `proj6132a239` |
| **App** | Clip2Fit iOS (Apple App Store) | `app7dedc56a27` |
| **Bundle ID** | `com.lazarspasic96.clip2fit` | — |
| **Shared Secret** | Configured | `bea6f83bfc054ca6a091137249720799` |
| **Entitlement** | `premium` (lookup_key) | `entle1e0c2774c` |
| **Product: Weekly** | `clip2fit.weekly` | `prodf1deb98cb1` |
| **Product: Annual** | `clip2fit.annual` | `prodff1af85286` |
| **Offering** | Default (current) | `ofrng37384b218a` |
| **Package: Weekly** | `$rc_weekly` → `clip2fit.weekly` | `pkge8e6336129a` |
| **Package: Annual** | `$rc_annual` → `clip2fit.annual` | `pkge9920a94690` |
| **Public API Key** | `appl_fWxradqYFONPhcDXHRhEpkjxDPH` | — |

**Cleanup done:**
- Old "Clip2Fit Pro" entitlement (`entl06799461b3`) — products detached, now empty/inert (archive API failed due to MCP bug, can be archived manually in dashboard)
- Old Test Store products (`weekly`/`yearly`) detached from packages

### Env Var — DONE
- `EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_fWxradqYFONPhcDXHRhEpkjxDPH` set in both:
  - `.env` (local)
  - EAS secrets (all environments: development, preview, production)

### App Store Connect Status
- **Subscription group** "Clip2Fit Premium" created
- **`clip2fit.weekly`** — created, $7.99/week, localization added
- **`clip2fit.annual`** — created, $34.99/year with 7-day free trial, localization added
- **Lifetime** — removed (not creating this product)
- **App-Specific Shared Secret** — generated and configured in RevenueCat
- **Review screenshots** — not yet uploaded (need TestFlight build first)

### App Store Connect Agreements — BLOCKING SANDBOX TESTING
- **Free Apps Agreement** — Active
- **Paid Apps Agreement** — Status: **Pending User Info**
  - Tax form (W-8BEN) — submitted, in progress
  - Bank account — **NOT YET ADDED**
- **Digital Services Act (DSA)** — submitted as trader, status: In Review
- **License Agreement** — accepted (yellow banner resolved)
- **IMPORTANT:** Sandbox purchases will NOT work until the Paid Apps Agreement is **Active**. Both bank account and tax form must be completed.

### Sandbox Tester — CREATED
- Created in App Store Connect → Users and Access → Sandbox → Testers
- Sign in on iPhone: Settings → App Store → Sandbox Account (bottom)

### Dev Build — DONE
- Built via `eas build --profile development --platform ios`

### StoreKit Configuration File — CREATED (for local testing)
- `ios/Clip2FitProducts.storekit` — allows local testing without App Store Connect
- To use: Open Xcode → Product → Scheme → Edit Scheme → Run → Options → StoreKit Configuration → select `Clip2FitProducts.storekit`
- This bypasses App Store Connect entirely — works on simulator, no sandbox account needed
- Use this for development while waiting for Paid Apps Agreement to activate

## What Worked

- **Hard paywall data** — RevenueCat 2026 report validates: 10.7% conversion vs 2.1% freemium, 21% higher 1-year LTV
- **Codex cold read** — Caught "no direct competitor" premise error (real competitors are saved TikToks, Notes, ChatGPT, Strong). Founder agreed and revised.
- **Spec review loop** — Subagent found 12 real issues (subscription lapse behavior, restore flow, analytics SDK ambiguity, Apple rejection contingency, timeline risk, server-side gating gap). All fixed.
- **Real brand icons** — User rejected emoji/Lucide icons for TikTok/Instagram/YouTube. Use actual brand SVG logos with correct colors.
- **User rejects AI slop patterns** — Generic icon+title+subtitle feature rows were rejected multiple times. The features section needs a creative, non-template approach.
- **Onboarding merge** — Sectioned scrollable screens work well. Each section has a title and the appropriate input UI. Required vs optional sections clearly separated.
- **Reusing ConversionContext** — Demo conversion screen uses the same `startConversion` / `state` from `ConversionContext` — no duplicate conversion logic, same processing stages, same error handling.
- **RevenueCat listener cleanup** — `addCustomerInfoUpdateListener` returns void (not a subscription). Cleanup via `removeCustomerInfoUpdateListener(callback)`.
- **`usePremiumGate` hook pattern** — Clean single-line gating: `requirePremium(() => router.push(...))`. Keeps gate logic out of individual components.
- **formSheet paywall** — Reused `PaywallContent` component for both onboarding (full-screen) and feature gate (0.85 detent sheet). Same component, different wrapper.
- **Gate at navigation entry points** — Rather than gating inside `startConversion`, gate at every UI touchpoint that triggers conversion. Simpler, no deep coupling.

## What Didn't Work

- **Emoji icons on paywall** — Rejected as AI slop
- **Lucide icons in feature rows** — Still felt generic when combined with title+subtitle pattern
- **Icon + title + subtitle rows** — The most common AI-generated paywall pattern. User explicitly rejected this 3+ times. DO NOT use this pattern.
- **Listing features that don't exist** — AI Weight Suggestions and AI Coach Chat do NOT exist in the app. Only real features: unlimited conversions + unlimited library.
- **"Workout converted in 12 seconds"** — Removed because conversion time varies (can take 60s)
- **Design binary mockup generation** — OpenAI org verification required, fell back to HTML
- **`addCustomerInfoUpdateListener` return value** — Returns `void`, not a removable subscription. Must use `removeCustomerInfoUpdateListener(fn)` for cleanup.
- **RevenueCat "Test Store" app** — Was auto-created without Apple App Store platform config. Fixed by creating proper Apple App Store app via MCP API.
- **RevenueCat archive entitlement API** — Returns 400 "Content-Type not application/json" error. Bug in MCP server. Workaround: detach all products from the entitlement to make it inert.

## Next Steps

### Immediate: Finish App Store Connect Agreements (manual, in browser)
1. **Add bank account** — App Store Connect → Business → Add Bank Account
2. **Complete tax form** — W-8BEN already submitted, wait for processing
3. Once Paid Apps Agreement status changes to **Active**, sandbox testing will work

### Phase 6: Analytics + Legal + App Store
- PostHog funnel events: `paywall_shown`, `plan_selected`, `purchase_started`, `purchase_completed`
- RevenueCat webhook → backend for server-side subscription state
- Terms of Service + Privacy Policy pages (required for App Store + paywall footer links)
- Wire paywall footer "Terms" and "Privacy" text to actual pages
- TestFlight build, internal testing, App Store submission

### Phase 6.5: App Store Connect Screenshots
- Upload paywall screenshots to each subscription product's Review Information section in App Store Connect
- Needed for: `clip2fit.weekly`, `clip2fit.annual`
- Take from simulator once TestFlight build is running

### Optional polish (not blocking launch)
- Server-side subscription gating (API returns 403 for gated endpoints when free) — currently client-side only
- Paywall analytics: track which plan is selected before purchase, conversion funnel drop-off
- A/B test paywall headline copy
- RevenueCat Customer Center integration for subscription management in profile

## Key Files Reference

| File | Purpose |
|------|---------|
| `~/.gstack/projects/lazarspasic96-clip2fit/lazarspasic-main-design-20260406-222237.md` | Full design doc (APPROVED) |
| `plans/plan-monetization-premium-strategy.md` | Original monetization plan (superseded by design doc) |
| `plans/plan-paywall-pricing-update.md` | Pricing update plan (weekly/annual) |
| `docs/designer-brief.md` | Visual identity, color palette, font specs, screen inventory |
| `docs/paywall-mockup.html` | Final approved paywall mockup (Receipt variant, updated pricing) |
| **Subscription** | |
| `types/subscription.ts` | Plan types (`weekly | annual`), product IDs (`clip2fit.weekly`, `clip2fit.annual`), display metadata, `FREE_WORKOUT_LIMIT` |
| `contexts/subscription-context.tsx` | `SubscriptionProvider` + `useSubscription()` (RevenueCat) |
| `hooks/use-premium-gate.ts` | `usePremiumGate()` — `requirePremium(callback)` pattern |
| **Paywall** | |
| `components/paywall/paywall-content.tsx` | Full paywall layout (Receipt variant) — shared between onboarding + sheet |
| `components/paywall/plan-card.tsx` | Radio-style plan selector with animation |
| `components/paywall/workout-preview-card.tsx` | Mini workout card (visible + blurred exercises) |
| `components/paywall/platform-chips.tsx` | TikTok/Instagram/YouTube brand SVG chips |
| `app/(protected)/onboarding/paywall.tsx` | Onboarding step 5 — full-screen paywall |
| `app/(protected)/sheets/paywall.tsx` | Feature gate — dismissible paywall sheet (0.85 detent) |
| **Feature Gating** | |
| `components/home/import-from-socials-card.tsx` | Gated — opens paywall sheet for free users |
| `components/home/bottom-action-buttons.tsx` | "Import from video" gated, "Manual entry" free |
| `app/(protected)/add-workout.tsx` | "From URL" + "From Video" gated, "Manual Entry" free |
| `app/_layout.tsx` | Share intent handler gated (free users see paywall) |
| `app/(protected)/workout-builder.tsx` | Save action checks library cap (`FREE_WORKOUT_LIMIT`) |
| `app/(protected)/(tabs)/my-workouts.tsx` | Shows "X/3 workouts" cap indicator for free users |
| **Profile** | |
| `components/profile/subscription-card.tsx` | Subscription management (plan display, upgrade/manage, restore) |
| `components/profile/profile-dashboard.tsx` | Includes `SubscriptionCard` |
| **Onboarding** | |
| `app/(protected)/onboarding/_layout.tsx` | Onboarding layout (5 screens, progress bar on first 3) |
| `app/(protected)/onboarding/about-you.tsx` | Step 1: personal info (all optional) |
| `app/(protected)/onboarding/training-profile.tsx` | Step 2: goal + experience + activity level |
| `app/(protected)/onboarding/preferences.tsx` | Step 3: location, equipment, frequency, duration, styles, focus, injuries |
| `app/(protected)/onboarding/demo-conversion.tsx` | Step 4: paste URL or sample video, inline conversion |
| **Shared** | |
| `components/onboarding/onboarding-screen.tsx` | Onboarding wrapper (title, subtitle, next/skip, scroll) |
| `components/onboarding/selection-card.tsx` | Card component with Reanimated press animation |
| `components/onboarding/chip-grid.tsx` | Multi-select chip grid with exclusive option support |
| `components/onboarding/day-card.tsx` | Animated day number selector (1-7) |
| `components/ui/button.tsx` | App button component (primary/secondary/ghost) |
| `components/ui/platform-icons.tsx` | TikTok/Instagram/YouTube SVG icons (simpler, single-color) |
| `contexts/profile-form-context.tsx` | ProfileFormProvider (useRef, no re-renders) |
| `contexts/conversion-context.tsx` | ConversionProvider (conversion state, polling, stages) |
| `hooks/use-complete-onboarding.ts` | Saves profile + marks onboarding complete |
| `app/_layout.tsx` | Root layout (providers: Auth > Subscription > Conversion) |
| `constants/colors.ts` | Color constants for style props |

## Apple Compliance Notes

- Apple killed toggle paywalls Jan 2026 (Guideline 3.1.2) — no free trial toggle UI
- Hard paywall needs "Continue with limited features" escape (not just close X) — IMPLEMENTED
- If Apple rejects: fallback to 3 free conversions (change single constant)
- Auto-qualifies for Small Business Program (15% commission)
- App must be released before IAP works in production (24h buffer)
