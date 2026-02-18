# Stats & PRs Screen — Complete Redesign Plan (5 Unique Directions)

## 1) Product Goal
Create a fully new Stats experience that makes training trends obvious in under 5 seconds.

Required outcomes:
- Show `Top Exercises` (most trained exercises).
- Show `% by muscle group` (which muscles are trained most).
- Make each top-exercise card tappable and open `Exercise History` with a time-series graph.
- Replace previous concepts completely.
- Produce 5 clearly different visual directions, each clean and production-ready for mobile.

## 2) Non-Negotiable UX Requirements
- The Stats tab must load meaningful summary data first, then progressively reveal deeper sections.
- The top-exercise section must be card-based and always interactive.
- Exercise detail must include:
  - period switch (`4w`, `12w`, `24w`, `1y`, `all`)
  - progress graph over time
  - PR markers
  - key stats (current PR, lifetime PR count, last trained date)
- Muscle distribution must display percentages and a clear ranking.
- Empty states must guide action (`Start a workout`, `Log your first set`).

## 3) API/Data Contract (from current backend docs)
- `GET /api/stats/summary?timezone=<IANA>&weeks=<int>`
  - Includes `top_exercises[]`, `muscle_group_distribution[]`, `weekly_frequency[]`, streaks, totals.
- `GET /api/stats/prs?catalog_exercise_id=<uuid>`
  - Includes PR timeline per exercise.

Derived UI data:
- `musclePercent = session_count / sum(session_count) * 100`
- `topExercises = top_exercises.slice(0, 6)` for cards
- `sparklineSeries` from weekly frequency or exercise PR timeline

## 4) Navigation + Information Architecture
- Add 4th tab route: `app/(protected)/(tabs)/stats.tsx`
- Add detail route: `app/(protected)/exercise-history.tsx`
- Top exercise tap action:
  - `router.push('/(protected)/exercise-history?catalogExerciseId=...&exerciseName=...')`

Stats screen structure:
1. Header (title + period selector)
2. Hero summary module (varies by concept)
3. Top exercises (cards, horizontal or grid based on concept)
4. Muscle distribution module
5. Weekly trend module

Exercise History structure:
1. Header with exercise name and back action
2. Time period segmented control
3. Main line chart (PR points highlighted)
4. Secondary metrics row
5. Session log mini-list

## 5) Five Unique Design Concepts

### Concept A — `Precision Deck`
Design character:
- Premium dashboard cards with strong hierarchy and generous negative space.
- Clean geometry, low visual noise, highly readable.

Visual system:
- Background: `background-primary`
- Surfaces: `background-secondary`, `background-tertiary`
- Accent: `brand-accent` with restrained usage
- Typography: Inter only, strict weight hierarchy (`700`, `600`, `400`)
- Spacing rhythm: 8pt base, major blocks at 20/24

Layout:
- Hero: large KPI card with completion and streak.
- Top exercises: 2-column card grid, each card includes:
  - exercise name
  - session count
  - tiny sparkline
  - chevron affordance
- Muscle distribution: sorted horizontal bars with right-aligned percent.

Why it is unique:
- Most minimal and executive-style direction; focus on clarity over flair.

### Concept B — `Athlete Journal`
Design character:
- Editorial storytelling layout with section dividers and stat callouts.
- Feels like a personal training logbook.

Visual system:
- Dark neutral canvas with warm accent chips for highlights.
- Typography pairing: Onest for headings, Inter for body/meta.
- Subtle separators and boxed annotations.

Layout:
- Hero: week-over-week summary block with narrative text.
- Top exercises: vertically stacked large cards (one per row), each card contains:
  - rank badge
  - exercise title
  - "most trained this period" subtitle
  - right-side micro trend chart
- Muscle distribution: segmented stacked bar with labeled legend + percentages.

Why it is unique:
- Narrative-first; reads like progress notes rather than a dashboard.

### Concept C — `Performance Lab`
Design character:
- Technical, sports-science look with denser information and metric instrumentation.
- Strong contrast and data-first visual language.

Visual system:
- Deep dark background, muted grid overlays.
- Accent pair: lime (`brand-accent`) + cyan for secondary trend.
- Tabular numbers everywhere for metric scan speed.

Layout:
- Hero: compact metric matrix (sessions, volume, streak, PR count).
- Top exercises: horizontal scroll cards with prominent mini-chart and delta badge (`+12%`).
- Muscle distribution: radar chart plus ranked list with percentages.

