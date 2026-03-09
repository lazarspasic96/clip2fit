# PRD: Backend — Onboarding Profile Fields Extension

**Author:** Team
**Date:** 2026-03-09
**Status:** Draft
**Audience:** Backend team (Next.js API + Supabase)

---

## Problem Statement

The mobile app is redesigning its onboarding flow from 2 screens to 9 screens to collect enough user data for AI-powered personalized workout generation. The current `profiles` table and `PATCH /api/profiles` endpoint only support basic demographics (name, gender, DOB, height, weight, fitness goal, timezone). The backend must be extended to accept, validate, persist, and return 9 new fields covering training preferences, equipment access, injuries, and activity level.

This is a prerequisite for the future "AI Workout Generator" feature, which will send the full user profile to GPT to create personalized training plans.

---

## Goals & Success Metrics

- **Extend profiles table** with 9 new nullable columns → Migration runs without downtime or data loss
- **Extend PATCH /api/profiles** to accept new fields → All new fields validated and persisted via existing upsert pattern
- **Extend GET /api/profiles** to return new fields → Mobile app receives new data in response
- **Backward compatibility** → Existing API consumers (mobile app) continue working without changes until they adopt new fields. No breaking changes.
- **Type safety** → Zod schemas validate all new enum values and array contents server-side

---

## Target Users

- Mobile app (React Native/Expo) — the sole API consumer
- Future: AI Workout Generator service (will read profile data to build GPT prompts)

---

## User Stories

- As the mobile app, I want to PATCH new profile fields (equipment, experience level, etc.) so the user's onboarding data is persisted.
- As the mobile app, I want GET /api/profiles to return all new fields so I can display them in Settings.
- As the AI Workout Generator (future), I want to read the full user profile so I can build a comprehensive GPT prompt for workout generation.
- As a backend developer, I want Zod validation on all new fields so invalid data is rejected with clear error messages.

---

## Requirements

### Must Have (P0)

#### 1. Database Migration — Add 9 New Columns to `profiles` Table

Add the following columns. All are **nullable** with no default values (non-destructive migration — existing rows get `NULL` for all new columns).

| Column | PostgreSQL Type | Constraints | Notes |
|--------|----------------|-------------|-------|
| `experience_level` | `TEXT` | CHECK IN (`'beginner'`, `'intermediate'`, `'advanced'`) | Single-select enum |
| `activity_level` | `TEXT` | CHECK IN (`'sedentary'`, `'lightly_active'`, `'moderately_active'`, `'very_active'`) | Single-select enum |
| `equipment` | `TEXT[]` | Each element CHECK IN (see allowed values below) | Multi-select array |
| `training_frequency` | `INTEGER` | CHECK `>= 2 AND <= 6` | Days per week |
| `session_duration` | `INTEGER` | CHECK IN (`15`, `20`, `30`, `45`, `60`, `90`) | Minutes per session |
| `training_styles` | `TEXT[]` | Each element CHECK IN (see allowed values below) | Multi-select array |
| `focus_areas` | `TEXT[]` | Each element CHECK IN (see allowed values below) | Multi-select array |
| `injuries` | `TEXT[]` | Each element CHECK IN (see allowed values below) | Multi-select array |
| `injury_notes` | `TEXT` | Max 200 characters | Free-text, optional |

**Allowed array element values:**

| Field | Allowed Values |
|-------|---------------|
| `equipment` | `bodyweight`, `dumbbells`, `barbell_rack`, `resistance_bands`, `kettlebells`, `pullup_bar`, `bench`, `cable_machine`, `full_gym` |
| `training_styles` | `strength`, `hiit`, `bodybuilding`, `calisthenics`, `yoga_mobility`, `crossfit`, `mixed` |
| `focus_areas` | `chest`, `back`, `shoulders`, `arms`, `core`, `glutes`, `legs`, `full_body` |
| `injuries` | `bad_knees`, `lower_back`, `shoulder`, `wrist_hand`, `hip`, `neck` |

**Acceptance Criteria:**
- [ ] Migration runs successfully on a fresh database
- [ ] Migration runs successfully on a database with existing profile rows (all new columns = NULL)
- [ ] Migration is reversible (down migration drops the 9 columns)
- [ ] CHECK constraints prevent invalid enum values from being inserted directly via SQL
- [ ] Array columns accept empty arrays `{}` and NULL

**Drizzle Schema Changes:**

