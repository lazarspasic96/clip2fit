# AI Workout Generator — Trainer Chat

## Overview
Third workout creation path: conversational AI chat where user describes what they want → AI generates personalized workout → user accepts/swaps/skips exercises interactively → saves to library. Uses existing `POST /api/workouts` for persistence.

---

## Phase 0: Interactive HTML Demo

**Create:** `demo/ai-trainer-chat.html`

Single self-contained HTML file with:
- Dark theme matching app colors (`#09090b` bg, `#fafafa` text, `#84cc16` accent)
- Inter font from Google Fonts
- Simulated chat with mock data (no backend)
- User types → fake typing indicator → mock AI response with exercise cards
- Accept/Skip/Swap buttons on exercise cards
- Workout preview card with save button
- Mobile viewport (375px width, centered)
- CSS animations for message appearance, typing dots, card interactions

---

## Phase 1: Backend — New Profile Fields + DB Migration

### 1A. DB Schema Changes (`clip2fit-api`)

Add 6 columns to `profiles` table in `src/lib/db/schema.ts`:

```
experienceLevel    text  (beginner|intermediate|advanced)
preferredDuration  integer  (minutes, 15-120)
availableEquipment jsonb<string[]>  (e.g. ["barbell","dumbbell","cable","body only"])
injuries           jsonb<{bodyPart:string, severity:"avoid"|"light_only"}[]>
preferredSplit     text  (push_pull_legs|upper_lower|full_body|bro_split|no_preference)
trainingDaysPerWeek smallint  (2-7)
```

Create Drizzle migration. Update `src/lib/validations.ts` profile schemas. Update `GET/PATCH /api/profiles` to include new fields.

### 1B. Mobile Profile Types + API Mapping

**Modify:**
- `types/profile.ts` — add types: `ExperienceLevel`, `AvailableEquipment`, `Injury`, `PreferredSplit` + extend `UserProfile`
- `types/api.ts` — add new fields to `ApiProfilePayload` + `ApiProfileResponse` + update mappers

### 1C. Onboarding Extension (2 new screens)

**New files:**
- `app/(protected)/onboarding/experience.tsx` — experience level (radio: beginner/intermediate/advanced) + training days/week (stepper 2-7) + preferred duration (stepper 15-90min, 15min increments)
- `app/(protected)/onboarding/equipment.tsx` — available equipment (multi-select checkboxes from catalog equipment list) + injuries (optional body part + severity picker) + preferred split (radio)

Insert between existing `demographics` and `goal` screens. All fields optional/skippable.

**New settings edit sheets:**
- `sheets/edit-experience-level.tsx`
- `sheets/edit-preferred-duration.tsx`
- `sheets/edit-equipment.tsx`
- `sheets/edit-injuries.tsx`
- `sheets/edit-preferred-split.tsx`
- `sheets/edit-training-days.tsx`

**Modify:**
- `app/(protected)/settings.tsx` — add new rows in a "Training Preferences" section
- `contexts/profile-form-context.tsx` — add new fields to form ref

---

## Phase 2: Backend — AI Workout Generation Endpoint

### 2A. New API Route

**Create:** `src/app/api/workouts/generate/route.ts`

`POST /api/workouts/generate`

Request body:
```json
{
  "messages": [
    { "role": "user", "content": "Leg day, focus on quads" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Add more isolation" }
  ]
}
```

Flow:
1. Auth check (Supabase JWT)
2. Fetch user profile (all fields including new ones)
3. Fetch recent training history (last 30d — which muscle groups, frequency)
4. Fetch exercise catalog filtered by user's available equipment
5. Build system prompt with user context + catalog
6. Call OpenAI GPT-4o-mini with `response_format: { type: "json_object" }`
7. Validate response with `workoutExtractionSchema` (reuse existing)
8. Return structured workout JSON

Response:
```json
{
  "message": "Here's your leg day workout focused on quads!",
  "workout": { ...WorkoutExtraction },
  "suggestions": ["Make it harder", "Add warmup", "Swap to bodyweight"]
}
```

### 2B. System Prompt Builder

**Create:** `src/lib/ai/generate-workout-prompt.ts`

System prompt includes:
- User context: gender, age, height/weight, goal, experience level, injuries, equipment, preferred split, duration
- Training history: muscle groups trained in last 7/30 days + frequency
- Exercise catalog: `UUID|Name (aliases)` format (reuse pattern from `extract-workout.ts:67-71`)
- Instructions: match exercises to catalog UUIDs, respect injuries, honor equipment constraints, match requested duration
- Personalization rules: adjust volume/complexity for experience level, consider gender-appropriate defaults (without stereotyping — let AI use context)

### 2C. Validation

