# Fix: Supabase Auth "TypeError: Network request failed"

## Root Cause

1. **Outdated client setup** — Using `AsyncStorage` + `processLock` (old pattern). Current Supabase Expo quickstart uses `expo-sqlite/localStorage/install` (synchronous) with no lock needed
2. **Lock contention** — `processLock` with async storage causes 0ms timeout when `getSession()` and `startAutoRefresh()` race on mount
3. **Error swallowed** — catch blocks hide actual error details

## Fix

### Phase 1: Install `expo-sqlite`

```bash
npx expo install expo-sqlite
```

### Phase 2: Update `utils/supabase.ts`

- Replace `AsyncStorage` → `localStorage` from `expo-sqlite/localStorage/install`
- Remove `processLock` (not needed with sync storage)
- Remove `@react-native-async-storage/async-storage` import

### Phase 3: Improve error visibility in `contexts/auth-context.tsx`

- Log actual error in catch blocks for debugging

### Phase 4: Clean up

- Remove `react-native-url-polyfill` (no longer needed per current quickstart — `expo-sqlite` handles it)
- Remove `@react-native-async-storage/async-storage` if unused elsewhere

## Unresolved

- If network error persists after fix → connectivity issue between device/simulator and Supabase
