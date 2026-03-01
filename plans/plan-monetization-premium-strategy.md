# Clip2Fit — Monetization & Premium Feature Strategy

## Research Summary

### Market Position
- **No real competitors** in video-to-workout space. FitSaver ($3.99/mo, iOS-only, tiny) and Gymdex (iOS-only, tiny) exist but negligible
- Adjacent: Hevy ($29.99/yr), Strong ($29.99/yr), Fitbod ($15.99/mo) — none convert video content
- Android completely uncontested — cross-platform via Expo = immediate advantage
- Video2Recipe ($9/mo, food videos) validates the business model

### What Makes Users Pay
- **Progressive overload intelligence** — #1 feature serious lifters want
- **AI personalization** — 50% higher retention
- **Decision fatigue reduction** — "Just tell me what to do today"
- **Content flywheel** — more saved workouts = higher switching cost
- Paying customers skew **35-55 years old** (not Gen-Z despite TikTok source)

### Retention Facts
- 77% churn within 3 days. First "aha moment" must happen in < 60 seconds
- Freemium conversion: 2-5%. AI personalization drives 50% higher retention

### What Users Hate
- Feature bloat, aggressive social, logging friction
- Inaccurate AI destroys trust instantly
- Subscription fatigue — always offer lifetime option

### Growth & Distribution Insights (from @maubaron, @oliverhenry, @JosephKChoi)

**@maubaron — Prayer Lock ($2.5k → $25k/mo in 7 months)**
- Solo founder, bootstrapped Christian app (blocks phone until you pray)
- Automated faceless UGC: Python + Gemini generates videos in 5 seconds
- 11 accounts across TikTok/IG/YouTube, 6 posts/day on autopilot → 6M views, 24k downloads
- **Sequence: organic content first → obsess over onboarding at 300+ daily downloads → then scale with ads**
- $7k/mo ad spend (mostly TikTok), 50% profit margin
- Review prompt at **8-10 min emotional peak** → 6x typical review rate (1,500 reviews from 25k downloads)
- "Focus on ONE app. Building 10 apps at once is the biggest mistake"

**@oliverhenry — OpenClaw agent "Larry" (8M views in 1 week)**
- AI agent on old gaming PC generates autonomous TikTok slideshows (photorealistic + text overlays)
- Fully automated marketing pipeline: ~60 seconds human input per post (just add trending audio)
- $4k revenue in 24 hours from automated funnel
- Open-source skill on ClawHub marketplace — adaptable to any product/niche
- **Implication for Clip2Fit:** automated workout tip slideshows + app demo content = scalable TikTok presence

**@JosephKChoi — Consumer Club (300 members, $500M+ ARR combined)**
- Runs TikTok farming playbook: 30 phones, 50M+ views
- 95% of TikTok consumption from non-followed creators → **zero followers needed** to go viral
- **"One killer feature" as TikTok hook** — find the emotionally resonant feature and build all content around it
- UGC creators (scrappy video makers) > big influencers. You provide script, TikTok algo handles distribution
- "The more you sell the product, the less shareable the video becomes" — value-first, product mention at 50-70%
- Apps with visual/emotional hooks convert best: health, dating, personal finance, social

**Key Clip2Fit takeaways from all three:**
1. The "paste URL → see structured workout appear" IS the killer TikTok hook (visual, emotional, wow-factor)
2. Screen recordings of the conversion process = perfect faceless content format
3. Multi-account TikTok distribution (10+ accounts) = proven strategy
4. Automated content generation (workout tips + app demo) via AI = scalable
5. Onboarding optimization is the highest-leverage product work after distribution works
6. Review prompt timing: after first successful conversion (emotional peak), not at signup
7. Organic proves what works → scale winners with paid ads (TikTok Ads primarily)

---

## The Answer: What Makes Users Buy?

**Smart Progressive Overload** — visible on *every set of every workout*. Users see "Suggested: 82.5kg x 8" inline during active workouts. Free users see it blurred with lock icon. Creates:
- Daily visibility (every session), compounding value, "can't train without it" dependency
- Addresses #1 feature request from serious lifters