**Modify:** `src/lib/validations.ts` — add `generateWorkoutRequestSchema` (messages array) + reuse `workoutExtractionSchema` for response validation

---

## Phase 3: Mobile — Trainer Chat UI

### 3A. Entry Point on Home Screen

**Create:** `components/home/ai-trainer-card.tsx`

Card placed between `ImportFromSocialsCard` and `WeeklyTrainingPlan` in home screen. Design:
- `bg-background-tertiary rounded-2xl p-4 mx-5`
- Left: 44x44 gradient circle (lime→cyan) with Sparkles icon, subtle pulsing glow animation (Reanimated)
- Right: "Generate with AI" title + 3 horizontally scrollable suggestion chips ("Leg Day", "Push Day", "Full Body") in `bg-background-secondary rounded-full px-3 py-1.5`
- Tapping chip → navigates to `/(protected)/ai-workout?prompt={chip text}`
- Tapping card body → navigates to `/(protected)/ai-workout`

**Modify:** `app/(protected)/(tabs)/(home)/index.tsx` — add `<AiTrainerCard />` after `<ImportFromSocialsCard />`

**Modify:** `app/(protected)/add-workout.tsx` — add 4th option "Generate with AI" with Sparkles icon + lime accent circle, routes to `/(protected)/ai-workout`

### 3B. Chat Screen

**Create:** `app/(protected)/ai-workout.tsx` — main screen (fullScreenModal presentation)

Layout:
- Header: "AI Trainer" title + X close button
- Inverted FlatList for messages (auto-scroll to bottom)
- Sticky bottom input bar: TextInput + send button

Message types (discriminated union):
```typescript
type ChatMessage =
  | { type: 'user'; text: string }
  | { type: 'assistant'; text: string }
  | { type: 'workout'; workout: WorkoutExtraction }
  | { type: 'loading' }
```

State management: local `useState` for messages array. No context needed — chat is ephemeral.

### 3C. Chat Components

**Create:**
- `components/ai-workout/chat-message-bubble.tsx` — renders user (right, `bg-brand-accent` + dark text) and assistant (left, `bg-background-tertiary` + light text) text bubbles
- `components/ai-workout/chat-input-bar.tsx` — TextInput with send button + quick reply chips
- `components/ai-workout/typing-indicator.tsx` — 3 bouncing dots animation (Reanimated)
- `components/ai-workout/exercise-suggestion-card.tsx` — rich exercise card shown inline in chat:
  - `ExerciseMotionPreview` (56x64, reuse from `components/workout/shared/exercise-motion-preview.tsx`)
  - Exercise name, muscle group chips, sets x reps in `text-brand-accent`
  - 3 action buttons row: Accept (lime outline), Swap (tertiary), Skip (transparent)
- `components/ai-workout/workout-preview-card.tsx` — full workout preview card shown in chat after all exercises processed:
  - Collapsible card with title, exercise count, duration, difficulty
  - Exercise list (condensed rows)
  - "Save to Library" CTA button (lime)
  - "Start Now" text button below
- `components/ai-workout/suggestion-chips.tsx` — horizontal scroll of quick reply chips ("Make it harder", "Add warmup", "More isolation")

### 3D. Chat Flow

1. Screen opens → AI sends greeting message using user's name + contextual observation ("You haven't trained legs in 5 days" based on session history)
2. If opened with `?prompt=Leg Day` → auto-sends that as first user message
3. User types free text or taps suggestion chip
4. Loading indicator appears → API call to `POST /api/workouts/generate`
5. Response arrives → AI text message + exercise cards appear one after another (staggered FadeInUp, 100ms delay between each)
6. User interacts with exercise cards:
   - **Accept** → card gets lime left border + check icon, counter in bottom bar increments
   - **Skip** → card fades to 40% opacity, strikethrough on name
   - **Swap** → replaces card with alternative (re-calls API with "swap exercise X for something similar" appended to messages)
7. After processing all exercises → workout preview card appears
8. User taps "Save to Library" → calls existing `POST /api/workouts` with accepted exercises → confetti animation + success haptic → navigate to workout detail

### 3E. Bottom Workout Bar

Sticky bar at bottom (above input) appears after first exercise accepted:
- "{N} exercises added" + progress pill
- "Preview" button → scrolls to workout preview card or shows it inline

### 3F. Saving Workout

Reuse existing `useCreateWorkoutMutation` from `hooks/use-api.ts`. Build `CreateWorkoutPayload` from accepted exercises (only those with status=accepted, not skipped). Navigate to `/(protected)/(tabs)/my-workouts?newWorkoutId={id}` to trigger existing highlight animation.

---

## File Summary

