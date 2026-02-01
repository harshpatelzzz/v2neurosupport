export function getDashboardApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

export async function fetchDashboard<T>(
  path: string,
  token: string | null
): Promise<T> {
  const base = getDashboardApiBase()
  const url = `${base}${path}`
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { headers, cache: 'no-store' })
  if (res.status === 401) throw new Error('Unauthorized')
  if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`)
  return res.json()
}