Combined with: unlimited conversions, AI workout generator, recovery intelligence, advanced stats.

---

## Free vs Premium Tiers

### FREE (Acquisition)
| Feature | Limit |
|---------|-------|
| Video URL conversion | **3 lifetime** |
| Manual workout builder | Unlimited |
| Exercise catalog | Full access |
| Active workout logging | Unlimited |
| Weekly schedule | Unlimited |
| Basic stats | 7-day window only |
| Workout library | **Up to 10 workouts** |

### PREMIUM
| Feature | Description |
|---------|-------------|
| Unlimited video conversions | No caps |
| Smart Progressive Overload | Weight/rep suggestions per set based on history |
| AI Workout Generator | Conversational chat (existing plan) |
| "Today's Briefing" | Recovery status + daily recommendation |
| Advanced stats | All time periods (30d, 6m, 1y, all) |
| Unlimited library | No 10-workout cap |

### Pricing (future — Apple Developer account in progress)
| Plan | Price |
|------|-------|
| Monthly | $5.99/mo |
| Annual | $29.99/yr ($2.50/mo) — 7-day free trial |
| Lifetime | $79.99 |

---

## Implementation Phases

> **Note:** RevenueCat integration deferred until Apple Developer account is set up. Phase 1 uses a **mock subscription context** with MMKV-persisted toggle so all premium gating, paywall UI, and feature limits can be built and tested now. RevenueCat drops in later as a provider swap — no UI/logic changes needed.

### Phase 1: Subscription Infrastructure (Mock) + Paywall UI + Feature Gating

#### 1A. Subscription Context (Mock Provider)

**New files:**
- `types/subscription.ts` — `SubscriptionTier ('free' | 'premium')`, `SubscriptionState`, `SubscriptionContextValue`
- `contexts/subscription-context.tsx` — exposes `useSubscription()` with `isPremium`, `tier`, `conversionCount`, `incrementConversionCount()`. Backed by MMKV storage. Includes `__dev_togglePremium()` for testing
- `utils/subscription-storage.ts` — MMKV read/write for `subscription_tier` and `conversion_count`

**Modify:** `app/_layout.tsx` — add `<SubscriptionProvider>` inside `<AuthProvider>`

Later: swap mock provider internals with RevenueCat SDK (`react-native-purchases`) — context API stays identical.

#### 1B. Paywall Screen

**New files:**
- `app/(protected)/sheets/paywall.tsx` — formSheet route (0.85 detent)
- `components/paywall/paywall-content.tsx` — close X, hero "Train Smarter", 3 feature bullets (Sparkles: AI weight suggestions, Video: unlimited conversions, MessageSquare: AI chat), plan toggle, CTA button, restore link
- `components/paywall/plan-toggle.tsx` — monthly/annual/lifetime selector with savings callout
- `components/paywall/feature-row.tsx` — icon + text benefit row

**Modify:** `app/(protected)/_layout.tsx` — register `sheets/paywall` with `sheetAllowedDetents: [0.85]`

For now the CTA shows "Coming Soon" or triggers `__dev_togglePremium()` in dev builds. When RevenueCat is connected, CTA calls `purchase()`.

#### 1C. Premium Gate Hook

**New file:** `hooks/use-premium-gate.ts`
```
usePremiumGate() → { isPremium, requirePremium(callback) }
// If not premium → router.push('/(protected)/sheets/paywall')
// If premium → runs callback
```

#### 1D. Gate Existing Features

| File | Change |
|------|--------|
| `contexts/conversion-context.tsx` | Check `conversionCount` from subscription context. After 3 for free → set `'limit_reached'` jobState, open paywall |
| `components/processing/url-input-section.tsx` | Show "X left" conversion badge for free users |
| `app/(protected)/(tabs)/stats.tsx` | Lock period selector beyond '7d' for free — lock icon + tap → paywall |
| `app/(protected)/settings.tsx` | Add "Subscription" section above "Personal Info" — free: "Upgrade to Pro" row, premium: plan details |

#### Paywall Trigger Points

