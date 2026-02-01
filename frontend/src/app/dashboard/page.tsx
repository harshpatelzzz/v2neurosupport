'use client'

import { useState, useEffect } from 'react'
import { getAuthToken } from '../lib/auth'
import { getDashboardApiBase } from './api'
import type { DashboardSummary } from './types'
import { StatCard } from './components/StatCard'
import { ChartCard } from './components/ChartCard'
import { MonthlySessionLine } from './components/charts/MonthlySessionLine'
import { RiskPie } from './components/charts/RiskPie'

export default function DashboardOverviewPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }
    const base = getDashboardApiBase()
    fetch(`${base}/dashboard/user/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized')
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
          <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <p className="font-medium">Could not load dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  const summary = data!

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total sessions" value={summary.total_sessions} />
        <StatCard title="Unique therapists" value={summary.unique_therapists} />
        <StatCard title="Appointments attended" value={summary.appointments_attended} />
        <StatCard
          title="High-risk message count"
          value={summary.high_risk_message_count}
          accent={summary.high_risk_message_count > 0 ? 'red' : 'default'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly session growth">
          <MonthlySessionLine data={summary.monthly_session_growth} />
        </ChartCard>
        <ChartCard title="Risk level distribution">
          <RiskPie data={summary.risk_level_distribution} />
        </ChartCard>
      </div>
    </div>
  )
}