Add to the profiles table definition:

```typescript
experienceLevel: text('experience_level'),
activityLevel: text('activity_level'),
equipment: text('equipment').array(),
trainingFrequency: integer('training_frequency'),
sessionDuration: integer('session_duration'),
trainingStyles: text('training_styles').array(),
focusAreas: text('focus_areas').array(),
injuries: text('injuries').array(),
injuryNotes: text('injury_notes'),
```

---

#### 2. Extend Zod Validation Schema — `profileUpdateSchema`

Add new fields to the existing Zod schema used by `PATCH /api/profiles`:

```typescript
// New enum definitions
const experienceLevelEnum = z.enum(['beginner', 'intermediate', 'advanced'])
const activityLevelEnum = z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active'])
const equipmentEnum = z.enum([
  'bodyweight', 'dumbbells', 'barbell_rack', 'resistance_bands',
  'kettlebells', 'pullup_bar', 'bench', 'cable_machine', 'full_gym',
])
const trainingStyleEnum = z.enum([
  'strength', 'hiit', 'bodybuilding', 'calisthenics',
  'yoga_mobility', 'crossfit', 'mixed',
])
const focusAreaEnum = z.enum([
  'chest', 'back', 'shoulders', 'arms', 'core', 'glutes', 'legs', 'full_body',
])
const injuryEnum = z.enum([
  'bad_knees', 'lower_back', 'shoulder', 'wrist_hand', 'hip', 'neck',
])

// Add to profileUpdateSchema (all optional, same as existing fields)
experienceLevel: experienceLevelEnum.optional(),
activityLevel: activityLevelEnum.optional(),
equipment: z.array(equipmentEnum).min(1).optional(),
trainingFrequency: z.number().int().min(2).max(6).optional(),
sessionDuration: z.number().int().refine(v => [15, 20, 30, 45, 60, 90].includes(v)).optional(),
trainingStyles: z.array(trainingStyleEnum).optional(),
focusAreas: z.array(focusAreaEnum).optional(),
injuries: z.array(injuryEnum).optional(),
injuryNotes: z.string().max(200).optional(),
```

**Acceptance Criteria:**
- [ ] Valid payloads with new fields pass validation
- [ ] Invalid enum values return 400 with `"Validation failed"` and per-field error details
- [ ] Invalid array elements return 400 (e.g., `equipment: ["invalid_item"]`)
- [ ] `equipment` requires at least 1 element if provided (empty array rejected)
- [ ] `trainingStyles`, `focusAreas`, `injuries` accept empty arrays `[]`
- [ ] `trainingFrequency` rejects values < 2 or > 6, and non-integers
- [ ] `sessionDuration` rejects values not in `[15, 20, 30, 45, 60, 90]`
- [ ] `injuryNotes` rejects strings > 200 characters
- [ ] Existing fields (fullName, gender, etc.) continue to work unchanged
- [ ] Sending only new fields without old fields works (partial update)
- [ ] Sending mix of old and new fields works

---

#### 3. Extend PATCH /api/profiles — Upsert Logic

The existing `PATCH /api/profiles` uses Drizzle's `insert().onConflictDoUpdate()` pattern. The new fields must be included in both the insert and the conflict-update clause.

**Current behavior (must remain unchanged):**
- Authenticated via Supabase JWT → `getAuthUser()` extracts userId
- Zod validates body → rejects if no fields provided
- Upserts profile row (PK = auth user ID)
- Returns full profile via `formatProfile()`

**Required changes:**
- Zod schema accepts 9 new fields (see above)
- Upsert includes new fields in INSERT and ON CONFLICT DO UPDATE
- `formatProfile()` includes new fields in response

