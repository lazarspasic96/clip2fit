import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV({ id: 'timezone-sync' })

const LAST_SYNCED_TIMEZONE_KEY = 'last-synced-timezone'
const LAST_SYNCED_AT_KEY = 'last-synced-at'
const LAST_SYNC_ERROR_AT_KEY = 'last-sync-error-at'

export interface TimezoneSyncSnapshot {
  lastSyncedTimezone: string | null
  lastSyncedAt: number | null
  lastTimezoneSyncErrorAt: number | null
}

const parseEpoch = (raw: string | undefined): number | null => {
  if (raw === undefined) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

export const getTimezoneSyncSnapshot = (): TimezoneSyncSnapshot => {
  try {
    const timezone = storage.getString(LAST_SYNCED_TIMEZONE_KEY)
    return {
      lastSyncedTimezone: typeof timezone === 'string' && timezone.length > 0 ? timezone : null,
      lastSyncedAt: parseEpoch(storage.getString(LAST_SYNCED_AT_KEY)),
      lastTimezoneSyncErrorAt: parseEpoch(storage.getString(LAST_SYNC_ERROR_AT_KEY)),
    }
  } catch {
    return {
      lastSyncedTimezone: null,
      lastSyncedAt: null,
      lastTimezoneSyncErrorAt: null,
    }
  }
}

export const markTimezoneSyncSuccess = (timezone: string, timestamp = Date.now()): void => {
  try {
    storage.set(LAST_SYNCED_TIMEZONE_KEY, timezone)
    storage.set(LAST_SYNCED_AT_KEY, String(timestamp))
  } catch {
    // Best-effort diagnostics cache only.
  }
}

export const markTimezoneSyncFailure = (timestamp = Date.now()): void => {
  try {
    storage.set(LAST_SYNC_ERROR_AT_KEY, String(timestamp))
  } catch {
    // Best-effort diagnostics cache only.
  }
}
