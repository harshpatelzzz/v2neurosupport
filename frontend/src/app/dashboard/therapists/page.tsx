'use client'

import { useState, useEffect } from 'react'
import { getAuthToken } from '../../lib/auth'
import { getDashboardApiBase } from '../api'
import type { DashboardTherapists } from '../types'
import { formatDate } from '../types'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { SessionsPerTherapistBar } from '../components/charts/SessionsPerTherapistBar'

export default function DashboardTherapistsPage() {
  const [data, setData] = useState<DashboardTherapists | null>(null)
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
    fetch(`${base}/dashboard/user/therapists`, {
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
        <div className="h-24 w-48 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <p className="font-medium">Could not load therapists data</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  const therapists = data!

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Therapist interaction</h2>

      <StatCard
        title="Unique therapists interacted"
        value={therapists.unique_therapist_count}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Sessions per therapist">
          <SessionsPerTherapistBar data={therapists.sessions_per_therapist} />
        </ChartCard>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Appointments per therapist
          </h3>
          <ul className="space-y-2">
            {therapists.appointments_per_therapist.map((t) => (
              <li
                key={t.name}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
              >
                <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.appointments}</span>
              </li>
            ))}
            {therapists.appointments_per_therapist.length === 0 && (
              <li className="text-sm text-gray-500 dark:text-gray-400">No therapist data yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Last interaction by therapist
        </h3>
        <ul className="space-y-2">
          {therapists.last_interaction_per_therapist.map((t) => (
            <li
              key={t.name}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
            >
              <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(t.last_interaction)}
              </span>
            </li>
          ))}
          {therapists.last_interaction_per_therapist.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400">No interaction data yet</li>
          )}
        </ul>
      </div>
    </div>
  )
}
