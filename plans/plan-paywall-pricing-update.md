# Plan: Paywall Pricing Update

## Change

Replace **Monthly $5.99** with **Weekly $7.99**. Final lineup:
- Weekly: $7.99/week (no trial)
- Annual: $29.99/yr — 7-day free trial, pre-selected, BEST VALUE tag
- Lifetime: $79.99 one-time

## Files Updated (docs/planning only)

| File | What Changed |
|------|-------------|
| `HANDOFF.md` | Pricing line, mockup description, next steps product list |
| `docs/paywall-mockup.html` | Monthly plan card → Weekly $7.99/week, terms footer updated |
| `plans/plan-monetization-premium-strategy.md` | Pricing table: Monthly → Weekly |

## Files to Update During Implementation

These don't exist yet but will reference pricing when built:

| File | What to Do |
|------|-----------|
| `components/paywall/paywall-content.tsx` | Use weekly/annual/lifetime plan cards |
| `contexts/subscription-context.tsx` | `SubscriptionPlan` type: `'weekly' \| 'annual' \| 'lifetime'` |
| `types/subscription.ts` | Plan type enum, price constants |
| RevenueCat dashboard | Create weekly product ($7.99), remove monthly product |
| App Store Connect | Create weekly subscription group product, remove monthly |

## Revenue Impact Note

Weekly $7.99 = $415/yr per subscriber (vs $72/yr monthly). Anchors annual at extreme value ($29.99 vs $415). Standard paywall psychology — weekly looks small per-transaction, annual looks like a steal by comparison.

---

## Next Steps (Implementation Roadmap)

### Pre-work (do before any code)
1. Create Apple Developer / App Store Connect subscription products: **weekly $7.99, annual $29.99, lifetime $79.99** (24h propagation)
2. Create RevenueCat project, link 3 products above
3. Run `eas build --profile development --platform ios` for dev client

### Phase 1: Onboarding Restructure (highest risk)
- Merge 11 onboarding screens → 6
- Screen mapping: Welcome, About You, Training Profile, Preferences, Demo Conversion (new), Paywall (new)
- See `HANDOFF.md` merge mapping table

### Phase 2: RevenueCat SDK + Subscription Context
- Install `react-native-purchases`
- Build `SubscriptionProvider` with real RevenueCat (skip mock — Apple account is ready)
- Types: `weekly | annual | lifetime` plans

### Phase 3: Paywall Screen
- Implement Receipt variant from `docs/paywall-mockup.html`
- Two presentation modes: full-screen (onboarding), sheet 0.85 detent (feature gate)
- Plan cards: annual pre-selected, weekly, lifetime
- CTA triggers RevenueCat `purchase()`

### Phase 4: Feature Gating
- Gate video conversions (1 free during onboarding demo)
- Gate workout library (cap at 3 for free)
- Premium gate hook: `usePremiumGate()` → opens paywall or runs callback

### Phase 5: Analytics + Legal
- PostHog funnel events: paywall_shown, plan_selected, purchase_started, purchase_completed
- RevenueCat webhook → backend for server-side subscription state
- Terms of Service + Privacy Policy pages

### Phase 6: TestFlight + App Store
- TestFlight build, internal testing
- Fix issues
- Submit to App Store Review
