import { supabase } from '@/utils/supabase'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) {
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

export const apiGet = async <T>(path: string): Promise<T> => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'GET', headers })
  return handleResponse<T>(response)
}

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
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
