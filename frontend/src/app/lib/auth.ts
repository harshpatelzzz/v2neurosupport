// Authentication utilities

export interface AuthUser {
  token: string
  role: 'user' | 'therapist'
  user_id: string
  username: string
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') as 'user' | 'therapist' | null
  const user_id = localStorage.getItem('user_id')
  const username = localStorage.getItem('username')

  if (!token || !role || !user_id || !username) {
    return null
  }

  return { token, role, user_id, username }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export function isUser(): boolean {
  return localStorage.getItem('role') === 'user'
}

export function isTherapist(): boolean {
  return localStorage.getItem('role') === 'therapist'
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user_id')
  localStorage.removeItem('username')
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}
