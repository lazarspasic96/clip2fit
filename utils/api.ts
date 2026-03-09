import { supabase } from '@/utils/supabase'
import { extractTimezoneMeta, observeTimezoneResolution } from '@/utils/timezone-observability'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const maybeLogTimezoneResolution = (path: string, data: unknown) => {
  const { timezoneUsed, timezoneSource } = extractTimezoneMeta(data)
  if (timezoneUsed === null && timezoneSource === null) return
  observeTimezoneResolution(path, data)
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token === undefined || token === null) {
    throw new ApiError(401, 'No active session')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T
  }

  if (response.status === 401) {
    await supabase.auth.signOut()
    throw new ApiError(401, 'Session expired')
  }

  const body = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, body.error ?? 'Request failed')
  }

  return body as T
}

const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const headers = await getAuthHeaders()
  const options: RequestInit = { method, headers }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const data = await handleResponse<T>(response)
  maybeLogTimezoneResolution(path, data)

  return data
}

export const apiGet = async <T>(path: string): Promise<T> => {
  return request<T>('GET', path)
}

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  return request<T>('POST', path, body)
}

export const apiPatch = async <T>(path: string, body: unknown): Promise<T> => {
  return request<T>('PATCH', path, body)
}

export const apiPut = async <T>(path: string, body: unknown): Promise<T> => {
  return request<T>('PUT', path, body)
}

export const apiDelete = async (path: string): Promise<void> => {
  return request<void>('DELETE', path)
}
