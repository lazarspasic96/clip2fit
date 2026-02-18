import Constants from 'expo-constants'

const TAG = '[timezone-observability]'
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

export const API_CONTRACT_VERSION = 'v2-timezone'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
  value !== null && typeof value === 'object' ? (value as UnknownRecord) : {}

const resolveAppVersion = (): string => {
  const version = Constants.expoConfig?.version ?? Constants.nativeAppVersion
  if (typeof version === 'string' && version.length > 0) return version
  return 'unknown'
}

const TELEMETRY_BASE = {
  app_version: resolveAppVersion(),
  api_base_url: API_BASE_URL,
  api_contract_version: API_CONTRACT_VERSION,
}

export const emitTimezoneTelemetryEvent = (
  eventName: 'timezone_resolution_observed' | 'timezone_sync_attempt' | 'timezone_sync_failed',
  payload: UnknownRecord,
): void => {
  console.log(TAG, eventName, JSON.stringify({ ...TELEMETRY_BASE, ...payload }))
}

export const getTimezoneDebugOverride = (): string | null => {
  if (!__DEV__) return null

  const value = (
    process.env.EXPO_PUBLIC_TIMEZONE_OVERRIDE
    ?? process.env.EXPO_PUBLIC_DEBUG_TZ_OVERRIDE
    ?? process.env.EXPO_PUBLIC_DEBUG_TIMEZONE_OVERRIDE
    ?? ''
  ).trim()

  return value.length > 0 ? value : null
}

export const appendTimezoneDebugOverride = (params: URLSearchParams): void => {
  const override = getTimezoneDebugOverride()
  if (override !== null) params.set('tz', override)
}

export const extractTimezoneMeta = (response: unknown): { timezoneUsed: string | null; timezoneSource: string | null } => {
  const meta = asRecord(asRecord(response).meta)
  return {
    timezoneUsed: typeof meta.timezone_used === 'string' ? meta.timezone_used : null,
    timezoneSource: typeof meta.timezone_source === 'string' ? meta.timezone_source : null,
  }
}

export const observeTimezoneResolution = (endpoint: string, response: unknown): void => {
  const { timezoneUsed, timezoneSource } = extractTimezoneMeta(response)
  emitTimezoneTelemetryEvent('timezone_resolution_observed', {
    endpoint,
    timezone_used: timezoneUsed,
    timezone_source: timezoneSource,
    timezone_override: getTimezoneDebugOverride(),
  })
}
