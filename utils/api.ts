import { supabase } from '@/utils/supabase'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL

const TAG = '[API]'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  console.log(TAG, 'getAuthHeaders — fetching session…')
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error(TAG, 'getAuthHeaders — supabase error:', error.message)
  }
  const token = data.session?.access_token
  if (!token) {
    console.error(TAG, 'getAuthHeaders — no access_token, session:', data.session === null ? 'null' : 'exists-but-no-token')
    throw new ApiError(401, 'No active session')
  }
  console.log(TAG, 'getAuthHeaders — token obtained (first 10 chars):', token.slice(0, 10))
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  console.log(TAG, `handleResponse — status=${response.status}, ok=${response.ok}, url=${response.url}`)

  if (response.status === 204) {
    return undefined as T
  }

  if (response.status === 401) {
    console.error(TAG, 'handleResponse — 401 received, signing out')
    await supabase.auth.signOut()
    throw new ApiError(401, 'Session expired')
  }

  const body = await response.json()

  if (!response.ok) {
    console.error(TAG, `handleResponse — error ${response.status}:`, JSON.stringify(body))
    throw new ApiError(response.status, body.error ?? 'Request failed')
  }

  console.log(TAG, 'handleResponse — success body:', JSON.stringify(body).slice(0, 200))
  return body as T
}

export const apiGet = async <T>(path: string): Promise<T> => {
  console.log(TAG, `GET ${API_BASE_URL}${path}`)
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'GET', headers })
  return handleResponse<T>(response)
}

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  console.log(TAG, `POST ${API_BASE_URL}${path}`, JSON.stringify(body).slice(0, 200))
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export const apiPatch = async <T>(path: string, body: unknown): Promise<T> => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export const apiPut = async <T>(path: string, body: unknown): Promise<T> => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export const apiDelete = async (path: string): Promise<void> => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers })
  return handleResponse<void>(response)
}