### New Files (Mobile — `clip2fit`)
| File | Description |
|------|-------------|
| `demo/ai-trainer-chat.html` | Interactive HTML demo |
| `app/(protected)/ai-workout.tsx` | Chat screen |
| `app/(protected)/onboarding/experience.tsx` | Experience + duration + days onboarding |
| `app/(protected)/onboarding/equipment.tsx` | Equipment + injuries + split onboarding |
| `components/home/ai-trainer-card.tsx` | Home screen entry card |
| `components/ai-workout/chat-message-bubble.tsx` | Text bubble component |
| `components/ai-workout/chat-input-bar.tsx` | Input bar + send button |
| `components/ai-workout/typing-indicator.tsx` | Bouncing dots |
| `components/ai-workout/exercise-suggestion-card.tsx` | Interactive exercise card |
| `components/ai-workout/workout-preview-card.tsx` | Final workout preview |
| `components/ai-workout/suggestion-chips.tsx` | Quick reply chips |
| `hooks/use-generate-workout.ts` | React Query mutation for AI generation |
| `sheets/edit-experience-level.tsx` | Settings edit sheet |
| `sheets/edit-preferred-duration.tsx` | Settings edit sheet |
| `sheets/edit-equipment.tsx` | Settings edit sheet |
| `sheets/edit-injuries.tsx` | Settings edit sheet |
| `sheets/edit-preferred-split.tsx` | Settings edit sheet |
| `sheets/edit-training-days.tsx` | Settings edit sheet |

### New Files (API — `clip2fit-api`)
| File | Description |
|------|-------------|
| `src/app/api/workouts/generate/route.ts` | AI generation endpoint |
| `src/lib/ai/generate-workout-prompt.ts` | System prompt builder |
| DB migration file | Add 6 new profile columns |

### Modified Files (Mobile)
| File | Change |
|------|--------|
| `types/profile.ts` | Add new types + extend UserProfile |
| `types/api.ts` | Add new API types + update mappers |
| `app/(protected)/(tabs)/(home)/index.tsx` | Add `<AiTrainerCard />` |
| `app/(protected)/add-workout.tsx` | Add 4th "Generate with AI" option |
| `app/(protected)/settings.tsx` | Add "Training Preferences" section |
| `contexts/profile-form-context.tsx` | Add new form fields |

### Modified Files (API)
| File | Change |
|------|--------|
| `src/lib/db/schema.ts` | Add 6 columns to profiles |
| `src/lib/validations.ts` | Add generate request schema, update profile schemas |
| `src/app/api/profiles/route.ts` | Include new fields in GET/PATCH |

---

## Reusable Existing Code

| What | Path | How |
|------|------|-----|
| `ExerciseMotionPreview` | `components/workout/shared/exercise-motion-preview.tsx` | Exercise images in chat cards |
| `ExercisePlaceholder` | `components/workout/shared/exercise-placeholder.tsx` | Fallback when no image |
| `useCreateWorkoutMutation` | `hooks/use-api.ts` | Save workout to library |
| `useProfileQuery` | `hooks/use-api.ts` | Fetch user profile for context |
| `mapApiWorkout` | `types/api.ts` | Map saved workout response |
| `workoutExtractionSchema` | `clip2fit-api/src/lib/validations.ts` | Validate AI output |
| Extract prompt pattern | `clip2fit-api/src/trigger/steps/extract-workout.ts:67-71` | Catalog formatting for AI |
| `Button` | `components/ui/button.tsx` | CTA buttons |
| `SwipeableRow` | `components/ui/swipeable-row.tsx` | Potential swipe interactions |
| `Colors` | `constants/colors.ts` | Color tokens |
| `ImportFromSocialsCard` | `components/home/import-from-socials-card.tsx` | Card layout pattern reference |

---

## Verification

1. **Demo**: Open `demo/ai-trainer-chat.html` in browser → interact with simulated flow → verify all animations work
2. **Backend**: `curl -X POST /api/workouts/generate -d '{"messages":[{"role":"user","content":"Leg day focus quads"}]}' -H "Authorization: Bearer ..."` → verify JSON with exercises, catalog IDs, muscle groups
3. **Profile**: Update profile with new fields → verify persisted → verify AI prompt includes them
4. **Chat UX**: Open AI Trainer → type prompt → verify loading → verify exercise cards render with images → accept 3, skip 1 → verify preview shows 3 → save → verify appears in library
5. **Edge cases**: empty prompt (show error chip), no matching equipment (AI adapts), user has no profile (use sensible defaults), API timeout (show retry button)

---

## Decisions

| Question | Answer |
|----------|--------|
| Which concept? | Concept 1: Trainer Chat |
| AI provider? | OpenAI GPT-4o-mini (consistent with existing backend) |
| New profile fields? | Add now — better AI quality from day one |
| Streaming? | All at once — simpler, show loading then reveal |
