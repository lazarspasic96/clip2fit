# Clip to Fit — Comprehensive Technical Analysis

## 1. Concept Overview

**Clip to Fit** is a mobile app that transforms fitness/workout videos from social media platforms (TikTok, Instagram, YouTube, Facebook) into structured, reusable workout plans. Users paste a video URL (or share directly from their social app), and the app extracts the narrator's voice, transcribes it, and uses AI to parse the transcription into a structured workout format with exercises, sets, reps, rest times, and instructions.

This is the **fitness equivalent** of what apps like **CookingGuru**, **Video2Recipe**, and **YTRecipe** do for cooking videos — but applied to gym and training content.

---

## 2. Similar Products & Market Landscape

### Direct Competitors (Recipe Domain — Your Inspiration)

| App | What It Does | How It Works |
|-----|-------------|--------------|
| **CookingGuru** (cooking.guru) | Converts TikTok/Instagram/YouTube cooking videos into structured recipes | AI analysis of video — works even on silent videos |
| **Video2Recipe** (video2recipe.com) | Paste YouTube URL → get ingredients + steps | AI-powered transcription + LLM extraction |
| **YTRecipe** (ytrecipe.com) | YouTube cooking video → downloadable PDF recipe | Community-curated + AI extraction, supports 20+ languages |
| **Social Recipes** (GitHub: pickeld/social_recipes) | Open-source! TikTok/YouTube/Instagram → recipe manager | Uses yt-dlp + Whisper + LLM (OpenAI/Gemini). Great reference architecture |

### Fitness Domain (No Direct Competitor Yet!)

| App | What It Does | Gap |
|-----|-------------|-----|
| **TrueCoach** | Video exercise library for coaches | Creates videos, doesn't extract from social media |
| **Hyperhuman** | AI workout builder + video platform | Generates workouts, doesn't consume social media videos |
| **Hevy / Strong / JEFIT** | Workout tracking apps | Manual input only, no video-to-workout conversion |

**🎯 Key Insight: There is NO direct competitor doing "social media workout video → structured workout plan" in the fitness space. This is a blue ocean opportunity.** The recipe space has proven the model works (CookingGuru, Video2Recipe), but nobody has applied it to fitness yet.

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Paste URL │  │ Share    │  │ Workout Library      │  │
│  │ Input     │  │ Extension│  │ (saved workouts)     │  │
│  └─────┬─────┘  └────┬─────┘  └──────────────────────┘  │
│        │              │                                   │
│        └──────┬───────┘                                   │
│               ▼                                           │
│     POST /api/convert  { url: "https://tiktok.com/..." } │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│              BACKEND (Next.js API / tRPC)                  │
│                                                           │
│  1. Validate URL (which platform?)                        │
│  2. Trigger background job ──────────────────────┐        │
│  3. Return job ID to client                      │        │
│  4. Client polls/subscribes for status           │        │
└──────────────────────────────────────────────────┼────────┘
                                                   │
                                                   ▼
┌───────────────────────────────────────────────────────────┐
│              TRIGGER.DEV (Background Jobs)                 │
│                                                           │
│  Task: "convert-workout-video"                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Step 1: Download video (yt-dlp)                     │  │
│  │ Step 2: Extract audio (FFmpeg)                      │  │
│  │ Step 3: Transcribe audio (Whisper API)              │  │
│  │ Step 4: AI extraction (Claude/GPT → structured)     │  │
│  │ Step 5: Save to database                            │  │
│  │ Step 6: Notify client (Realtime)                    │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│              DATABASE (Supabase / PostgreSQL)              │
│                                                           │
│  - Users, Workouts, Exercises, Conversion Jobs            │
│  - Original URL, transcript, structured workout           │
└───────────────────────────────────────────────────────────┘
```

---

## 4. The Processing Pipeline (Deep Dive)

### Step 1: Video Download — `yt-dlp`

**yt-dlp** is THE tool for this. It's an open-source command-line video downloader supporting 1000+ sites including TikTok, Instagram, YouTube, Facebook, Twitter/X, and Reddit.

```bash
# Download video from any supported platform
yt-dlp "https://www.tiktok.com/@user/video/123456" -o "video.mp4"

