# Clip2Fit — Designer Screenshot Brief

## What the App Does

Clip2Fit is a complete gym companion with 1,300+ exercises — each with step-by-step instructions on how to perform them. Users can browse the catalog, build custom workouts, track every set and rep in real time, and follow a weekly schedule. On top of that, Clip2Fit does something no other fitness app can: users share a workout video directly from TikTok, Instagram, or YouTube (or paste a link) and the app uses AI to convert it into a structured, reusable workout plan with exercises, sets, reps, rest times, and coaching cues.

## Platform & IDs

- **iOS Bundle ID**: `com.lazarspasic96.clip2fit`
- **Android Package**: `com.lazarspasic96.clip2fit`
- **Orientation**: Portrait only

## Visual Identity

**Theme**: Dark mode only (no light theme)

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background Primary | `#09090b` | Main screen bg |
| Background Secondary | `#18181b` | Cards, surfaces |
| Background Tertiary | `#27272a` | Elevated cards, inputs |
| Content Primary | `#fafafa` | Headlines, primary text |
| Content Secondary | `#a1a1aa` | Subtitles, secondary text |
| Content Tertiary | `#71717a` | Muted labels |
| Brand Accent | `#84cc16` (lime-500) | CTAs, active tab, highlights |
| Brand Logo | `#bef264` (lime-300) | Logo text, success badges |
| Border Primary | `#27272a` | Card borders |
| Border Secondary | `#3f3f46` | Subtle dividers |
| Destructive | `#dc2626` | Delete actions |e

### Fonts

- **Inter** — Primary font (Regular 400, Medium 500, SemiBold 600, Bold 700)
- **Onest** — Secondary/accent font (Regular 400)

### App Icon

Lime green play-button + circular vinyl/target motif on dark `#09090b` background (hand-drawn/sketch style).

### Welcome Screen Image

Athletic woman with headphones holding a yoga mat, dark moody lighting.

## Tab Structure (5 tabs)

| Tab | Icon | What It Shows |
|-----|------|---------------|
| **Home** | House | Greeting, today's workout card with Start button, weekly training plan strip, share-from-socials CTA, activity heatmap (GitHub-style grid) |
| **Schedule** | Calendar | 7-day weekly schedule — assign workouts to days, shows workout cards per day |
| **Library** | Dumbbell | All saved workouts as swipeable cards (swipe to delete), pull-to-refresh |
| **Stats** | Chart | Performance analytics — period selector (7d/30d/90d/1y), top exercises, muscle focus breakdown, progression trends |
| **Profile** | Person | User profile dashboard, fitness settings, account management |

Tab bar: blurred glass effect on iOS (BlurView), solid dark on Android. Active tint = lime `#84cc16`, inactive = zinc `#a1a1aa`.

## Key Screens (Screenshot Candidates)

### 1. Welcome/Landing

Full-bleed hero image with gradient overlay, "Your Gym Coach in Your Pocket" headline with lime accent on "Your Pocket", Sign up / Log in buttons.

### 2. Onboarding Flow (11 steps)

Clean card-selection UI with icons:

- Goal (Lose Weight, Build Muscle, Get Stronger, etc.)
- Experience level
- Focus areas (muscle groups)
- Equipment available
- Training style
- Activity level
- Frequency & Duration
- Workout location
- Injuries
- About you (name, demographics)

### 3. Home Screen

Personalized greeting ("Hey {name}"), today's workout card with thumbnail/creator handle/Start button (primary CTA), weekly training plan strip, "Share from Socials" card with TikTok/Instagram/YouTube icons + share icon (secondary CTA), GitHub-style activity heatmap.

### 4. Add Workout

Three methods: Share from App (share button from TikTok/IG/YT — primary, one-tap flow), From URL (paste link as fallback), Manual Entry (browse 1,300+ exercise catalog).

### 5. URL Processing

Real-time conversion status (downloading > transcribing > extracting > complete), floating conversion pill visible globally.

### 6. Workout Proposal

AI-extracted workout preview before saving to library.

### 7. Library

Animated workout cards with staggered entrance, swipe-to-delete with red action, new workout highlight glow (lime border pulse).

### 8. Workout Detail

Full workout breakdown with exercises, sets, reps. Each exercise links to detailed instructions (how to perform, muscles targeted, common mistakes).

### 9. Active Workout

Live workout tracking session — log sets, reps, and weight in real time. Rest timer between sets, exercise-by-exercise progress, running totals. Tap any exercise name to view form instructions mid-workout.

### 10. Exercise Catalog

Magazine-style browsable database of 1,300+ exercises with search, filters (muscle group, equipment), multi-select for workout builder. Each exercise card shows name, primary muscles, equipment needed. Tap to expand: step-by-step instructions, form tips, common mistakes, and muscle group diagram.

### 11. Exercise Detail

Full-screen exercise breakdown: step-by-step instructions on how to perform the exercise, primary and secondary muscles worked (highlighted on body diagram), equipment needed, common mistakes to avoid, and form tips. Option to add directly to a workout.

### 12. Workout Builder

Build custom workout: title input, draggable exercise list, add more exercises, save.

