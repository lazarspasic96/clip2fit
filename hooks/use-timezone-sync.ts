import type { ApiProfileResponse } from '@/types/api'
import { queryKeys } from '@/constants/query-keys'
import { apiGet, apiPatch, ApiError } from '@/utils/api'
import { emitTimezoneTelemetryEvent } from '@/utils/timezone-observability'
import {
  getTimezoneSyncSnapshot,
  markTimezoneSyncFailure,
  markTimezoneSyncSuccess,
} from '@/utils/timezone-sync-storage'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

const TZ_SYNC_TAG = '[timezone-sync]'
const TZ_RESUME_SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000
const TZ_SYNC_RETRY_DELAYS_MS = [1000, 3000, 10000] as const

type TimezoneSyncTrigger = 'auth_session_ready' | 'app_resume'

const getDeviceTimeZone = (): string | null => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (typeof timezone === 'string' && timezone.trim().length > 0) return timezone.trim()
  } catch {
    // Fall through to null.
  }
  return null
}

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const shouldRetryTimezoneSync = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status >= 500
  }
  return true
}

const formatSyncError = (error: unknown) => {
  if (error instanceof ApiError) return `${error.status} ${error.message}`
  if (error instanceof Error) return error.message
  return String(error)
}

export const useTimezoneSync = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const timezoneSyncInFlightRef = useRef<Promise<void> | null>(null)

  const getProfileTimezone = async (uid: string): Promise<string | null> => {
    const cachedProfile = queryClient.getQueryData<ApiProfileResponse>(queryKeys.profile.current)
    if (cachedProfile?.id === uid) return cachedProfile.timezone

    try {
      const profile = await queryClient.fetchQuery({
        queryKey: queryKeys.profile.current,
        queryFn: () => apiGet<ApiProfileResponse>('/api/profiles'),
        retry: false,
        staleTime: 0,
      })
      return profile.id === uid ? profile.timezone : null
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw error
    }
  }

  const syncTimezone = async (uid: string, trigger: TimezoneSyncTrigger): Promise<void> => {
    if (timezoneSyncInFlightRef.current !== null) {
      return timezoneSyncInFlightRef.current
    }

    const task = (async () => {
      const snapshot = getTimezoneSyncSnapshot()
      const now = Date.now()

      if (
        trigger === 'app_resume'
        && snapshot.lastSyncedAt !== null
        && (now - snapshot.lastSyncedAt) < TZ_RESUME_SYNC_INTERVAL_MS
      ) {
        return
      }

      const deviceTimezone = getDeviceTimeZone()
      if (deviceTimezone === null) {
        markTimezoneSyncFailure(now)
        emitTimezoneTelemetryEvent('timezone_sync_failed', {
          trigger,
          error: 'missing_device_timezone',
          lastTimezoneSyncErrorAt: now,
        })
        return
      }

      const profileTimezone = await getProfileTimezone(uid)
      const cacheMatches = snapshot.lastSyncedTimezone === deviceTimezone
      const profileMatches = profileTimezone === deviceTimezone

      if (cacheMatches && profileMatches) {
        markTimezoneSyncSuccess(deviceTimezone, now)
        if (__DEV__) {
          console.log(TZ_SYNC_TAG, 'profile already synced:', deviceTimezone)
        }
        return
      }

      let attempt = 1
      while (true) {
        emitTimezoneTelemetryEvent('timezone_sync_attempt', {
          trigger,
          attempt,
          device_timezone: deviceTimezone,
          profile_timezone: profileTimezone,
          cached_timezone: snapshot.lastSyncedTimezone,
        })

        try {
          const updatedProfile = await apiPatch<ApiProfileResponse>('/api/profiles', { timezone: deviceTimezone })
          queryClient.setQueryData(queryKeys.profile.current, updatedProfile)
          queryClient.invalidateQueries({ queryKey: ['stats'] })
          queryClient.invalidateQueries({ queryKey: queryKeys.sessions.last })
          markTimezoneSyncSuccess(deviceTimezone)

          if (__DEV__) {
            console.log(TZ_SYNC_TAG, 'profile timezone updated:', JSON.stringify({
              from: profileTimezone,
              to: deviceTimezone,
              attempt,
              trigger,
            }))
          }
          return
        } catch (error) {
          const retryDelay = TZ_SYNC_RETRY_DELAYS_MS[attempt - 1]
          const retryable = shouldRetryTimezoneSync(error)

          if (!retryable || retryDelay === undefined) {
            const message = formatSyncError(error)
            const failedAt = Date.now()
            markTimezoneSyncFailure(failedAt)
            emitTimezoneTelemetryEvent('timezone_sync_failed', {
              trigger,
              attempt,
              error: message,
              retryable,
              lastTimezoneSyncErrorAt: failedAt,
            })
            return
          }

          await wait(retryDelay)
          attempt += 1
        }
      }
    })()

    timezoneSyncInFlightRef.current = task
    try {
      await task
    } finally {
      timezoneSyncInFlightRef.current = null
    }
  }

  useEffect(() => {
    if (typeof userId !== 'string' || userId.length === 0) return

    void syncTimezone(userId, 'auth_session_ready')
  }, [userId])

  useEffect(() => {
    if (typeof userId !== 'string' || userId.length === 0) return

    let previousAppState: AppStateStatus = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInBackground = previousAppState !== 'active'
      previousAppState = nextAppState

      if (wasInBackground && nextAppState === 'active') {
        void syncTimezone(userId, 'app_resume')
      }
    })

    return () => {
      subscription.remove()
    }
  }, [userId])
}