| Trigger | Intent Level |
|---------|-------------|
| 4th video conversion | Highest |
| Tap blurred weight suggestion (Phase 2) | Very high |
| Tap locked stats period | High |
| 11th workout save (library full) | High |
| AI Trainer card on home (Phase 3) | Medium |
| Settings > "Upgrade to Pro" | Medium |

---

### Phase 2: Smart Progressive Overload (The #1 Premium Feature)

#### 2A. Backend Suggestion Algorithm

**New file (API repo):** `src/lib/suggestions/progressive-overload.ts`
**New endpoint:** `GET /api/exercises/:catalogExerciseId/suggestion?goal={fitness_goal}`

Algorithm (deterministic, no ML):
1. Fetch last 4 completed sessions for exercise + user
2. < 2 sessions → `basis: 'first_time'`, no suggestion
3. Hit target reps last 2 sessions at same weight → suggest +2.5kg (barbell) / +2kg (dumbbell) / +1 rep (bodyweight)
4. Missed reps last session → same weight/reps (consolidation)
5. Missed reps last 2 sessions → deload (-5% weight)
6. Factor fitness goal: `build_muscle` biases weight↑, `improve_endurance` biases reps↑

Response: `{ suggestedWeight, suggestedReps, basis, confidence, lastFourSessions[] }`

#### 2B. Mobile Display

**New file:** `hooks/use-exercise-suggestion.ts` — TanStack Query, `staleTime: Infinity` during workout

**Modify:** `components/workout/command-center/set-table-row.tsx`
- Add "Suggested" row below "Previous":
  - **Premium:** `82.5kg x 8` in accent green + Sparkles icon
  - **Free:** blurred text + lock icon → tap opens paywall
  - **Deload:** amber + "Recovery" label
- Add "Apply suggestion" pill button — pre-fills weight + reps (premium only)

---

### Phase 3: Onboarding Aha Moment

Reorder onboarding flow: Welcome → **Paste first video** → Demographics → Goal

#### 3A. New Onboarding Screen

**New file:** `app/(protected)/onboarding/first-workout.tsx`
- Full-screen URL input (reuse `UrlInputSection` component)
- Big headline: "Paste a workout video link"
- Platform icons (TikTok, Instagram, YouTube)
- Inline conversion progress (reuse `HeroProgressRing`)
- On completion → show workout proposal → save to library
- "Skip" link at bottom ("I'll do this later")
- This uses conversion #1 of the free 3

#### 3B. Flow Changes

**Modify:**
- `app/_layout.tsx` (RootNavigator) — redirect to `onboarding/first-workout` instead of `onboarding/demographics` when `!onboardingComplete`
- `app/(protected)/onboarding/first-workout.tsx` → navigates to `demographics` on complete/skip
- `app/(protected)/onboarding/demographics.tsx` — adjust back navigation (goes to first-workout, not welcome)

Result: user sees "magic" in 30 seconds, home screen is never empty on first visit.

---

### Phase 4: AI Workout Generator

Follow existing plan at `plans/plan-ai-trainer-chat.md` with monetization:
- AI generation is premium-only
- `AiTrainerCard` on home shows for all, triggers paywall for free
- `add-workout.tsx` "Generate with AI" gets PRO badge (lime gradient + Sparkles icon)

---

### Phase 5: "Today's Intelligence" Layer

#### 5A. Recovery Status API

**New endpoint:** `GET /api/recovery-status`

Time-based model per muscle group:
- 0-24h: 0-30%, 24-48h: 30-70%, 48-72h: 70-95%, 72h+: 95-100%
- Adjusted by volume (more sets = longer recovery)

#### 5B. Today's Briefing Card

**New file:** `components/home/todays-briefing-card.tsx`

Premium: mini recovery bars per muscle + "Focus on upper body today" + quick actions
Free: blurred teaser + "Upgrade to see recovery status"

**Modify:** `app/(protected)/(tabs)/(home)/index.tsx` — insert above `TodaysWorkoutCard`

---

### Phase 6: Review Prompt Optimization + Share Flow

Based on @maubaron's 6x review rate by timing the prompt at emotional peak:

#### 6A. Smart Review Prompt
- Trigger `StoreReview.requestReview()` after the user's **first completed workout** (not at signup, not randomly)
- The moment after saving the first workout from conversion OR completing first active session = emotional peak
- Track in MMKV: `has_prompted_review` flag (only prompt once)
- **Modify:** `contexts/active-workout-context.tsx` — after `completeSession()` succeeds and it's the first session, call review prompt
- **Modify:** `contexts/conversion-context.tsx` — after first successful conversion + save, call review prompt

#### 6B. Share Workout Flow
- After workout completion → show "Share your workout" card with pre-formatted text + deep link
- "I just crushed [workout name] with @clip2fit" — includes app store link
- Use `expo-sharing` (already installed for share intent)
- Creates organic distribution from engaged users

---

### Phase 7: RevenueCat Integration (When Apple Developer Account Ready)

- Install `react-native-purchases`
- Swap mock internals in `contexts/subscription-context.tsx` with RevenueCat SDK
- No UI changes — context API stays identical
- Backend: add `POST /api/webhooks/revenuecat`, `subscription_events` table, `subscription_tier` + `subscription_expires_at` columns on `profiles`
- Paywall CTA calls `purchase()` instead of dev toggle

---

## New Files Summary

| File | Phase |
|------|-------|
| `types/subscription.ts` | 1 |
| `contexts/subscription-context.tsx` | 1 |
| `utils/subscription-storage.ts` | 1 |
| `hooks/use-premium-gate.ts` | 1 |
| `app/(protected)/sheets/paywall.tsx` | 1 |
| `components/paywall/paywall-content.tsx` | 1 |
| `components/paywall/plan-toggle.tsx` | 1 |
| `components/paywall/feature-row.tsx` | 1 |
| `hooks/use-exercise-suggestion.ts` | 2 |
| `app/(protected)/onboarding/first-workout.tsx` | 3 |
| `components/home/todays-briefing-card.tsx` | 5 |

## Modified Files Summary

| File | Phase | Change |
|------|-------|--------|
| `app/_layout.tsx` | 1 | Add `<SubscriptionProvider>` |
| `app/(protected)/_layout.tsx` | 1 | Register paywall sheet |
| `app/(protected)/settings.tsx` | 1 | Add Subscription section |
| `app/(protected)/(tabs)/stats.tsx` | 1 | Gate period selector |
| `contexts/conversion-context.tsx` | 1 | Enforce conversion limit |
| `components/processing/url-input-section.tsx` | 1 | Show remaining conversions |
| `components/workout/command-center/set-table-row.tsx` | 2 | Progressive overload row |
| `app/_layout.tsx` (RootNavigator) | 3 | Redirect to first-workout |
| `app/(protected)/onboarding/demographics.tsx` | 3 | Adjust back nav |
| `app/(protected)/add-workout.tsx` | 4 | PRO badge on AI option |
| `app/(protected)/(tabs)/(home)/index.tsx` | 5 | Add TodaysBriefingCard |
| `contexts/active-workout-context.tsx` | 6 | Smart review prompt after first session |
| `contexts/conversion-context.tsx` | 6 | Review prompt after first conversion |

---

## Verification Plan

1. **Phase 1:** Toggle premium via dev switch → verify paywall opens on 4th conversion attempt → verify stats periods lock/unlock → verify settings shows tier → verify conversion count persists across restarts
2. **Phase 2:** Log 4+ sessions of same exercise → verify suggestion appears with correct weight → verify blur for free users → verify "Apply" fills inputs → verify deload triggers after 2 missed sessions
3. **Phase 3:** Fresh signup → verify first-workout screen appears → paste URL → see conversion → verify workout in library → verify demographics follows
4. **Phase 4:** Follow AI trainer chat plan verification
5. **Phase 5:** Train different muscle groups → verify recovery bars → verify briefing recommendations
6. **Phase 6:** Complete first workout → verify review prompt appears once → verify share card shows after completion → verify deep link works
7. **Phase 7:** Connect RevenueCat sandbox → test purchase flow → verify webhook updates tier → verify subscription persists