# Extract audio only (saves bandwidth and processing time)
yt-dlp -x --audio-format mp3 "https://www.tiktok.com/@user/video/123456" -o "audio.mp3"
```

**Platform support:**
- ✅ YouTube (full support)
- ✅ TikTok (works, but TikTok may change things)
- ✅ Instagram Reels (requires cookies sometimes)
- ✅ Facebook (public videos)
- ✅ Twitter/X
- ✅ Reddit
- ⚠️ Instagram Stories (requires authentication/cookies)

**Key considerations:**
- yt-dlp is a **Python** tool but can be called from Node.js via child processes
- On Trigger.dev, you can use the **FFmpeg build extension** and install yt-dlp via `aptGet` or `pythonExtension`
- yt-dlp needs frequent updates as platforms change their anti-bot measures
- For Instagram, you may need to pass cookies for private/authenticated content

### Step 2: Audio Extraction — `FFmpeg`

```bash
# Extract audio from video file
ffmpeg -i video.mp4 -vn -acodec libmp3lame -q:a 4 audio.mp3

# Or extract and compress aggressively for faster transcription
ffmpeg -i video.mp4 -vn -ac 1 -ar 16000 -b:a 64k audio.mp3
```

Trigger.dev has a **first-party FFmpeg build extension** — perfect for this use case.

### Step 3: Transcription — OpenAI Whisper

**Options for speech-to-text:**

| Service | Pros | Cons | Cost |
|---------|------|------|------|
| **OpenAI Whisper API** (`gpt-4o-transcribe`) | Best accuracy, handles accents/noise well | 25MB file limit, costs per minute | ~$0.006/min |
| **OpenAI Whisper** (self-hosted) | Free, no API limits | Needs GPU, slower | Free (GPU costs) |
| **Deepgram** | Fast, real-time capable, speaker diarization | Paid API | ~$0.0043/min |
| **AssemblyAI** | Speaker labels, sentiment, entity detection | Paid API | ~$0.01/min |

**Recommended: OpenAI Whisper API** (`gpt-4o-transcribe` or `whisper-1`)

```typescript
// Using OpenAI SDK
import OpenAI from "openai";
const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("audio.mp3"),
  model: "gpt-4o-transcribe",
  response_format: "json",
});

console.log(transcription.text);
// "Hey guys, today we're doing a chest and triceps workout. 
//  First exercise is bench press, 4 sets of 8 to 10 reps..."
```

**Handling the 25MB limit:**
- Most TikTok/Reels videos are < 3 minutes → audio is typically < 5MB
- For longer YouTube videos, split audio into chunks with FFmpeg
- Use mono audio at 16kHz to minimize file size

### Step 4: AI Extraction — LLM Processing

This is the **magic step**. Take the raw transcript and use an LLM to extract structured workout data.

```typescript
const prompt = `You are a fitness expert. Extract a structured workout from this video transcript.
Return JSON with this schema:
{
  "title": "string",
  "targetMuscles": ["string"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedDuration": "string (e.g., '45 minutes')",
  "equipment": ["string"],
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string (e.g., '8-10' or '30 seconds')",
      "restBetweenSets": "string",
      "notes": "string (form cues, tips)",
      "order": number
    }
  ],
  "warmup": "string (if mentioned)",
  "cooldown": "string (if mentioned)"
}

TRANSCRIPT:
${transcript}`;
```

**LLM Options:**
- **Claude API (Sonnet 4.5)** — great at structured extraction, competitive pricing
- **GPT-4o** — strong at following schemas, good with fitness domain
- **Gemini 2.0 Flash** — cheapest option, still good quality

**Challenges specific to fitness video transcription:**
1. **Exercise name ambiguity** — "skull crushers" vs "lying tricep extensions" (same exercise)
2. **Implied information** — "do 4 sets" (but reps not stated, shown visually)
3. **Slang/shorthand** — "superset with" "drop set" "AMRAP" "till failure"
4. **Music overlapping speech** — common in gym videos, reduces transcription accuracy
5. **Visual-only information** — some creators demonstrate without narrating every detail
6. **Multiple languages** — fitness creators worldwide, Whisper handles 100+ languages

---

## 5. Trigger.dev — Why It's Perfect for This Project

### What is Trigger.dev?

Trigger.dev is an **open-source platform for running background jobs in TypeScript**. It solves the exact problem Clip to Fit has: the video-to-workout pipeline takes 30-120 seconds, which is too long for a synchronous API request.

### Why Trigger.dev over alternatives?

| Feature | Trigger.dev | Vercel Functions | AWS Lambda | BullMQ |
|---------|------------|-----------------|------------|--------|
| **Timeout** | No limit | 60s (Pro: 300s) | 15 min | No limit |
| **FFmpeg support** | ✅ Built-in extension | ❌ No binary support | ⚠️ Layers needed | ✅ (self-managed) |
| **TypeScript native** | ✅ | ✅ | ⚠️ | ✅ |
| **Retries built-in** | ✅ | ❌ | ❌ | ✅ |
| **Realtime updates** | ✅ Stream to frontend | ❌ | ❌ | ❌ |
| **Dashboard/Observability** | ✅ Beautiful UI | ❌ | CloudWatch | ❌ |
| **Infrastructure** | Managed | Managed | Managed | Self-hosted |
| **Python scripts** | ✅ Extension available | ❌ | ✅ | ❌ |

### How Trigger.dev fits into Clip to Fit

```typescript
// trigger/convert-workout.ts
import { task, logger } from "@trigger.dev/sdk";

