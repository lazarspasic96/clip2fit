# Exercise Catalog Filter System

Complete reference for how filters work across the exercise catalog and add-exercises screens.

---

## Data Flow

```
UI Components (chips, search bar, filter sheet)
  → Filter Store (catalogFilterStore or pickerFilterStore)
    → React Hook (useCatalogInfinite) builds URLSearchParams
      → GET /api/exercises/catalog?muscle=X&equipment=Y&page=1&pageSize=30
        → Zod validates params (catalogQuerySchema)
          → Drizzle builds SQL WHERE conditions (all AND'd)
            → PostgreSQL exercise_catalog table
```

---

## All Filter Fields

`CatalogFilters` interface — `types/catalog.ts:44`

| Field | Type | Default | UI Control | Sent to API as |
|---|---|---|---|---|
| `search` | `string` | `''` | `CatalogSearchBar` (text input) | `?search=term` |
| `muscle` | `string \| null` | `null` | `FilterChipGrid` (in sheet only) | `?muscle=quads` |
| `bodyPart` | `string \| null` | `null` | `CatalogFilterChips` (horizontal body region chips) + presets | `?bodyPart=upper legs,lower legs` |
| `equipment` | `string \| null` | `null` | `FilterChipGrid` (in sheet, not yet wired) | `?equipment=barbell` |
| `difficulty` | `beginner \| intermediate \| advanced \| null` | `null` | `FilterSegmentedRow` (in sheet) | `?difficulty=beginner` |
| `category` | `string \| null` | `null` | Set by presets only (no direct UI) | `?category=strength` |
| `force` | `push \| pull \| static \| null` | `null` | `FilterSegmentedRow` (in sheet) | `?force=push` |
| `mechanic` | `compound \| isolation \| null` | `null` | `FilterSegmentedRow` (in sheet) | `?mechanic=compound` |

Empty/default state (`EMPTY_FILTERS`): `search: ''`, all others `null`.

---

## Backend API

### Endpoint

`GET /api/exercises/catalog` — `clip2fit-api/src/app/api/exercises/catalog/route.ts`

Requires `Authorization: Bearer {token}` header.

### Query Parameters (Zod Schema)

`catalogQuerySchema` — `clip2fit-api/src/lib/validations.ts:199`

| Param | Zod Type | Required | Notes |
|---|---|---|---|
| `search` | `z.string().trim().optional()` | No | |
| `muscle` | `z.string().trim().optional()` | No | |
| `bodyPart` | `z.string().trim().optional()` | No | |
| `equipment` | `z.string().trim().optional()` | No | |
| `difficulty` | `z.enum(["beginner","intermediate","advanced"]).optional()` | No | Enum-validated |
| `category` | `z.string().trim().optional()` | No | |
| `force` | `z.enum(["push","pull","static"]).optional()` | No | Enum-validated |
| `mechanic` | `z.enum(["compound","isolation"]).optional()` | No | Enum-validated |
| `page` | `z.coerce.number().int().min(1).default(1)` | No | Default: 1 |
| `pageSize` | `z.coerce.number().int().min(1).max(100).default(30)` | No | Default: 30, max: 100 |

### How Filters Map to SQL

All conditions are **AND'd** together. Only non-null/non-empty params generate conditions.

| Param | DB Column | Match Type |
|---|---|---|
| `search` | `name` + `aliases` (JSONB) | `ILIKE '%search%'` (case-insensitive, OR between name and aliases) |
| `muscle` | `target` | Exact match (`eq()`) |
| `bodyPart` | `body_part` | Exact match (`eq()`) or `IN ()` for comma-separated values |
| `equipment` | `equipment` | Exact match (`eq()`) |
| `difficulty` | `difficulty` | Exact match (`eq()`) |
| `category` | `category` | Exact match (`eq()`) |
| `force` | `force` | Exact match (`eq()`) |
| `mechanic` | `mechanic` | Exact match (`eq()`) |

### Response Shape

```json
{
  "items": [
    {
      "id": "uuid",
      "exerciseDbId": "string",
      "name": "Barbell Bench Press",
      "bodyPart": "chest",
      "target": "pectorals",
      "secondaryMuscles": ["delts", "triceps"],
      "equipment": "barbell",
      "category": "strength",
      "difficulty": "intermediate",
      "force": "push",
      "mechanic": "compound",
      "gifUrl": "https://...",
      "thumbnailUrl": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "total": 245,
    "totalPages": 9,
    "hasNextPage": true
  }
}
```

