# Clip2Fit — Paywall, Onboarding & Subscription Strategy

## Context

Clip2Fit converts workout videos from TikTok/Instagram/YouTube into structured workout plans. No direct competitor exists. Closest analog: Garli (recipe app, same paste-link-to-AI-extraction model). Current state: working MVP with 11-screen onboarding, no subscription system. This document defines the complete monetization strategy based on analysis of 9 Twitter threads from successful indie app builders, the Adapty 2026 State of Subscriptions report, RevenueCat benchmarks, and competitive analysis of Fitbod, Hevy, Strong, Garli, and others.

---

## 1. PRICING STRATEGY

### Plans

| Plan | Price | Monthly Equiv | Purpose |
|------|-------|---------------|---------|
| **Monthly** | $5.99/mo | $5.99/mo | Price anchor + low-risk entry |
| **Annual** | $29.99/yr | **$2.50/mo** | Default. Core revenue. 7-day free trial |
| **Lifetime** | $99.99 | One-time | Subscription fatigue objection killer |

### Why Monthly + Annual + Lifetime (Decision Based on Deep Research)

**Monthly stays because:**
- Acts as **price anchor** — $5.99/mo ($71.88/yr annualized) makes $29.99/yr look like a 58% discount
- Every top H&F competitor offers monthly (Strong, Hevy, Fitbod, Strava, MyFitnessPal, Noom)
- Creates the classic **3-tier decoy effect** where annual becomes the "obvious smart choice"
- Low-risk entry for uncertain users — 8-30% of monthly users convert to annual later
- Removing monthly loses top-of-funnel conversion and eliminates anchoring

**Weekly rejected because:**
- No H&F app uses weekly — it's a gaming/utility pattern
- 3.4% retention at 12 months (catastrophic vs 44.1% annual)
- $4.99/week = $259/yr feels predatory next to $29.99/yr annual
- Only works with heavy paid acquisition (not organic-first strategy)