export const convertWorkoutVideo = task({
  id: "convert-workout-video",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: { 
    url: string; 
    userId: string; 
    jobId: string;
  }) => {
    const { url, userId, jobId } = payload;

    // Step 1: Download video audio
    logger.info("Downloading video audio...", { url });
    const audioPath = await downloadAudio(url); // yt-dlp wrapper
    
    // Step 2: Transcribe with Whisper
    logger.info("Transcribing audio...");
    const transcript = await transcribeAudio(audioPath); // OpenAI API
    
    // Step 3: Extract workout with LLM
    logger.info("Extracting workout data...");
    const workout = await extractWorkout(transcript); // Claude/GPT
    
    // Step 4: Save to database
    logger.info("Saving workout...");
    await saveWorkout(userId, jobId, workout, transcript);
    
    // Step 5: Cleanup
    await fs.unlink(audioPath);
    
    return { success: true, workout };
  },
});
```

**Trigger.dev config for this project:**

```typescript
// trigger.config.ts
import { defineConfig } from "@trigger.dev/sdk";
import { ffmpeg } from "@trigger.dev/build/extensions/core";
import { pythonExtension } from "@trigger.dev/build/extensions/python";
import { aptGet } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "clip-to-fit",
  build: {
    extensions: [
      ffmpeg(),  // For audio extraction
      aptGet({ packages: ["python3", "python3-pip"] }),  // For yt-dlp
      // Or use pythonExtension for yt-dlp
    ],
  },
});
```

**Key Trigger.dev features you'd use:**

1. **Long-running tasks** — No timeout, the full pipeline can take 30-120 seconds
2. **FFmpeg extension** — First-party support for audio processing
3. **Automatic retries** — If Whisper API fails or yt-dlp gets rate-limited, auto-retry
4. **Realtime streaming** — Push status updates to the mobile app ("Downloading...", "Transcribing...", "Extracting...")
5. **Concurrency control** — Queue management so you don't blow through API limits
6. **Observability** — Dashboard shows every step of every conversion, making debugging trivial
7. **Python extension** — Can run yt-dlp directly as a Python script

### Realtime Status Updates to the App

```typescript
// In your Next.js API route
import { tasks } from "@trigger.dev/sdk";

export async function POST(req: Request) {
  const { url } = await req.json();
  
  const handle = await tasks.trigger("convert-workout-video", {
    url,
    userId: session.userId,
    jobId: crypto.randomUUID(),
  });
  
  return Response.json({ runId: handle.id });
}
```

```typescript
// In React Native, poll or use Trigger.dev's Realtime API
// to show progress: "Downloading → Transcribing → Extracting → Done!"
```

---

## 6. Mobile App — Share Extension (The Killer Feature)

The "Share to Clip to Fit" flow is critical UX. Users need to be able to tap Share in TikTok/Instagram and send the URL directly to your app.

### iOS Share Extension + Android Intent

**Libraries:**
- `react-native-receive-sharing-intent` — Receives URLs/files from other apps
- `react-native-share-menu` (Expensify) — More maintained, supports custom Share UI
- Custom implementation using `Linking` API + native Share Extension

**Android (AndroidManifest.xml):**
```xml
<intent-filter>
  <action android:name="android.intent.action.SEND" />
  <category android:name="android.intent.category.DEFAULT" />
  <data android:mimeType="text/plain" />
