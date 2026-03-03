import type { UserProfile } from './auth-api'

const SESSION_KEY = 'lms_user_profile'

export function saveUserProfile(profile: UserProfile) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
}

export function getUserProfile(): UserProfile | null {
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function clearUserProfile() {
  window.localStorage.removeItem(SESSION_KEY)
}
