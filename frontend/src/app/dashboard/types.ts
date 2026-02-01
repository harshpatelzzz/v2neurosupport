// Dashboard API response types (backend-derived only)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/** Manual fallback when Intl might throw (e.g. dateStyle/timeStyle unsupported). */
function formatDateManual(date: Date, dateOnly: boolean): string {
  const y = date.getFullYear()
  const m = MONTHS[date.getMonth()]
  const d = date.getDate()
  if (dateOnly) return `${m} ${d}, ${y}`
  const h = date.getHours()
  const min = date.getMinutes()
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${m} ${d}, ${y}, ${h12}:${min.toString().padStart(2, '0')} ${ampm}`
}

/** Safely format a date string; returns "—" for null/undefined/invalid. Never uses toLocaleDateString. */
export function formatDate(
  value: string | number | Date | null | undefined,
  options?: { dateOnly?: boolean }
): string {
  if (value == null || value === '') return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  try {
    if (options?.dateOnly) {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return formatDateManual(date, options?.dateOnly ?? false)
  }
}

export interface DashboardSummary {
  total_sessions: number
  unique_therapists: number
  appointments_attended: number
  high_risk_message_count: number
  monthly_session_growth: { month: string; sessions: number }[]
  risk_level_distribution: { name: string; value: number }[]
}

export interface DashboardEmotions {
  emotion_distribution: { name: string; value: number }[]
  avg_risk_over_time: { month: string; avgRiskScore: number }[]
  emotion_frequency_per_month: { month: string; emotion: string; count: number }[]
}

export interface DashboardSession {
  session_id: string
  status: string
  started_at: string | null
  end_date: string | null
  therapist_assigned: string | null
}

export interface DashboardTherapists {
  unique_therapist_count: number
  sessions_per_therapist: { name: string; sessions: number }[]
  appointments_per_therapist: { name: string; appointments: number }[]
  last_interaction_per_therapist: { name: string; last_interaction: string | null }[]
}

export const EMOTION_COLORS: Record<string, string> = {
  joy: '#22c55e',
  sadness: '#3b82f6',
  anger: '#ef4444',
  fear: '#8b5cf6',
  surprise: '#eab308',
  neutral: '#6b7280',
  anxiety: '#f97316',
  stress: '#ec4899',
  depression: '#6366f1',
}

export const RISK_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
}
