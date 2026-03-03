export type UserRole = 'employee' | 'manager'

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: {
    message?: string
  }
}

interface AuthPayload {
  fullName?: string
  role: UserRole
  autoCreate?: boolean
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function postAuth<T>(path: string, idToken: string, payload: AuthPayload): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as ApiEnvelope<T>

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || 'Authentication request failed.')
  }

  return data.data
}

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export function registerUserProfile(idToken: string, payload: AuthPayload) {
  return postAuth<UserProfile>('/v1/auth/register', idToken, payload)
}

export function loginUserSession(idToken: string, payload: AuthPayload) {
  return postAuth<UserProfile>('/v1/auth/login', idToken, payload)
}
