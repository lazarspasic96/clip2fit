# Plan: Tailwind Config as Design System

## Summary
Populate `tailwind.config.js` with all design tokens extracted from Figma. Make it the **single source of truth**. Delete `constants/theme.ts`. All styling via NativeWind classes.

---

## Extracted Figma Tokens

### Colors (semantic naming from Figma variables)

**Background:**
| Token | Hex | Tailwind Equivalent |
|---|---|---|
| `background.primary` | `#09090b` | zinc-950 |
| `background.secondary` | `#18181b` | zinc-900 |
| `background.tertiary` | `#27272a` | zinc-800 |
| `background.button.primary` | `#84cc16` | lime-500 |
| `background.button.secondary` | `#27272a` | zinc-800 |
| `background.badge.success` | `rgba(190,242,100,0.1)` | lime/10% |
| `background.badge.error` | `rgba(248,113,113,0.1)` | red/10% |
| `background.badge.neutral` | `rgba(212,212,216,0.1)` | zinc/10% |

**Content (text):**
| Token | Hex | Tailwind Equivalent |
|---|---|---|
| `content.primary` | `#fafafa` | zinc-50 |
| `content.secondary` | `#a1a1aa` | zinc-400 |
| `content.tertiary` | `#71717a` | zinc-500 |
| `content.button.primary` | `#18181b` | zinc-900 |
| `content.badge.success` | `#bef264` | lime-300 |
| `content.badge.error` | `#f87171` | red-400 |
| `content.badge.info` | `#0284c7` | sky-600 |

**Border:**
| Token | Hex |
|---|---|
| `border.primary` | `#27272a` (zinc-800) |
| `border.secondary` | `#3f3f46` (zinc-700) |

**Brand:**
- Logo text: `#bef264` (lime-300)
- Primary action/accent: `#84cc16` (lime-500)

### Fonts
- **Inter** — primary (weights: 400, 500, 600, 700)
- **Onest** — secondary/nav (weight: 400)

### Typography Scale
| Name | Size | Line Height | Letter Spacing |
|---|---|---|---|
| `xs` | 12px | 16px | 0.72px |
| `sm` | 14px | 20px | 0.28px |
| `base` | 16px | 24px | 0 |
| `lg` | 18px | 28px | 0 |
| `xl` | 20px | 28px | 0 |
| `2xl` | 24px | 32px | 0 |
| `6xl` | 60px | 60px | -1.2px |

### Border Radius
| Name | Value |
|---|---|
| `xs` | 4px |
| `sm` | 6px |
| `DEFAULT` / `md` | 8px |
| `xl` | 24px |
| `full` | 9999px |

### Shadows
| Name | Value |
|---|---|
| `sm` | `0px 1px 2px 0px rgba(0,0,0,0.05)` |
| `ring` | `0 0 0 1px #27272a` |
| `badge-success` | `0 0 0 3px rgba(190,242,100,0.1)` |
| `badge-error` | `0 0 0 3px rgba(248,113,113,0.1)` |

---

## Phase 1: Update `tailwind.config.js`

Full token population with semantic naming. Direct hex values (no CSS vars — NativeWind incompatible).

**Good practices adopted from jolli:**
- Broad content paths covering all source dirs
- Font families with per-weight names (RN loads fonts by name)
- Detailed fontSize scale with lineHeight + letterSpacing
- Semantic color naming in nested objects
- Border radius scale

**Bad practices dropped:**
- No CSS variable references (`hsl(var(--*))`)
- No vague color names (`f`, `grey1`, `grey2`)
- No shadcn-style semantic tokens (card, popover) — overkill for mobile

## Phase 2: Install & Load Fonts

Install `@expo-google-fonts/inter` + `@expo-google-fonts/onest`.

Load in `app/_layout.tsx` via `useFonts`:
- Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold
- Onest_400Regular

## Phase 3: Delete `constants/theme.ts`

Remove entirely. Tailwind config = single source of truth.

## Phase 4: Migrate files importing `Colors`/`Fonts`

Files to update (4 total):
- `hooks/use-theme-color.ts` — **DELETE** (NativeWind handles dark mode via `dark:` prefix)
- `app/(tabs)/_layout.tsx` — remove Colors import, use NativeWind classes for tab bar
- `app/(tabs)/explore.tsx` — replace `Fonts.rounded`/`Fonts.mono` with `className="font-inter"`
- `components/ui/collapsible.tsx` — replace `Colors.light.icon`/`Colors.dark.icon` with NativeWind class

---

## Files Modified
1. `tailwind.config.js` — full token population
2. `package.json` — add font packages
3. `app/_layout.tsx` — load Inter (4 weights) + Onest fonts
4. `constants/theme.ts` — **DELETE**
5. `hooks/use-theme-color.ts` — **DELETE**
6. `app/(tabs)/_layout.tsx` — migrate to NativeWind
7. `app/(tabs)/explore.tsx` — migrate to NativeWind
8. `components/ui/collapsible.tsx` — migrate to NativeWind

## Verification
1. `npm install` — install font packages
2. `npm start` — verify Expo dev server starts
3. Verify `className="bg-background-primary text-content-primary"` renders
4. Verify `className="font-inter text-base"` renders with Inter
5. `npm run lint` — no errors