**Lifetime raised to $99.99 because:**
- $79.99 was 2.67x annual (low end). $99.99 = 3.3x (matches Strong's pricing)
- Expected annual subscriber LTV is ~$48.89 — lifetime at $99.99 captures 2x that upfront
- Available from day 1 but positioned as tertiary (not highlighted)

### Display Strategy

- **Default-select Annual** on paywall (pre-selected, "Most Popular" badge, green highlight)
- Monthly shown as "$5.99/month" — makes annual look like a steal
- Annual shown as "$29.99/year" with **"$2.50/mo — Save 58%"** callout
- Lifetime shown as "$99.99 one-time" with "Best Value" label, less prominent
- Under annual: "Less than a cup of coffee per month"
- 7-day free trial on annual plan ONLY (incentivizes annual selection)

### Phase 2 Pricing: Two-Tier Model (When Form Coach Ships)

Once AI Form Coach launches, introduce a second premium tier:

| | **Pro** | **Coach** |
|---|---------|-----------|
| Monthly | $5.99/mo | $14.99/mo |
| Annual | $29.99/yr ($2.50/mo) | $79.99/yr ($6.67/mo) |
| Lifetime | $99.99 | $149.99 |
| Unlimited conversions | Yes | Yes |
| Progressive overload | Yes | Yes |
| Full stats | Yes | Yes |
| Form Coach skeleton overlay | **3 free sessions/mo** | **Unlimited** |
| LLM coaching cues (Claude Haiku) | No | Yes |
| Form score history & trends | No | Yes |
| Exercise-specific form reports | No | Yes |

**Why two tiers:**
- Form coaching justifies premium pricing — standalone form apps charge $10-15/mo (CueForm $10, Onyx $15, FormCheck $13)
- Coach targets the "would pay for a personal trainer" segment (25%+ of men willing to pay $21-30/mo)
- Pro remains accessible for users who only want video conversion + tracking
- Lifetime at $149.99 for Coach tier (3.75x annual) reinforces Coach as the premium experience

**Credit/Token Model (complement to tiers):**
- Each Form Coach session = 1 credit
- Pro users get 3 credits/month included
- Coach users get unlimited
- Additional credits purchasable: 5 for $4.99, 15 for $9.99
- RevenueCat Virtual Currency handles this natively
- Best for occasional form-check users who don't want a higher subscription

### Phased Pricing Strategy

1. **Launch (V1)**: Monthly ($5.99) + Annual ($29.99, 7-day trial) — single Pro tier, keep it simple
2. **Month 3-6**: Add Lifetime ($99.99) once retention data validates the price
3. **Form Coach Launch**: Introduce Coach tier ($14.99/mo, $79.99/yr, $149.99 lifetime) + credit system
4. **Ongoing**: A/B test with Superwall — test price points, trial lengths, plan visibility, tier presentation

### Revenue Benchmark Targets

- Install-to-trial: 10-15% (top quartile H&F)
- Trial-to-paid: 45-60%
- 12-month LTV (annual): $46+ per payer
- Refund rate target: <2%

---

## 2. FREE vs PAID LINE

### Free Forever (Acquisition Layer)

| Feature | Free Limit |
|---------|-----------|
| Video URL conversion | **3 lifetime** (the "taste") |
| Manual workout builder | Unlimited |
| Exercise catalog | Full access |
| Active workout logging | Unlimited |
| Weekly schedule | Unlimited |
| Basic stats | **7-day window only** |
| Workout library | **Up to 8 workouts** |
| Progressive overload suggestions | **Blurred** (visible but locked) |
| Form Coach | **3 sessions/mo** (skeleton overlay only, no LLM coaching) |

### Premium Unlocks

**Pro Tier:**

| Feature | Description |
|---------|-------------|
| Unlimited video conversions | No caps |
| Smart Progressive Overload | AI weight/rep suggestions per set |
| Advanced stats | 30d, 6mo, 1yr, all-time |
| Unlimited library | No 8-workout cap |
| Form Coach (basic) | 3 sessions/mo with skeleton overlay |
| AI Workout Generator | Chat-based (Phase 2) |
| Today's Briefing | Recovery status + daily rec (Phase 3) |
| Priority processing | Faster conversion queue |

**Coach Tier (Phase 2 — when Form Coach ships):**

| Feature | Description |
|---------|-------------|
| Everything in Pro | All Pro features included |
| Unlimited Form Coach | No session cap |
| LLM Coaching Cues | Real-time Claude Haiku form coaching every 3-5s |
| Form Score History | Per-exercise form scores tracked over time |
| Form Progress Reports | Set-over-set improvement graphs |
| Exercise-Specific Form Rules | Detailed biomechanical feedback per exercise |

### Why 3 Free Conversions

Matches Fitbod's proven "3 free then paywall" model. 3 is enough to demonstrate the "magic" (1st = wow, 2nd = "this actually works", 3rd = "I need more of this") but not enough to avoid paying. Library cap of 8 = one week of workouts (most common training frequency is 4-6 days). User fills library fast.

### Paywall Trigger Points (Ranked by Conversion Intent)

| Trigger | Intent | When |
|---------|--------|------|
| 4th video conversion attempt | Highest | User is actively trying to use the core feature |
| Tap blurred weight suggestion during workout | Very High | Mid-workout, highest motivation moment |
| 9th workout save (library full) | High | User has invested in building their collection |
| Tap locked stats period (>7 days) | High | User wants to see their progress |
| "Generate with AI" button | Medium | Curiosity-driven |
| Settings > "Upgrade to Pro" row | Medium | Self-directed exploration |
| Today's Briefing teaser card | Medium | Daily touchpoint |
| Form Coach session limit reached | High | User has experienced the feature and wants more |
| Tap locked LLM coaching cue | Very High | Mid-workout, wants the AI coach feedback |

### The "Blurred Suggestion" Strategy (Key Insight)

Progressive overload suggestions appear on **every set of every workout** — free users see "Suggested: 82.5kg x 8" but blurred with a lock icon. This is a non-annoying but inescapable upsell that triggers at the moment of highest motivation (mid-workout). This single feature likely drives more conversions than everything else combined because:
- Visible every session (not buried in a menu)
- Shown at peak motivation (during exercise)
- Addresses the #1 feature serious lifters want
- Creates compounding "I wonder what it would suggest" curiosity

---

## 3. ONBOARDING FLOW (Screen by Screen)

### Design Philosophy

- **"Aha moment" in <60 seconds** — show the magic before asking questions
- **Sunk cost accumulation** — quiz investment makes users feel committed
- **Noom-style personalized results** — makes paywall feel justified
- **Cut demographics from onboarding** — move to post-onboarding Settings nudge
- **Two aha moments** — video conversion (what we do) + form coach demo (how we help you do it right)
- Total screens: 13 (welcome + demo + form coach demo + attribution + 5 quiz + focus areas + plan summary + paywall + notifications + auth)
- Target time: 3-5 minutes

### Screen-by-Screen Flow

```
Welcome -> Demo Conversion -> Form Coach Demo -> Attribution -> Quiz (5 required + 1 skippable) -> Your Plan -> Paywall -> Notifications -> Sign Up -> Home
```

#### Screen 0: Welcome (5 sec)
- Hero: App logo/animation
- Headline: "Turn any workout video into your training plan"
- Subtext: "Works with TikTok, Instagram, YouTube & more"
- Platform icons row (TikTok, IG, YouTube, Facebook)
- CTA: "Get Started" (full-width button)
- Below: "Already have an account? Sign in" link
- **No signup yet** — reduce friction. Auth happens after paywall decision.

#### Screen 1: Demo Conversion — THE AHA MOMENT (30-60 sec)
- Headline: "Try it now — paste any workout video"
- Large URL input field (reuse existing `UrlInputSection`)
- Platform icons below input
- Pre-populated example: small "Try this one" link with a known working TikTok URL
- On paste -> live conversion animation (progress ring, stages: downloading -> transcribing -> extracting)
- On completion -> show workout preview card (exercises, sets, reps — the structured output)
- "This is your first workout!" celebration micro-animation
- CTA: "Save & Continue" / Skip: "I'll try later"
- **This uses conversion #1 of 3 free conversions** (confirmed: demo counts toward the 3-conversion limit)
- If skipped: still show a pre-rendered example conversion result (static) so they see what the app does

#### Screen 2: Form Coach Demo — THE SECOND AHA MOMENT (10 sec)
- Headline: "Your AI form coach watches every rep"
- Auto-opens front camera for ~10 seconds
- Shows real-time skeleton overlay on the user's body (lime green dots + lines)
- User sees themselves tracked in real-time — visceral, personal, immediate
- No exercise selection needed — just the raw skeleton demo
- Subtext: "We'll help you nail every exercise"
- CTA: "Continue"
- **Why this screen**: The most emotionally compelling demo possible. Seeing YOUR body tracked in real-time creates an "I need this" reaction that text and screenshots cannot. This is the feature that shifts the paywall headline from "unlimited conversions" to "AI Form Coach."
- **Requires camera permission**: If not yet granted, triggers iOS permission dialog. If denied, shows a static animation of a skeleton overlay instead (still impressive, less personal).
- **No data collected** — pure visual demo, no pose data stored

#### Screen 3: Where Do You Find Workouts? (multi-select, skippable — ATTRIBUTION)
- "Where do you usually find workout videos?"
- Options: TikTok, Instagram, YouTube, Facebook, Twitter/X, Pinterest, Fitness websites, Friends
- Multi-select `ChipGrid`
- **Why this screen**: Marketing attribution data (which channels to invest in) + validates our value prop ("we support all of those!")
- Skip: "Everywhere" (defaults to all)
- Immediately after demo conversion — capitalizes on excitement

#### Screen 4: Fitness Goal (single-select, required)
- Clean/minimal design (no mascot — let the product speak). Bold headline:
- 6 large `SelectionCard` options with icons:
  - Lose Weight (Target icon)
  - Build Muscle (Dumbbell)
  - Get Stronger (TrendingUp)
  - Improve Endurance (Heart)
  - General Fitness (Activity)
  - Flexibility & Mobility (Stretch)
- Progress bar: 1/6

#### Screen 5: Experience Level (single-select, required)
- "Where are you on your fitness journey?"
- 3 large cards with descriptions:
  - Beginner: "New to structured training"
  - Intermediate: "Consistent for 6+ months"
  - Advanced: "2+ years of serious training"
- Progress bar: 2/6

#### Screen 6: Equipment Access (multi-select, required)
- "What equipment do you have?"
- Quick presets at top: "At Home" / "Full Gym" pill buttons
- 2-column `ChipGrid` of equipment options
- Min 1 selection required
- Progress bar: 3/6

#### Screen 7: Training Frequency (single-select, required)
- "How many days per week?"
- Circular `NumberSelector` (2-6 days)
- Below: animated split preview ("4 days -> Upper/Lower x 2")
- Progress bar: 4/6

#### Screen 8: Session Duration (single-select, required)
- "How long are your workouts?"
- 5 selection cards (15/30/45/60/90+ min with subtitles)
- Progress bar: 5/6

#### Screen 9: Focus Areas (multi-select, skippable)
- "Any areas you want to prioritize?"
- `ChipGrid` with body part chips, "Full Body" is exclusive
- Skip: "I'm open to everything"
- Progress bar: 6/6

#### Screen 10: "Your Plan is Ready" — PERSONALIZED SUMMARY
- 1-2 sec "Analyzing your profile..." loading animation (builds anticipation)
- Then reveal personalized summary card:
  - "Based on your goals, here's your ideal setup:"
  - Goal badge, experience level
  - Recommended split (based on frequency + equipment)
  - "You'll see results in X weeks" progress curve (Garli-style graph showing current -> goal)
  - Sample weekly schedule preview
- Social proof below: "Join 10,000+ users training smarter" (or whatever real number is)
- CTA: "Start My Free Trial"
- This screen's purpose: make the user feel "this was made FOR ME" before seeing the price

#### Screen 11: Paywall (Two-Part)

**Part A: Value Pitch (top of screen)**

*V1 (before Form Coach):*
- Animated background: looping demo of URL -> structured workout conversion
- "Unlock Clip2Fit Pro"
- 3 feature bullets with icons:
  - Unlimited video conversions
  - Smart weight suggestions on every set
  - Full stats & unlimited library

*V2 (after Form Coach ships — headline shift):*
- Animated background: skeleton overlay tracking a person exercising (the Form Coach demo they just saw)
- "Unlock Clip2Fit Pro" / tier selector for Pro vs Coach
- 3 feature bullets with icons:
  - AI Form Coach watches every rep (PRIMARY — most emotionally compelling)
  - Unlimited video conversions
  - Smart progressive overload on every set
- For Coach tier: additional bullet "Real-time AI coaching cues by Claude"

*Both versions:*
- Social proof: "4.8 star - 50K+ workouts created" (or realistic metric)
- Testimonial carousel (2-3 short quotes)

**Part B: Plan Selection (bottom sheet or scroll reveal)**
- Three plan cards (classic decoy layout):
  - Monthly: "$5.99/month" (least prominent, serves as price anchor)
  - Annual: "$29.99/year — $2.50/mo - Save 58%" (**pre-selected**, "Most Popular" badge, highlighted border)
  - Lifetime: "$99.99 one-time" ("Best Value", smaller/tertiary)
- Apple-style trial timeline:
  - "Today: Full Access"
  - "Day 5: We'll remind you"
  - "Day 7: $29.99 charged yearly"
- CTA: "Start My 7-Day Free Trial"
- Below CTA: "No payment now. Easy to cancel." + "Restore purchases"
- Fine print: "Cancel anytime in Settings. Your subscription auto-renews."
- "X" close button (must be accessible — App Store requirement)
- Skip: small text "Continue with limited access"

#### Screen 12: Notifications Permission
- "Tap Allow to get reminders"
- Show benefit: "We'll remind you 2 days before your trial ends"
- Push notification date preview (specific date, Garli-style)
- "Easy to cancel, no penalties or fees"
- CTA: "Continue" (triggers iOS permission dialog)
- This is the ONLY place we ask for notifications

#### Screen 13: Sign Up / Sign In (AFTER paywall — confirmed)
- "Create your account to save your workout"
- Google OAuth (one-tap)
- Email/password
- Apple Sign In
- Auth after paywall = maximum friction reduction. User has experienced value (demo) + invested time (quiz) + committed to trial before needing to create an account

-> **Home Screen** (workout from demo conversion is already in library — never empty on first visit)

### Demographics: Moved to Post-Onboarding

Age, gender, height, weight = 0 impact on paywall decision. Move to:
- Settings nudge card: "Complete your profile for better recommendations" (appears after first session)
- Card dismissible, data optional
- Unlocks more accurate progressive overload suggestions when filled

---

## 4. PAYWALL DESIGN DETAILS

### Visual Design Principles

1. **Animated, not static** — 2.9x higher conversion per Adapty data
2. **Under 100 words of text** — one benefit = one sentence
3. **Outcome language** — "Train smarter" not "Subscribe now"
4. **Price anchoring** — annual shown as monthly cost next to monthly's monthly cost
5. **Transparency** — exact charge date, exact cancel process
6. **Social proof** — real numbers, not vague claims

### Trust Signals on Paywall

- App Store rating badge (once available)
- "Trusted by X users" counter
- "Cancel anytime from Settings" (specific, not vague)
- Day-5 reminder promise (and actually send it)
- "No payment today" emphasis
- Restore purchases link
- Terms of Use + Privacy Policy links

### Anti-"Subscription Fatigue" Copy

The #1 objection is "not another subscription." Counter with:
- Per-day price framing ("$0.08/day — less than a parking meter")
- Comparison to alternative: "vs $60+/hr for a personal trainer"
- Lifetime option available (one-time = no recurring fear)
- "We'll remind you before charging" = transparent, respectful

### Day-5 Trial Reminder (Critical Detail)

Send push notification on Day 5: "Your free trial ends in 2 days. Keep your access or cancel in Settings — no hard feelings."

Why: Blinkist found transparent trial reminders **increased** conversion 23% and reduced complaints 55%. Counterintuitive but proven — users trust apps that remind them, leading to more deliberate (and sticky) conversions.

---

## 5. RETENTION MECHANICS (Phase 1)

### 5A. Workout Streak System

- **Weekly streaks** (not daily — more forgiving, matches workout schedules)
- Track: "Completed X workouts this week"
- Threshold: 1 workout/week minimum to maintain streak
- **Streak freeze**: 1 free per month, additional freezes for premium
- Visual: flame icon + count on home screen header
- Milestone celebrations: 4 weeks, 12 weeks, 26 weeks, 52 weeks (full-screen animation)
- Streak break messaging: "Welcome back! Start a new streak today" (encouraging, not punishing)

### 5B. Conversion Counter / Collection

- "Workouts in library: 5/8" progress indicator (free tier, visible on home)
- Collection feeling: "You've converted workouts from 3 platforms" badge
- This creates investment (switching cost) — the more they add, the harder to leave

### 5C. Post-Workout Celebration

- After completing a workout: confetti animation + stats summary
- "You did X sets, X reps, estimated X calories"
- Share button: "I just crushed [workout name] with Clip2Fit" + app link
- This is also the review prompt trigger point (see below)

### 5D. Push Notification Strategy (3 Types Only)

1. **Workout day reminder** (morning, based on training frequency setting): "Leg day today — your workout is ready"
2. **Trial expiry reminder** (Day 5 of 7): "Your free trial ends in 2 days"
3. **Re-engagement** (after 5 days inactive): "New trending workout videos this week — convert one in 10 seconds"

**No other notifications.** Restraint > spam. Every notification must feel helpful, not promotional.

### 5E. Form Coach as Retention Mechanic (Phase 2)

- **Form score tracking** creates "am I improving?" curiosity — users check in to see form scores trend upward
- **Per-exercise progress graphs** (e.g., "Your squat form: 72 -> 85 over 4 weeks") drives long-term engagement
- **"New exercise unlocked"** — as we add form rules for more exercises, push notification: "Form Coach now supports Romanian Deadlift"
- **Integration into workout flow** is critical — form coaching must be part of the workout screen, not a separate feature. If users have to deliberately open a separate camera screen, it becomes a novelty. If it's a toggle during their workout, it becomes a habit.
- **Session credits create urgency** — Pro users with 3 sessions/month will time their form checks strategically (new exercise, PR attempt), creating intentional engagement

### 5F. What Makes Them Come Back Daily

- Home screen shows "Today's Workout" card (pulled from schedule)
- Streak counter visible immediately
- "New this week" section with trending workout videos from socials (curated, not AI — V1)
- After Phase 2: Progressive overload suggestions create "what does it suggest today?" curiosity
- After Form Coach: "Your squat form improved 8% this week" card on home screen

### V1 Feature Set (Minimum Viable Premium)

These features justify $5+/mo in V1:
1. **Unlimited video conversions** (core value prop)
2. **Smart Progressive Overload** (visible on every set)
3. **Unlimited library** (no 8-workout cap)
4. **Full stats** (all time periods)
5. **Priority conversion processing**

Phase 2 additions (not V1): AI workout generator, Today's Briefing, social features.

---

## 6. TRUST-BUILDING STRATEGY

### Before the Paywall (During Onboarding)

1. **Demo conversion first** — show the magic before asking for anything
2. **Quiz creates investment** — user feels "this app knows me"
3. **Personalized plan summary** — "this was built for me" effect
4. **Real social proof** — specific numbers, not vague claims
5. **Transparent trial timeline** — exact dates, not fine print

### After Subscription

1. **Day-5 trial reminder** — proves you're honest about billing
2. **"Cancel anytime" in Settings** — easy to find, not hidden
3. **No dark patterns** — no buried cancel flows, no "are you sure?" guilt screens
4. **Instant value delivery** — home screen populated with workout from demo conversion
5. **Weekly "what you gained" summary** — "You did X workouts, converted X videos, progressed on Y exercises"

### Overcoming "Another Subscription" Objection

- Lead with lifetime option visibility (one-time purchase = no recurring fear)
- Per-day price anchoring ($0.08/day feels negligible)
- "vs personal trainer" comparison ($30/year vs $3,000+/year)
- Generous free tier first — earn trust, then ask for money
- App Store rating/review count as trust signal

---

## 7. MARKETING & DISTRIBUTION PLAN

### TikTok Content Strategy (Primary Channel)

**Why TikTok**: The app literally converts TikTok content. Users discover workouts on TikTok -> need Clip2Fit to structure them. Perfect flywheel.

**5 Content Pillars:**

1. **"Watch This"** (40% of content) — Screen recording of pasting a viral TikTok workout URL and seeing the structured plan appear. Hook: "This app just turned that 15-second TikTok into my entire workout plan"

2. **"POV: You Saved 47 Workouts"** (20%) — Relatable pain point humor. "POV: You've saved 47 workout videos on TikTok and haven't done any of them" -> cut to app demo

3. **"I Did Only TikTok Workouts for 30 Days"** (15%) — Before/after transformation content using Clip2Fit-converted workouts

4. **"My [Creator] Workout As a Plan"** (15%) — Take a popular fitness creator's viral video, convert it, show the structured plan. Tags the creator = potential reshare

5. **"App Update" / Behind the Scenes** (10%) — Founder-led content showing what's being built, humanizing the brand

**Content Cadence:** 1-2 posts/day across 3-5 accounts (main + niche: women's fitness, bodybuilding, home workouts, etc.)

**Phase 2 Marketing:** Automated content pipeline using AI agents (OpenClaw/custom) to generate slideshow content at scale — proven by @maubaron (6M views) and @ErnestoSOFTWARE ($70k/mo)

### UGC / Influencer Strategy

- Partner with 10-20 micro-fitness-influencers (10K-100K followers)
- Simple brief: "Show yourself discovering a workout video -> converting it in Clip2Fit -> actually doing the workout"
- Budget: $100-300 per creator per video (micro-influencer rates)
- Launch branded challenge: #Clip2FitChallenge — "Convert your most-saved workout video and actually do it for 7 days"

### ASO Strategy

**Primary Keywords:** "workout planner", "workout from video", "fitness tracker"
**Secondary:** "TikTok workout", "Instagram workout", "video workout plan"
**Long-tail:** "convert workout video to plan", "save workout from TikTok"

**Screenshot Strategy:**
- Screenshot 1: URL paste -> structured workout (the money shot)
- Screenshot 2: Workout execution screen with progressive overload suggestion
- Screenshot 3: Library view with multiple converted workouts
- Screenshot 4: Stats/progress dashboard
- Screenshot 5: Social proof / testimonial overlay

**Update screenshots quarterly.** Apple reads screenshot text via OCR — include keywords in screenshot copy.

### Review Prompt Strategy

**Trigger:** After user's **2nd successful workout completion** (not 1st — that's too early, not 3rd — that's too late)
- User has converted a video, saved it, AND completed the workout twice = genuine engaged user
- Track in MMKV: `has_prompted_review` (once only)
- Time delay: not immediately after workout, but 2 hours later (user is reflecting on accomplishment)
- If dismissed: never ask again (respect the decision)

### Growth Sequence (From @maubaron)

1. **Organic content first** — TikTok/IG, create it yourself
2. **Develop "viral sense"** — learn what hooks work for this niche
3. **Hit 300 daily downloads** — then shift focus to onboarding optimization
4. **A/B test paywalls** with Superwall
5. **Scale with ads** — use proven organic hooks as ad creative
6. **Automate content** — AI agent pipeline for scale

---

## 8. IMPLEMENTATION PRIORITIES

### Phase 1: Core Monetization (V1 Launch)

1. **Subscription infrastructure** (mock context + MMKV storage + types)
2. **Paywall screen** (two-part: value pitch + plan selection — single Pro tier)
3. **Feature gating** (conversion limit, library cap, stats lock, blurred suggestions)
4. **Onboarding redesign** (demo conversion first, quiz, personalized plan, paywall placement)
5. **Progressive overload suggestions** (the #1 V1 premium feature — backend + mobile display)
6. **Streak system** (weekly streak + home screen counter + celebrations)
7. **Post-workout celebration + share flow**
8. **Review prompt** (after 2nd completed workout)
9. **RevenueCat integration** (when Apple Developer account ready)

### Phase 2: Form Coach (Premium Differentiator)

1. **Custom Expo Module** (expo-pose-camera: Apple Vision iOS + ML Kit Android)
2. **Skeleton overlay** (Skia Canvas + SharedValue + runOnUI bridge — no React re-renders)
3. **Form Coach screen** (full-screen camera modal, exercise selection sheet)
4. **MVP exercise rules** (squat, deadlift, bicep curl, overhead press, lunge — rule-based only)
5. **Form Coach onboarding demo** (Screen 2: 10-sec skeleton preview during onboarding)
6. **Coach tier + credit system** (RevenueCat two-tier + Virtual Currency)
7. **Paywall update** (headline shift to Form Coach, tier selector)
8. **Feature gating update** (3 sessions/mo free, session credits for Pro, unlimited for Coach)

### Phase 3: LLM Coaching (Coach Tier Differentiator)

1. **Claude Haiku integration** (periodic coaching cues every 3-5s during Form Coach sessions)
2. **Form scoring system** (0-100 across 5 dimensions: bracing, posture, foot placement, ROM, movement efficiency)
3. **Form score history + progress graphs** (per-exercise trends over time)
4. **Expanded exercise library** (10-15 exercises with validated form rules)
5. **Form Coach home screen card** ("Your squat form improved 8% this week")

### Tool Stack

| Tool | Purpose | Priority |
|------|---------|----------|
| **RevenueCat** | Subscription management | P0 (when Apple Dev account ready) |
| **Superwall** | A/B test paywalls | P1 (after initial paywall ships) |
| **Amplitude/Mixpanel** | Event tracking + funnel analysis | P0 |
| **PostHog** | Already integrated — use for feature flags + analytics | P0 |
| **MMKV** | Local subscription state (mock) | P0 |

---

## 9. GARLI ANALYSIS — WHAT TO BORROW

From the 21 screenshots analyzed (Garli onboarding + app):

### Borrow
- **"Where do you get [content] from?"** screen — ask where they find workouts (TikTok/IG/YouTube) = validates our value prop during onboarding + marketing attribution data
- **Goal selection with motivational copy** — "What are your goals?" with clear icons
- **"How did you hear about us?"** attribution screen — valuable for marketing channel optimization
- **Widget prompt** — "I'll cheer you on from your home screen!" (builds daily engagement)
- **Progress curve: "Now -> Your goal"** — visual "before/after" journey map
- **Trial reminder screen** — "We'll remind you 2 days before trial ends" with specific date
- **"Organize Your [Content]"** value screen — shows the organized library as the paywall pitch
- **Social proof on paywall** — "Success stories from our users" with testimonials + app store rating badge + content count ("50K+ recipes saved")

### Skip for V1
- XP/leveling system (too complex for V1, feels hollow without community)
- Leaderboard (needs social features)
- Achievements badges (nice-to-have, not conversion driver)
- Friend system (Phase 2+)
- Widget (Phase 2 — good retention mechanic but not V1 priority)

### Adapt to Fitness
- Garli's "Import recipes from anywhere" -> "Convert workouts from anywhere"
- Garli's "Add your first recipe" during onboarding -> "Convert your first workout" during onboarding
- Garli's recipe library -> workout library with the same "collection" psychology
- Garli's "No Cooking" widget -> potential "Today's Workout" widget (Phase 2)

---

## 10. SPECIFIC ONBOARDING COPY SUGGESTIONS

### Welcome Screen
- "Your workout videos. Your structured plans."
- "Turn any fitness video into sets, reps, and rest times"

### Demo Conversion Screen
- "Paste any workout video link"
- "Works with TikTok, Instagram, YouTube & more"
- Success: "Your first workout is ready!"

### Quiz Screens
- Goal: "What are you training for?"
- Experience: "How would you describe your fitness level?"
- Equipment: "What do you have to work with?"
- Frequency: "How many days can you train?"
- Duration: "How long are your typical sessions?"
- Focus: "Any areas you want to prioritize?"

### Personalized Plan
- "Based on your profile, here's your ideal setup"
- "[Goal] program - [X] days/week - [Duration] min sessions"
- "Estimated time to see results: 4-8 weeks"
- Graph: "Now -> Your Goal" (ascending curve)

### Paywall
- "Unlock unlimited workout conversions"
- "Smart AI suggestions on every set"
- "Join [X] athletes training smarter"
- CTA: "Start My 7-Day Free Trial"
- Sub-CTA: "No payment now. Cancel anytime."

---

## 11. AI FORM COACH — STRATEGY & COMPETITIVE ANALYSIS

### Why This Feature Changes Everything

Clip2Fit has a structural advantage no competitor has: **it already knows what exercise the user is performing** (from the converted workout plan). Every form-check app faces the UX problem of "what exercise is the user doing?" — they either ask users to manually select (friction) or try to auto-detect from camera (unreliable). Clip2Fit skips this entirely.

**The full pipeline**: User finds workout video on TikTok -> Clip2Fit converts it -> User starts workout -> Taps "Form Coach" -> App pre-loads exercise-specific form rules -> Camera opens with skeleton overlay -> Real-time feedback. No competitor combines video-to-workout conversion with real-time form coaching.

### Competitor Landscape (Fragmented, No Dominant Player)

| App | Approach | Price | Status |
|-----|----------|-------|--------|
| **Tempo** | 3D depth sensor + ML | $39/mo + $395 hardware | Active, $398M funded. Hardware model dying. |
| **SHRED** | Pose estimation in training app | Subscription | Active. Closest to what we'd build. 92% accuracy claim. |
| **Kemtai** | 33-point skeleton, browser-based | Freemium | Active. Validated against 10-camera lab. Floor exercises fail. |
| **Onyx** | 3D mobile pose tracking | $15/mo | Acquired by Cult.fit for $12.7M (2021). |
| **Gymscore** | Post-workout video analysis | Freemium (4.8 stars) | Active. Async, not real-time. 5-dimension scoring system. |
| **CueForm** | LLM-only video analysis | $10/mo | Active. Inconsistent scores across identical submissions. |
| **FormCheck** | LLM-only video analysis | $13/mo | Active. Same inconsistency problem as CueForm. |
| **VAY** | Pose estimation + audio | Unknown | Active, Berlin startup. Also sells SDK. Tiny user base. |
| **Zenia** | Yoga-only pose tracking | Freemium | Active, niche. 2D-only causes angle-dependent errors. |
| **Agit** | Camera CV for bodyweight | Free | Active. 100+ schools use it (PE market). |

**Key patterns:**
1. No single dominant player — market is fragmented, most apps launched 2023-2025
2. Standalone form-check-only apps (CueForm, FormCheck) struggle with accuracy perception and retention
3. Most successful apps (SHRED, Tempo) embed form checking within a broader training platform
4. LLM-only approaches (no pose estimation) produce inconsistent, untrustworthy scores
5. Hardware-dependent approaches (Tempo, Mirror) are dying or pivoting to software-only

### Technical Architecture (Summary)

Full implementation plan: `plans/plan-form-coach-pose-camera.md`

- **Pose estimation**: Custom Expo Module — Apple Vision (iOS) + Google ML Kit (Android). ~20 FPS.
- **Skeleton rendering**: Skia Canvas reading SharedValue on UI thread. No React re-renders.
- **Rule-based feedback** (Layer 1): On-device, every frame, <1ms. Joint angles vs thresholds.
- **LLM coaching** (Layer 2, Phase 3): Claude Haiku every 3-5s. ~1.1-1.2s latency. ~$0.25/session cost.
- **VisionCamera conflict**: `react-native-worklets-core` vs `react-native-worklets` 0.7.2 (Reanimated v4). Solved by custom Expo Module wrapping native APIs directly.

### Accuracy & Exercise Selection

**AI vs human trainers** (blinded study): AI 92% accuracy detecting form errors vs 74% for certified trainers. AI excels at objective angle deviations; humans better at holistic assessment.

**MVP exercises** (highest AI accuracy, start here):
1. Squat — clear joint angles, large ROM, frontal/sagittal plane
2. Bicep curl — simple single-joint, easy to detect elbow drift
3. Lunge — similar to squat, clear depth markers
4. Overhead press — vertical bar path, clear shoulder/elbow angles
5. Deadlift — hip hinge pattern, spine angle tracking

**Avoid in MVP** (lowest accuracy): Floor exercises, Olympic lifts, cable/machine work, fast dynamic movements.

### Risks

1. **Accuracy perception** — One wrong form call = permanent trust loss. Under-promise, over-deliver. Ship 5 exercises with excellent rules, not 50 with mediocre ones.
2. **Phone placement friction** — Users need to prop phone ~6 feet away at waist height. Consider recommending a cheap tripod in onboarding.
3. **Thermal throttling** — 30+ min camera + ML = hot phone. Process every 2nd-3rd frame, use 720p, auto-reduce FPS if overheating.
4. **Competitive commoditization** — Pose estimation tech (MediaPipe, ML Kit) is free. The moat is Clip2Fit's unique video-to-workout + form coaching integration, not the ML model.
5. **This is Phase 2-3, not V1** — Ship subscription + paywall + onboarding first. Form coaching comes after core monetization is validated.

### Market Validation

- Over 50% of Americans would trust AI as their personal trainer (Flex AI, 2025-2026)
- Ages 18-29 most interested in real-time feedback features
- 25%+ of men willing to pay $21-30/mo for advanced fitness personalization
- AI in fitness market: $7.80B (2022) -> projected $30.56B by 2030 (20.5% CAGR)
- H&F apps generated $3.8B in IAP revenue in 2025 (record)

### Form Coach's Impact on Paywall Conversion

Form coaching shifts the paywall from "utility" (video conversion tool) to "personal" (AI watching YOUR body). This matters because:
- It's visual (animated skeleton on the paywall)
- It's personal (user just saw THEIR body tracked in the onboarding demo)
- It's safety-related (injury prevention = high motivation to pay)
- It addresses the #1 fear of solo gym-goers ("am I doing this right?")
- Comparison to alternative becomes even stronger: "vs $60+/hr for a personal trainer who watches your form"

---

## Resolved Decisions

- **Demo conversion counts as 1 of 3** free conversions (creates urgency faster)
- **No mascot** — clean/minimal design, serious fitness vibe
- **Auth AFTER paywall** — maximum friction reduction, user sees value first
- **Pricing: Monthly + Annual + Lifetime** — Monthly ($5.99) as price anchor, Annual ($29.99, 7-day trial) as default, Lifetime ($99.99) as tertiary. No weekly (wrong for H&F category). Based on deep research of RevenueCat/Adapty reports, competitor audit of 10 H&F apps, and pricing psychology analysis.
- **Attribution screen added** — "Where do you find workouts?" screen after demo conversion
- **Lifetime raised to $99.99** — 3.3x annual ratio (matches Strong), exceeds expected annual subscriber LTV
- **Weekly subscription rejected** — No H&F app uses weekly as primary. 3.4% 12-month retention (catastrophic). $4.99/week = $259/yr feels predatory. Only works with heavy paid acquisition (not organic-first). Credit/token model handles metered access better.
- **Form Coach = Phase 2 feature** — Ship core monetization (subscription + paywall + onboarding) first, then Form Coach. Not V1.
- **Two-tier pricing when Form Coach ships** — Pro ($5.99/mo, $29.99/yr) + Coach ($14.99/mo, $79.99/yr). Form coaching justifies premium tier. Single Pro tier for V1 launch.
- **Form Coach Demo added to onboarding** — Screen 2: 10-sec skeleton overlay demo. Second aha moment after video conversion demo. Total onboarding screens: 13.
- **Paywall headline shifts to Form Coach** — When Form Coach ships, "AI Form Coach watches every rep" replaces "Unlimited video conversions" as primary paywall bullet. More emotionally compelling, personal, safety-related.
- **Build Form Coach in-house** — Custom Expo Module (Apple Vision + ML Kit), not VisionCamera (worklets conflict) or commercial SDK (vendor dependency). Architecture validated in `plans/plan-form-coach-pose-camera.md`.

## Remaining Open Questions

1. **Analytics tool** — PostHog is already integrated. Should we add Amplitude/Mixpanel, or is PostHog sufficient for funnel analysis + feature flags? Superwall for paywall A/B testing is recommended regardless.

2. **"How did you hear about Clip2Fit?" screen** — Should we add a second attribution question (marketing channel) in addition to "Where do you find workouts?" (content source)? Garli has both. Adds value for UA optimization but adds another screen.

3. **Form Coach credit pricing** — 5 credits for $4.99 and 15 for $9.99 are initial estimates. Need to A/B test with Superwall once Form Coach ships. Also: should credits roll over month-to-month or expire?

4. **Form Coach onboarding demo timing** — Screen 2 (right after conversion demo) may feel like too many demos in sequence. Alternative: move to Screen 10 (just before "Your Plan" summary) so it's closer to the paywall. Need to test which placement converts better.

---

## Appendix: Research Sources

### Industry Reports
- RevenueCat State of Subscription Apps 2025/2026
- Adapty State of In-App Subscriptions 2025/2026
- Business of Apps: Health & Fitness App Benchmarks 2026
- Business of Apps: App Subscription Trial Benchmarks 2026

### Competitor Audit
- Strong, Hevy, Fitbod, Strava, MyFitnessPal, Noom, Fastic, Calm, Headspace, Lose It

### Twitter Thread Analysis
- @maubaron (Prayer Lock $2.5k->$25k/mo), @StevenCravotta (20% paywall conversion), @iamjasonlevin (Memelord $3M raised), @tadasgedgaudas (Adapty 2026 report), @jorgiabays (organic marketing), @ErnestoSOFTWARE ($70k/mo automation), @alexcooldev (AI influencer content)

### Pricing Psychology Sources
- RevenueCat: Subscription Pricing Psychology
- RevenueCat: Annual Subscriptions Pros and Cons
- RevenueCat: Weekly Subscriptions Guide
- RevenueCat: Lifetime Subscriptions Guide
- Apphud: 7 Subscription Pricing Psychology Tactics
- Subscription Index: Annual vs Monthly Pricing with Real Data

### Paywall Design Sources
- Superwall: 3 Proven Paywall Experiments
- Apphud: High-Converting Paywall Design
- AppAgent: Mobile App Onboarding - 5 Paywall Optimization Strategies
- RevenueCat: Guide to Mobile Paywalls
- Qonversion: Anatomy of Paywall
- FunnelFox: Engaging Paywall Screen Designs

### Retention & Growth Sources
- Orangesoft: 13 Strategies to Increase Fitness App Engagement and Retention
- CleverTap: Fitness Apps Retention Strategies
- Digital Yield Group: The Resolutioner Churn Problem
- Athletech News: Fitness Apps Are Highly Monetizable

### Marketing Sources
- StackInfluence: Top Fitness Marketing Ideas 2025
- inBeat Agency: TikTok UGC Strategy
- Superscale: TikTok UGC Strategy for Apps
- AppTweak: ASO Trends & Benchmarks Report 2025

### Form Coach Research
- Full competitor analysis + technical feasibility: `plans/research-realtime-form-feedback.md`
- Implementation plan: `plans/plan-form-coach-pose-camera.md`
- 10+ competitors analyzed: Tempo, Kemtai, Onyx, SHRED, VAY, Zenia, Gymscore, CueForm, FormCheck, Agit
- SDK options evaluated: Sency AI, KinesteX, QuickPose, PoseTracker
- Technical studies: MediaPipe accuracy (r=0.80-0.91), JMIR camera positioning study, AI vs human trainer blinded study (92% vs 74%)
- Market data: Flex AI trust survey, AI fitness market projections ($30.56B by 2030)

### Garli App Analysis
- 21 screenshots analyzed from full onboarding + main app flow
