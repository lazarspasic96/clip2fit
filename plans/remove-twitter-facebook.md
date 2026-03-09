# Remove Twitter/X & Facebook Platform Support

## Files to Change

### Phase 1 — Types & Validation
1. `types/api.ts` — Remove `'facebook'` and `'twitter'` from `VALID_PLATFORMS`
2. `types/workout.ts` — Remove `'facebook' | 'twitter'` from `platform` union
3. `utils/url-validation.ts` — Remove `'facebook' | 'twitter'` from `SupportedPlatform`, remove their regex patterns

### Phase 2 — UI Components
4. `components/ui/platform-icons.tsx` — Delete `XIcon` and `FacebookIcon` components
5. `components/processing/platform-badge.tsx` — Remove `XIcon`/`FacebookIcon` imports + case handlers
6. `components/processing/url-input-section.tsx` — Remove `XIcon`/`FacebookIcon` imports + icon rendering

### Phase 3 — Docs (optional, low priority)
7. `docs/api-docs.md` — Remove Facebook/Twitter from validation table
8. `plans/new-apis.md` — Remove from platform response shape
9. `plans/clip-to-fit-analysis.md` — Remove mentions

## Unresolved Questions
- None — straightforward removal.