</intent-filter>
```

**iOS:** Requires creating a Share Extension target in Xcode with `NSExtensionActivationSupportsWebURLWithMaxCount`.

**Flow:**
1. User watches a workout video on TikTok
2. Taps "Share" → selects "Clip to Fit"
3. App opens with the URL pre-filled
4. User taps "Convert" → background job starts
5. Notification when workout is ready

---

## 7. Technical Challenges & Risks

### 🔴 Critical Challenges

#### 1. Video Download Reliability
- **TikTok** aggressively blocks automated downloads; yt-dlp works but breaks frequently
- **Instagram** increasingly requires authentication/cookies for Reels
- **YouTube Shorts** is most reliable but YouTube also fights downloaders
- **Mitigation:** Keep yt-dlp updated constantly, have fallback download methods, consider using a proxy service like Bright Data

#### 2. Audio Quality / Transcription Accuracy
- Gym videos often have **loud background music** drowning out the narrator
- Some creators use **text overlays** instead of voice narration
- **Fast speech, slang, accents** reduce Whisper accuracy
- **Mitigation:** Use `gpt-4o-transcribe` (best accuracy), allow user to edit extracted workout, consider computer vision for on-screen text

#### 3. Visual-Only Information
- Many workout videos SHOW exercises without naming them
- "Now do this one" (demonstrates exercise without saying name)
- Sets/reps might be shown as text overlay, not spoken
- **Mitigation (Advanced):** Use multimodal AI (GPT-4o Vision / Claude Vision) to analyze video frames alongside audio. Extract on-screen text using OCR

### 🟡 Moderate Challenges

#### 4. Legal / Terms of Service
- TikTok's ToS explicitly **prohibits scraping** and automated data extraction
- Instagram's ToS prohibits downloading content without permission
- **Fair Use argument:** You're transforming the content (video → text workout plan), not redistributing the video
- **CookingGuru/Video2Recipe do the same thing** for recipes and operate openly
- **Mitigation:** Don't store/redistribute videos. Only store the extracted workout text. Delete downloaded audio immediately after processing. Credit original creators. Consider adding a disclaimer

#### 5. Rate Limiting / Costs
- OpenAI Whisper API charges per audio minute
- LLM API calls for extraction cost money per request
- yt-dlp may get rate-limited by platforms
- **Mitigation:** Implement user quotas (free tier: 5 conversions/month, paid: unlimited), cache results for same URLs, use cheaper models for extraction step

#### 6. Exercise Standardization
- "Bench press" = "flat bench" = "barbell bench press" = "chest press"
- Need an exercise taxonomy/database to normalize names
- **Mitigation:** Build an exercise database (or use wger.de API — open source exercise database), use LLM to map extracted names to canonical exercise names

### 🟢 Minor Challenges

#### 7. URL Validation & Platform Detection
- Need to detect which platform a URL comes from
- Handle shortened URLs (bit.ly, t.co, etc.)
- **Solution:** URL parsing + redirect following + domain matching

#### 8. Multi-language Support
- Fitness content is global — Spanish, Portuguese, Hindi, etc.
- Whisper handles 100+ languages natively
- LLM extraction works well across languages

---

## 8. Recommended Tech Stack

### Mobile App
| Layer | Technology |
|-------|-----------|
| Framework | **React Native** (Expo) — you know this well |
| Navigation | React Navigation |
| State | Zustand or TanStack Query |
| Share Extension | `react-native-receive-sharing-intent` |
| Auth | Supabase Auth / Clerk |
| Push Notifications | Expo Notifications |

### Backend
| Layer | Technology |
|-------|-----------|
| API | **Next.js App Router** + tRPC |
| Background Jobs | **Trigger.dev** |
| Database | **Supabase** (PostgreSQL + Auth + Storage) |
| Video Download | **yt-dlp** (via Trigger.dev Python extension) |
| Audio Processing | **FFmpeg** (via Trigger.dev build extension) |
| Transcription | **OpenAI Whisper API** (`gpt-4o-transcribe`) |
| AI Extraction | **Claude API** (Sonnet) or **GPT-4o** |
| Caching | Redis (Upstash) — cache results for same URLs |

### Infrastructure
| Layer | Technology |
|-------|-----------|
| Hosting | **Vercel** (Next.js) + **Trigger.dev Cloud** (jobs) |
| Database | **Supabase** |
| Monitoring | Trigger.dev Dashboard + Sentry |
| Analytics | PostHog or Mixpanel |

---

## 9. Data Models

```typescript
// Core data models
interface Workout {
  id: string;
  userId: string;
  sourceUrl: string;
  sourcePlatform: "tiktok" | "instagram" | "youtube" | "facebook" | "other";
  title: string;
  targetMuscles: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: string;
  equipment: string[];
  exercises: Exercise[];
  rawTranscript: string;
  creatorName?: string;
  creatorHandle?: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  canonicalName?: string; // Normalized exercise name
  sets: number;
  reps: string; // "8-10" or "30 seconds" or "to failure"
  restBetweenSets?: string;
  notes?: string;
  order: number;
  muscleGroups?: string[];
}