---

## DB Schema

`exercise_catalog` table — `clip2fit-api/src/lib/db/schema.ts:102`

| Column | DB Name | Type | Nullable | Used by Filter |
|---|---|---|---|---|
| `name` | `name` | text | No | `search` (ILIKE) |
| `aliases` | `aliases` | jsonb (string[]) | Default `[]` | `search` (ILIKE on cast) |
| `bodyPart` | `body_part` | text | No | `bodyPart` |
| `target` | `target` | text | No | `muscle` |
| `secondaryMuscles` | `secondary_muscles` | jsonb (string[]) | Default `[]` | Not filterable |
| `equipment` | `equipment` | text | No | `equipment` |
| `category` | `category` | text | No | `category` |
| `difficulty` | `difficulty` | text | Yes | `difficulty` |
| `force` | `force` | text | Yes | `force` |
| `mechanic` | `mechanic` | text | Yes | `mechanic` |

Key distinction: `target` = specific muscle (e.g. "quads"), `body_part` = general region (e.g. "upper legs").

---

## Frontend Stores

Two identical stores, separate instances so catalog and picker screens maintain independent filter state.

| Store | File | Used By |
|---|---|---|
| `catalogFilterStore` | `stores/catalog-filter-store.ts` | Exercise Catalog screen (`exercise-catalog.tsx`) |
| `pickerFilterStore` | `stores/picker-filter-store.ts` | Add Exercises screen (`add-exercises-screen.tsx` via `useAddExercisesController`) |

Both are external stores consumed via `useSyncExternalStore`. Methods: `getFilters()`, `setFilters(next)`, `resetFilters()`, `subscribe(listener)`.

The picker store is reset on mount of `useAddExercisesController`.

---

## UI Components

### Main Screen Components (`components/catalog/shared/`)

| Component | File | Purpose |
|---|---|---|
| `CatalogSearchBar` | `catalog-search-bar.tsx` | Text input with animated focus border and clear button |
| `CatalogFilterChips` | `catalog-filter-chips.tsx` | Horizontal scrollable body region chips (All, Chest, Back, Legs, Arms, Shoulders, Core, Cardio). Sets `bodyPart` filter. |
| `CatalogActiveFilters` | `catalog-active-filters.tsx` | Horizontal scrollable pills showing active sheet filters (equipment, difficulty, category, force, mechanic) with X to remove + "Clear all" |
| `CatalogEmptyState` | `catalog-empty-state.tsx` | Empty state with suggestions to remove specific filters |
| `CatalogDesignShell` | `catalog-design-shell.tsx` | Composes search bar + filter button + chips + active filters + result count + loading/error/empty states |

### Filter Sheet Components (`components/catalog/shared/`)

| Component | File | Purpose |
|---|---|---|
| `FilterChipGrid` | `filter-chip-grid.tsx` | Flex-wrapped grid of chips for single-select (muscles, equipment). Supports `variant: 'muscle'` for color-coded chips |
| `FilterSegmentedRow` | `filter-segmented-row.tsx` | Equal-width segmented buttons for single-select (difficulty, force, mechanic). Optional `dotColors` for visual encoding |

### Filter Sheet Screens

| Screen | File | Store | Route |
|---|---|---|---|
| Catalog Filters | `app/(protected)/sheets/catalog-filters.tsx` | `catalogFilterStore` | `/(protected)/sheets/catalog-filters` |
| Picker Filters | `app/(protected)/sheets/picker-filters.tsx` | `pickerFilterStore` | `/(protected)/sheets/picker-filters` |

Both sheets are ~95% identical. They use local `useState` during editing and commit to the store on "Show Exercises" tap.

Sheet filter sections: Presets → Target Muscle (with region tabs) → Difficulty → Movement Type (force) → Mechanic → Action buttons.

### Screen Compositions

| Screen | Design Component | Uses Shell? |
|---|---|---|
| Exercise Catalog | `DesignMagazine` (`catalog/designs/design-magazine.tsx`) | Yes, wraps `CatalogDesignShell` |
| Add Exercises | `DesignBStackedFocus` (`add-exercises/designs/design-b-stacked-focus.tsx`) | No, re-implements shell inline |