### 13. Schedule

Weekly view with workout assignments per day, tap to assign/swap.

### 14. Stats / Performance Lab

Period selector, training analytics, top exercises, muscle focus charts.

### 15. PR Celebration

Personal record celebration screen (confetti/animation).

### 16. Form Coach

Real-time camera with skeleton overlay for exercise form analysis (AI-powered pose detection with lime-colored skeleton lines and joint dots).

### 17. Profile

User info, fitness preferences, settings.

## UI Patterns

- **Rounded corners** everywhere (2xl = 16px, 3xl for buttons)
- **Collapsing headers** with blur effect on scroll (Home, Library, Schedule, Profile)
- **Animated transitions** — FadeInDown on welcome, staggered FadeInUp on lists
- **Cards** — `bg-background-secondary` or `bg-background-tertiary` with rounded-2xl
- **Buttons** — Primary: lime `#84cc16` bg with dark text. Secondary: dark bg with light text. Ghost: transparent
- **Icons** — Lucide React Native throughout (consistent stroke style)
- **Swipeable rows** in Library (swipe left = red delete action)
- **Bottom sheets** for pickers, filters, edit actions
- **Pull-to-refresh** on scrollable screens
- **Floating conversion pill** — persists across screens during video processing

## Taglines / Copy

- "Your Gym Coach in Your Pocket"
- "1,300+ exercises with step-by-step instructions. Track every set. Grab any workout from TikTok, Instagram, or YouTube. No more excuses."
- "Know exactly how to do every exercise. Train with confidence. Track your progress."
- "See it on TikTok? Share it. Train it. Track it."

---

## Screenshot Copy Strategy

> Based on App Store Screenshot Optimization best practices from @DesignerAnts (1,000+ optimized listings, 80% conversion lift documented).

### Golden Rules

1. **70% of screenshot effectiveness comes from text overlay, not the UI.** The design supports the words, not the other way around.
2. **Lead with outcomes, not features.** Users aren't asking "what does this app do?" — they're asking "is this for me?"
3. **Screenshots must tell a story in sequence.** If they work in any order, it's a catalog, not a pitch.
4. **Write the headline BEFORE designing the screenshot.** If you can't say it in ~8 words, you don't understand it well enough.
5. **The "hand test"** — Cover the UI with your hand and read only the text. Does it tell a story or list features?
6. **Text is the product. UI is the evidence.** The headline makes the argument; the screen behind it is the visual proof.

### Recommended Screenshot Sequence

| # | Role | Purpose |
|---|------|---------|
| 1 | **Name the pain** | Their frustration before finding you |
| 2 | **State the shift** | What changes when they use the app |
| 3 | **Show proof** | Numbers, social proof, concrete result |
| 4-6 | **Feature delivery** | Capabilities that deliver the promise from Screenshot 2 |

### Proposed Headlines for Clip2Fit

| # | BAD (feature-first) | GOOD (outcome-first) | App Screen Behind It |
|---|---------------------|----------------------|---------------------|
| 1 | "Browse our exercise database" | **"Stop Guessing How to Do Exercises"** | Exercise catalog with detail/instructions open |
| 2 | "1,300+ exercise library" | **"1,300+ Exercises. Every One Explained."** | Exercise catalog browse view with filters |
| 3 | "Import from TikTok, Instagram, YouTube" | **"See It on TikTok. Train It Today."** | Share extension flow (share button, not paste) |
| 4 | "Real-time workout tracking" | **"Track Every Set. Every Rep. Every PR."** | Active workout session with logged sets |
| 5 | "Weekly schedule planner" | **"Your Week. Planned and Ready."** | Schedule screen with workouts assigned |
| 6 | "Track your workout progress" | **"See How Far You've Come"** | Stats / Performance Lab with charts |

### Why This Order Works

- **Screenshot 1** hooks anyone who's ever stood in a gym unsure if they're doing an exercise right — universal pain point
- **Screenshot 2** delivers the proof — this isn't a small library, it's comprehensive and every exercise is explained
- **Screenshot 3** introduces the unique differentiator — grab any influencer workout with one tap from social media
- **Screenshot 4** shows the tracking experience — this isn't just a reference app, it's an active training tool
- **Screenshots 5-6** round out the story — plan your week, see your progress over time

### Additional Copy Alternatives (A/B test candidates)

Screenshot 1 alternatives:
- "Not Sure You're Doing It Right?"
- "Every Exercise. Step by Step."

Screenshot 2 alternatives:
- "Your Complete Exercise Encyclopedia"
- "Search Any Exercise. Learn Proper Form."

Screenshot 3 alternatives:
- "TikTok. Instagram. YouTube. One Tap."
- "Share the Video. Get the Workout."

Screenshot 4 alternatives:
- "Log It While You Lift It"
- "Your Workout. Tracked in Real Time."

### What to Avoid

- Feature lists disguised as headlines ("Dark mode support", "iCloud sync")
- Technical jargon ("AI-powered transcription pipeline")
- Generic fitness language ("Your fitness journey starts here")
- Multiple messages per screenshot — one screen, one message