**Acceptance Criteria:**
- [ ] PATCH with only new fields creates a new profile row (upsert — first-time user sends equipment before name)
- [ ] PATCH with only new fields updates existing profile row (leaves old fields untouched)
- [ ] PATCH with mix of old + new fields works correctly
- [ ] Array fields overwrite entirely (not append). Sending `equipment: ["dumbbells"]` replaces previous `["dumbbells", "bench"]`
- [ ] Sending a field as `null` is rejected by Zod (fields are optional, not nullable — omit to skip, don't send null)
- [ ] `updatedAt` refreshes on every write (existing behavior)
- [ ] Response includes all new fields (see GET response format below)

---

#### 4. Extend GET /api/profiles — Response Format

Add new fields to the `formatProfile()` function and `ApiProfileResponse` type.

**Updated response shape:**

```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "gender": "male",
  "dateOfBirth": "1998-03-15",
  "age": 28,
  "height": 180,
  "heightUnit": "cm",
  "weight": 82,
  "weightUnit": "kg",
  "fitnessGoal": "build_muscle",
  "timezone": "Europe/Belgrade",
  "experienceLevel": "intermediate",
  "activityLevel": "moderately_active",
  "equipment": ["dumbbells", "barbell_rack", "bench"],
  "trainingFrequency": 4,
  "sessionDuration": 60,
  "trainingStyles": ["strength", "bodybuilding"],
  "focusAreas": ["chest", "arms"],
  "injuries": ["lower_back"],
  "injuryNotes": "Herniated disc L4-L5, avoid heavy deadlifts",
  "createdAt": "2026-03-09T10:00:00Z",
  "updatedAt": "2026-03-09T10:05:00Z"
}
```

**Null handling:** New fields return `null` when not set (same as existing fields like `gender`, `height`, etc.). Array fields return `null` (not empty array) when never set.

**Acceptance Criteria:**
- [ ] GET /api/profiles returns all 9 new fields
- [ ] New fields are `null` for profiles that haven't set them
- [ ] Array fields return as JSON arrays when set, `null` when not set
- [ ] Existing response fields unchanged (no renames, no type changes)
- [ ] 404 behavior unchanged (profile row doesn't exist)

---

#### 5. Update API Documentation — `docs/api-docs.md`

Update the PATCH /api/profiles and GET /api/profiles sections in the API docs to reflect the new fields.

**Acceptance Criteria:**
- [ ] PATCH body table includes all 9 new fields with types and validation rules
- [ ] GET response example includes all 9 new fields
- [ ] Validation error examples show new field error format

---

### Should Have (P1)

#### 6. Fitness Goal — Align Enum Values

The current `fitnessGoal` field is validated as a free-text string (`max 200 chars`). The mobile app sends specific enum values (`lose_weight`, `build_muscle`, etc.). The onboarding redesign adds a new value: `flexibility_mobility`.

**Updated allowed values:**

| Value | Label (mobile display) |
|-------|----------------------|
| `lose_weight` | Lose Weight |
| `build_muscle` | Build Muscle |
| `get_stronger` | Get Stronger |
| `improve_endurance` | Improve Endurance |
| `general_fitness` | General Fitness |
| `flexibility_mobility` | Flexibility & Mobility |

**Recommendation:** Change `fitnessGoal` validation from free-text to a Zod enum to match the mobile app's contract. This prevents garbage data and aligns with how all other new fields are validated.

**Acceptance Criteria:**
- [ ] `fitnessGoal` validated against enum (or keep as free-text if backward compat is a concern — team decision)
- [ ] New values `get_stronger` and `flexibility_mobility` are accepted
- [ ] Existing values (`lose_weight`, `build_muscle`, `improve_endurance`, `general_fitness`, `athletic_performance`) remain valid

---

### Nice to Have (P2)

#### 7. GET /api/profiles/training-preferences — Dedicated Endpoint

Optional: A lightweight endpoint that returns only the training-related fields (no personal info). Useful for the future AI Workout Generator service that only needs training context, not PII.

```json
GET /api/profiles/training-preferences

{
  "fitnessGoal": "build_muscle",
  "experienceLevel": "intermediate",
  "activityLevel": "moderately_active",
  "equipment": ["dumbbells", "barbell_rack", "bench"],
  "trainingFrequency": 4,
  "sessionDuration": 60,
  "trainingStyles": ["strength", "bodybuilding"],
  "focusAreas": ["chest", "arms"],
  "injuries": ["lower_back"],
  "injuryNotes": "Herniated disc L4-L5",
  "gender": "male",
  "age": 28,
  "weight": 82,
  "weightUnit": "kg"
}
```

**Acceptance Criteria:**
- [ ] Returns only fields relevant to workout generation (no fullName, no dateOfBirth, no timezone)
- [ ] Includes `gender`, `age`, `weight`, `weightUnit` (relevant for exercise programming)
- [ ] 404 if profile doesn't exist
- [ ] Authenticated (same JWT auth as other endpoints)

---

## Out of Scope

- **AI Workout Generation endpoint** — Separate PRD. This covers data storage only.
- **Mobile app changes** — Covered in the frontend onboarding PRD (`docs/prd-onboarding-redesign.md`).
- **Onboarding state machine changes** — `user_metadata.onboardingComplete` flag logic is unchanged.
- **Profile deletion/reset** — Not needed for this feature.
- **Rate limiting on PATCH** — Current rate limiting (if any) is sufficient.
- **Audit log of profile changes** — Not needed for v1.

---

## Technical Considerations

### Migration Strategy

- **Type:** Non-destructive additive migration (all columns nullable, no defaults)
- **Downtime:** None expected. Adding nullable columns to PostgreSQL is a metadata-only operation (no table rewrite)
- **ORM:** Drizzle — update schema file, generate migration via `drizzle-kit generate`, apply via `drizzle-kit push` or migration runner
- **Rollback:** Drop migration removes the 9 columns. Data in those columns is lost on rollback, which is acceptable for a pre-launch app.

### Array Fields — PostgreSQL TEXT[]

Using PostgreSQL native arrays (`TEXT[]`) instead of junction tables because:
- Arrays are small and bounded (max ~10 elements)
- Always read/written as a complete unit (never queried "find all users with dumbbells")
- Simpler schema, fewer joins, faster reads
- Drizzle supports `.array()` on text columns natively

If we ever need to query "all users with X equipment" (e.g., for analytics), we can use `ANY()` operator: `WHERE 'dumbbells' = ANY(equipment)`. PostgreSQL supports GIN indexes on array columns if performance becomes an issue.

### Validation — Zod vs. Database CHECK Constraints

**Both layers:**
- Zod validates at the API layer → returns 400 with detailed errors
- PostgreSQL CHECK constraints validate at the database layer → last line of defense

This is defense-in-depth. The Zod schema is the primary validation (good error messages). The DB constraints catch bugs where code bypasses validation.

### API Contract — Naming Convention

Existing fields use **camelCase** in the API (`fullName`, `heightUnit`, `fitnessGoal`). New fields follow the same convention:

| Mobile (camelCase) | API (camelCase) | Database (snake_case) |
|--------------------|-----------------|----------------------|
| `experienceLevel` | `experienceLevel` | `experience_level` |
| `activityLevel` | `activityLevel` | `activity_level` |
| `equipment` | `equipment` | `equipment` |
| `trainingFrequency` | `trainingFrequency` | `training_frequency` |
| `sessionDuration` | `sessionDuration` | `session_duration` |
| `trainingStyles` | `trainingStyles` | `training_styles` |
| `focusAreas` | `focusAreas` | `focus_areas` |
| `injuries` | `injuries` | `injuries` |
| `injuryNotes` | `injuryNotes` | `injury_notes` |

The Drizzle ORM handles snake_case ↔ camelCase mapping automatically if configured, otherwise `formatProfile()` does the mapping manually (as it does today).

### Existing `formatProfile()` Function

Currently maps DB row → API response, stripping internal fields. Must be extended to include new fields. Follow the existing pattern:

```typescript
// Current pattern:
const formatProfile = (row: ProfileRow) => ({
  id: row.id,
  fullName: row.fullName,
  // ... existing fields ...

  // Add new fields:
  experienceLevel: row.experienceLevel,
  activityLevel: row.activityLevel,
  equipment: row.equipment,
  trainingFrequency: row.trainingFrequency,
  sessionDuration: row.sessionDuration,
  trainingStyles: row.trainingStyles,
  focusAreas: row.focusAreas,
  injuries: row.injuries,
  injuryNotes: row.injuryNotes,

  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
```

---

## Mobile Client Contract

For context, here's what the mobile app will send. The backend team does NOT need to implement this — it's documented here so you know what payloads to expect.

### PATCH /api/profiles — Example Payload from Onboarding

The mobile app sends **one PATCH request** at the end of the 9-screen onboarding flow with all accumulated data:

```json
{
  "fullName": "John Doe",
  "gender": "male",
  "dateOfBirth": "1998-03-15",
  "height": 180,
  "heightUnit": "cm",
  "weight": 82,
  "weightUnit": "kg",
  "fitnessGoal": "build_muscle",
  "timezone": "Europe/Belgrade",
  "experienceLevel": "intermediate",
  "activityLevel": "moderately_active",
  "equipment": ["dumbbells", "barbell_rack", "bench"],
  "trainingFrequency": 4,
  "sessionDuration": 60,
  "trainingStyles": ["strength", "bodybuilding"],
  "focusAreas": ["chest", "arms"],
  "injuries": ["lower_back"],
  "injuryNotes": "Herniated disc L4-L5, avoid heavy deadlifts"
}
```

### PATCH /api/profiles — Example Payload from Settings

The mobile app sends **partial updates** from Settings (only changed fields):

```json
{
  "equipment": ["dumbbells", "barbell_rack", "bench", "cable_machine"],
  "trainingFrequency": 5
}
```

### Mobile Type Definitions (for reference)

```typescript
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
type Equipment = 'bodyweight' | 'dumbbells' | 'barbell_rack' | 'resistance_bands' | 'kettlebells' | 'pullup_bar' | 'bench' | 'cable_machine' | 'full_gym'
type TrainingStyle = 'strength' | 'hiit' | 'bodybuilding' | 'calisthenics' | 'yoga_mobility' | 'crossfit' | 'mixed'
type FocusArea = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'glutes' | 'legs' | 'full_body'
type InjuryTag = 'bad_knees' | 'lower_back' | 'shoulder' | 'wrist_hand' | 'hip' | 'neck'
```

---

## Dependencies

| Dependency | Owner | Status | Blocker? |
|-----------|-------|--------|----------|
| Drizzle ORM schema access | Backend | Ready | No |
| Supabase DB access | Backend | Ready | No |
| Mobile app onboarding redesign | Mobile | In progress | No — backend can ship first |
| AI Workout Generator | Future | Not started | No — this PRD is a prerequisite |

---

## Open Questions

1. **`fitnessGoal` enum migration**: Should we change `fitnessGoal` validation from free-text to enum now, or keep it as free-text for flexibility? New mobile app will always send enum values, but existing data may have free-text. **Since app is not published yet, recommending enum.**

2. **`equipment` min(1) validation**: Should we reject empty equipment arrays, or allow them? Current spec requires at least 1 item if the field is provided. Omitting the field entirely (not sending it) is fine.

3. **`dateOfBirth` vs `age`**: Current API accepts `age` as a writeable field. The mobile app sends `dateOfBirth` and the API computes `age`. Should we deprecate the writeable `age` field and make it computed-only? (Tangential to this PRD but worth discussing.)

4. **Array ordering**: Should array fields preserve insertion order? PostgreSQL arrays do preserve order. Confirming this is the desired behavior (e.g., `equipment: ["dumbbells", "bench"]` stays in that order).

5. **Drizzle column naming**: Confirm Drizzle auto-maps `experienceLevel` ↔ `experience_level` or if explicit column name mapping is needed in the schema.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration breaks existing profiles | Very Low | High | All columns nullable, no defaults. Additive-only migration. Test on staging first. |
| Array validation edge cases (duplicates, ordering) | Low | Low | Zod doesn't deduplicate by default. Decide if duplicates are allowed or should be stripped. |
| Mobile sends unexpected values during development | Medium | Low | Zod rejects invalid values with clear errors. Mobile team has enum definitions. |
| Future schema changes to enums (adding new values) | Medium | Low | Adding values to Zod enum + DB CHECK is backward compatible. Removing values requires migration. |

---

## Implementation Checklist

Backend team can use this as a task list:

- [ ] **1. Drizzle schema** — Add 9 columns to profiles table definition
- [ ] **2. Generate migration** — `drizzle-kit generate` → review SQL
- [ ] **3. Apply migration** — Run on dev/staging database
- [ ] **4. Zod schema** — Add 9 new field validators to `profileUpdateSchema`
- [ ] **5. PATCH handler** — Include new fields in upsert query (insert + onConflictDoUpdate)
- [ ] **6. formatProfile()** — Add new fields to response mapper
- [ ] **7. Test PATCH** — New fields only, old fields only, mixed, invalid values, empty arrays
- [ ] **8. Test GET** — Verify new fields returned, null handling
- [ ] **9. Update API docs** — `docs/api-docs.md` PATCH and GET sections
- [ ] **10. (P1) fitnessGoal enum** — Tighten validation if team agrees
- [ ] **11. (P2) GET /api/profiles/training-preferences** — Optional dedicated endpoint

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Schema + migration | Small (30 min) |
| Zod validation | Small (30 min) |
| PATCH handler update | Small (15 min) |
| GET response update | Small (15 min) |
| Testing | Medium (1 hr) |
| API docs update | Small (30 min) |
| **Total** | **~3 hours** |