---

## Presets

Defined in `types/catalog.ts:183`. Applied via "gym-split" chips at top of filter sheets.

| Preset | Filters Set | What It Does |
|---|---|---|
| Push Day | `force: 'push'`, `category: 'strength'` | All push-movement strength exercises |
| Pull Day | `force: 'pull'`, `category: 'strength'` | All pull-movement strength exercises |
| Leg Day | `bodyPart: 'upper legs,lower legs'`, `category: 'strength'` | ALL leg strength exercises (quads, hamstrings, glutes, calves, etc.) |
| Bodyweight Only | `equipment: 'body weight'` | All bodyweight exercises |

Applying a preset first clears all filters, then sets the preset values.

Preset matching: `presetMatchesState()` checks if all preset filter keys match current state (used for highlighting active preset).

---

## Body Regions (Horizontal Chips)

7 high-level body regions displayed as horizontal chips below the search bar. Each maps to one or more DB `body_part` values.

| Chip | DB bodyPart values | Exercise Count |
|---|---|---|
| Chest | `chest` | 163 |
| Back | `back` | 203 |
| Legs | `upper legs`, `lower legs` | 286 |
| Arms | `upper arms`, `lower arms` | 329 |
| Shoulders | `shoulders` | 143 |
| Core | `waist`, `neck` | 171 |
| Cardio | `cardio` | 29 |

Defined in `BODY_REGIONS` constant in `types/catalog.ts`.

## Muscle Groups (Filter Sheet)

17 muscles in display order (`MUSCLE_GROUPS_ORDERED`) with 4 region breaks. Used in the filter sheet for detailed selection.

| Region | Muscles |
|---|---|
| Chest/Shoulders | pectorals, delts |
| Back | lats, upper back, traps, spine |
| Arms | biceps, triceps, forearms |
| Legs | quads, hamstrings, glutes, calves |
| Core/Other | abs, abductors, adductors, serratus anterior |

Region tabs in filter sheets group these as: All, Upper (chest+back+arms), Lower (legs), Core (abs+serratus).

**Mutual exclusion**: Selecting a body region chip clears any specific muscle. Selecting a specific muscle in the sheet clears the body region chip.

---

## Label Maps

All defined in `types/catalog.ts`. Used to convert raw DB values to display text.

| Map | Example | Count |
|---|---|---|
| `MUSCLE_GROUP_LABELS` | `"pectorals"` → `"Chest"` | 17 primary + 5 legacy |
| `EQUIPMENT_LABELS` | `"leverage machine"` → `"Machine"` | 14 |
| `CATEGORY_LABELS` | `"olympic weightlifting"` → `"Olympic"` | 7 |
| `FORCE_DISPLAY_LABELS` | `"push"` → `"Push"` | 3 |
| `DIFFICULTY_DISPLAY_LABELS` | `"beginner"` → `"Beginner"` | 3 |
| `MECHANIC_DISPLAY_LABELS` | `"compound"` → `"Compound"` | 2 |

---

## Search Behavior

- Frontend debounces search input by **300ms** before sending to API
- Backend uses `ILIKE '%term%'` on both `name` and `aliases` (JSONB cast to text), OR'd together
- Case-insensitive

---

## Pagination

- Page size: 30 (hardcoded in `hooks/use-catalog.ts`)
- Uses React Query `useInfiniteQuery` with page-based pagination
- `getNextPageParam` increments page if `hasNextPage` is true
- Client flattens all pages into a single `items` array
- `onEndReachedThreshold: 0.5` triggers next page fetch

---

## Known Issues / Gaps

1. **Equipment filter not in sheet** — `equipment` is in the type and accepted by the backend, but the filter sheets don't have a UI section for it. Only reachable via presets ("Bodyweight Only").

2. **Filter sheets duplicated** — `catalog-filters.tsx` and `picker-filters.tsx` are ~95% identical (only differ in store import and action button styling).

3. **Design shell duplicated** — `DesignBStackedFocus` re-implements the filter bar layout from `CatalogDesignShell` (search + sliders button + chips + active filters + result count + loading/error/empty).

4. **`category` not directly selectable** — only set via presets, no standalone UI control in the filter sheet.

5. **`getResultLabel()` duplicated** — same function exists in both `CatalogDesignShell` and `DesignBStackedFocus`.