interface ConversionJob {
  id: string;
  userId: string;
  sourceUrl: string;
  status: "pending" | "downloading" | "transcribing" | "extracting" | "completed" | "failed";
  triggerRunId?: string;
  workoutId?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

---

## 10. Monetization Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 5 conversions/month, basic workout storage |
| **Pro** | $4.99/month | Unlimited conversions, workout calendar, export to PDF |
| **Pro+** | $9.99/month | Everything + AI workout suggestions, training program builder |

**Cost per conversion estimate:**
- Whisper API: ~$0.01 (for a 60-second video)
- LLM extraction: ~$0.005 (Claude Haiku or GPT-4o-mini)
- Trigger.dev compute: ~$0.005
- **Total: ~$0.02 per conversion** — very sustainable even on the free tier

---

## 11. MVP Scope (Build This First)

### Phase 1 — Core (2-3 weeks)
- [ ] React Native app with URL paste input
- [ ] Next.js API + Trigger.dev pipeline (download → transcribe → extract)
- [ ] Basic workout display screen
- [ ] Supabase database + auth

### Phase 2 — UX Polish (1-2 weeks)
- [ ] Share extension (iOS + Android)
- [ ] Real-time conversion status ("Downloading... Transcribing... Done!")
- [ ] Workout library (saved workouts)
- [ ] Basic error handling and retry

### Phase 3 — Growth Features (2-3 weeks)
- [ ] Workout history / calendar view
- [ ] Export to PDF
- [ ] Exercise database with images
- [ ] Push notifications
- [ ] Social sharing ("Check out this workout I found!")

### Phase 4 — Advanced (future)
- [ ] Multimodal video analysis (extract on-screen text + visual exercises)
- [ ] AI workout suggestions based on saved workouts
- [ ] Training program builder
- [ ] Integration with fitness trackers

---

## 12. Key Open-Source Reference: `social_recipes`

The **social_recipes** GitHub project (github.com/pickeld/social_recipes) is essentially the recipe version of what you want to build. Study its architecture:

```
social_recipes/
├── video_downloader.py   # yt-dlp wrapper
├── transcriber.py        # Whisper transcription
├── chef.py               # AI recipe extraction (→ your "trainer.py")
├── image_extractor.py    # Extracts images from video
├── llm_providers/        # OpenAI, Gemini providers
├── ui/                   # Flask web UI
└── docker-compose.yml    # Easy deployment
```

**Pipeline:** URL → yt-dlp download → Whisper transcription → LLM extraction → Structured output

This is exactly your pipeline, just swap "recipe" for "workout."

---

## 13. Summary & Recommendation

**Clip to Fit is a highly viable app idea** with:
- ✅ Proven model (recipe apps validate the concept)
- ✅ No direct competitor in the fitness space
- ✅ All required technologies are mature and available
- ✅ Low per-conversion cost (~$0.02)
- ✅ Strong alignment with your React Native + TypeScript skills
- ✅ Trigger.dev is an ideal fit for the background processing pipeline

**Biggest risks:**
1. Platform anti-bot measures (yt-dlp reliability)
2. Audio quality in noisy gym environments
3. Visual-only content that can't be transcribed

**My recommendation:** Start with the MVP using YouTube as the primary platform (most reliable downloads), add TikTok and Instagram in Phase 2 when you've validated the core conversion quality. Use Trigger.dev from day one — it will save you weeks of infrastructure work and give you beautiful observability out of the box.
