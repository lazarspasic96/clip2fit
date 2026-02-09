# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Clip to Fit** converts fitness/workout videos from social media (TikTok, Instagram, YouTube, Facebook) into structured, reusable workout plans. Users paste a video URL or share directly from their social app. The app extracts audio, transcribes it, and uses AI to parse the transcription into exercises, sets, reps, rest times, and instructions.

No direct competitor exists in the fitness space — recipe apps (CookingGuru, Video2Recipe) have proven the model works.

## Tech Stack

### Mobile (this repo)

- **Expo SDK**: 54 (New Architecture enabled)
- **React/React Native**: 19.1.0 / 0.81.5
- **Router**: Expo Router 6 (file-based routing)
- **TypeScript**: 5.9 (strict mode)
- **Animations**: React Native Reanimated
- **Experimental**: React Compiler enabled, Typed Routes

### Backend

- **API**: Next.js App Router + tRPC
- **Background Jobs**: Trigger.dev (long-running video processing pipeline)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Caching**: Redis (Upstash)

### Processing Pipeline

- **Video Download**: yt-dlp (via Trigger.dev Python extension)
- **Audio Processing**: FFmpeg (via Trigger.dev build extension)
- **Transcription**: OpenAI Whisper API (`gpt-4o-transcribe`)
- **AI Extraction**: Claude API (Sonnet) or GPT-4o
- **Hosting**: Vercel (Next.js) + Trigger.dev Cloud (jobs)

## Core Pipeline Flow

1. User pastes URL or shares from social app
2. `POST /api/convert` → triggers background job, returns job ID
3. Trigger.dev task `convert-workout-video`:
   - Step 1: Download audio (yt-dlp)
   - Step 2: Transcribe (Whisper API)
   - Step 3: AI extraction → structured workout JSON
   - Step 4: Save to Supabase
   - Step 5: Notify client (Realtime)
4. Client polls/subscribes for status updates

## Data Models

- **Workout**: id, userId, sourceUrl, sourcePlatform, title, targetMuscles, difficulty, estimatedDuration, equipment, exercises, rawTranscript
- **Exercise**: id, workoutId, name, canonicalName, sets, reps, restBetweenSets, notes, order, muscleGroups
- **ConversionJob**: id, userId, sourceUrl, status (pending|downloading|transcribing|extracting|completed|failed), triggerRunId, workoutId

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in browser
npm run lint       # Run ESLint
```

## Architecture

### File-Based Routing (`app/`)

- `_layout.tsx` - Root layout with ThemeProvider (light/dark) + Stack navigator
- `(tabs)/` - Tab group layout with Home and Explore screens
- `modal.tsx` - Modal presentation screen

### Components (`components/`)

- `themed-text.tsx`, `themed-view.tsx` - Theme-aware base components
- `ui/` - Platform-specific primitives (IconSymbol uses SF Symbols on iOS, MaterialIcons on Android/web)

### Theming System

- Colors defined in `constants/theme.ts` (Colors.light/dark)
- `useColorScheme()` hook detects system preference
- `useThemeColor()` hook resolves colors based on current theme

### Code Style

- Always use arrow functions for React components — never `export default function` or `export function`.
- **Screens** (`app/` files): `const ScreenName = () => { ... }` with `export default ScreenName` at the bottom of the file.
- **Components** (`components/` files): `export const ComponentName = () => { ... }` (named export inline, no default export).
- One React component per file.
- Always use `Image` from `expo-image` for images — never use `Image` or `ImageBackground` from `react-native`
- Always add `pointerEvents="none"` to lucide-react-native icons inside Pressable/TouchableOpacity — SVG elements intercept touches otherwise

### Keyboard & Safe Area

- **NEVER** use `SafeAreaView` component — use `useSafeAreaInsets()` hook (avoids flickering/jumpy animations)
- Apply insets per-screen via `style={{ paddingTop: insets.top }}` etc.
- Scrollable screens: apply insets via `contentContainerStyle`
- Import `KeyboardAvoidingView` from `react-native-keyboard-controller` (NOT `react-native`)
- `behavior`: `"padding"` on iOS, `undefined` on Android
- Always set `keyboardVerticalOffset` — `insets.top` + fixed header height above screen
- Dismiss on outside tap: `<Pressable onPress={Keyboard.dismiss}>` wrapper
- Multi-input scrollable forms: use `KeyboardAwareScrollView` from `react-native-keyboard-controller`
- `keyboardShouldPersistTaps="handled"` on all ScrollViews with interactive elements
- `KeyboardProvider` wraps app at root (`app/_layout.tsx`)
- Android: `softwareKeyboardLayoutMode: "pan"` in `app.json`

### Path Aliases

- `@/*` maps to project root (e.g., `@/components/...`, `@/hooks/...`)

## MVP Phases

### Phase 1 — Core

- React Native app with URL paste input
- Next.js API + Trigger.dev pipeline (download → transcribe → extract)
- Basic workout display screen
- Supabase database + auth

### Phase 2 — UX Polish

- Share extension (iOS + Android)
- Real-time conversion status
- Workout library (saved workouts)
- Error handling and retry

### Phase 3 — Growth

- Workout history / calendar view
- Export to PDF
- Exercise database with images
- Push notifications

### Phase 4 — Advanced

- Multimodal video analysis (on-screen text + visual exercises)
- AI workout suggestions
- Training program builder