Why it is unique:
- Most analytical concept; optimized for advanced users comparing performance trends.

### Concept D — `Momentum Flow`
Design character:
- Motion-oriented layout that emphasizes progress direction and continuity.
- Softer cards, curved dividers, rounded graph containers.

Visual system:
- Neutral dark surfaces with gradient-free tonal layering.
- Accent used to indicate progression states (past to current).
- Rounded corners and flowing section transitions.

Layout:
- Hero: progress ribbon showing last 4 weeks trend.
- Top exercises: carousel cards with large exercise title and animated line path.
- Muscle distribution: circular ring segments with percentage labels below.

Why it is unique:
- Most dynamic and movement-centric direction; visually communicates "ongoing momentum."

### Concept E — `Arena Tiles`
Design character:
- Bold modular tiles inspired by scoreboards and match stats.
- Strong blocks, clear grouping, gamified feel.

Visual system:
- High-contrast tile surfaces with one accent tile per row.
- Mixed large and compact tile sizes in a masonry-like arrangement.
- Distinct category icons for quick scanning.

Layout:
- Hero: tile cluster with current streak and weekly target completion.
- Top exercises: tap-first rectangular tiles with:
  - medal rank
  - exercise
  - session count
  - "View History" call-to-action
- Muscle distribution: treemap-style tile pack where tile area maps to muscle percent.

Why it is unique:
- Most gamified and block-driven; creates a strong "performance board" identity.

## 6) Shared Interaction Specs (all 5 concepts)
- Top exercise cards:
  - Press feedback: opacity + slight scale down (`0.98`) within 120ms.
  - Tap opens Exercise History route with params.
  - Long press opens quick actions (`View PRs`, `View sessions`).
- Charts:
  - Animate on mount (<= 500ms).
  - No continuous looping animations.
  - Tooltips on point press for exact values.
- States:
  - Loading: skeletons matching final layout shape.
  - Empty: single primary action button.
  - Error: inline retry near failed block.

## 7) Technical Build Plan

### Phase 0 — Foundation
- Create stats types:
  - `/Users/lazarspasic/git/clip2fit/.worktrees/codex-stats-redesign/types/stats.ts`
- Create stats hooks:
  - `/Users/lazarspasic/git/clip2fit/.worktrees/codex-stats-redesign/hooks/use-stats.ts`
- Add query keys:
  - `/Users/lazarspasic/git/clip2fit/.worktrees/codex-stats-redesign/constants/query-keys.ts`

### Phase 1 — Navigation Wiring
- Add Stats tab trigger:
  - `/Users/lazarspasic/git/clip2fit/.worktrees/codex-stats-redesign/app/(protected)/(tabs)/_layout.tsx`
- Add route registration:
  - `/Users/lazarspasic/git/clip2fit/.worktrees/codex-stats-redesign/app/(protected)/_layout.tsx`

### Phase 2 — Shared Building Blocks
- `components/stats/shared/stats-header.tsx`
- `components/stats/shared/period-selector.tsx`
- `components/stats/shared/top-exercise-card.tsx`
- `components/stats/shared/muscle-percent-list.tsx`
- `components/stats/shared/loading-skeletons.tsx`

### Phase 3 — Build Final Design Variant
- `components/stats/design-c-performance-lab/overview.tsx`
- Keep only Performance Lab and remove all other design variants + selector state.

### Phase 4 — Exercise History Screen
- Create:
  - `/Users/lazarspasic/git/clip2fit/.worktrees/codex-stats-redesign/app/(protected)/exercise-history.tsx`
- Include:
  - line chart over time
  - PR point annotations
  - period filter
  - session milestones list

### Phase 5 — Polish and QA
- Spacing pass (consistent vertical rhythm and card padding).
- Typography pass (size/weight consistency and truncation rules).
- Color pass (accent usage capped per section).
- Accessibility pass (labels, touch targets, contrast).
- Performance pass (memoized card list, chart render budget check).

## 8) Design Acceptance Checklist
- Performance Lab is the only active Stats visual language.
- Top-exercise cards are immediately discoverable and tappable.
- Muscle group percentages are understandable without reading help text.
- Exercise history graph clearly shows improvement over time.
- No crowded spacing, no inconsistent font hierarchy, no accidental color noise.
